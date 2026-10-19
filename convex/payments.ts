import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { formatSlotLabel } from "./lib/booking";

/**
 * Everything Stripe needs to charge for an appointment.
 * Checks the appointment belongs to this patient and can still be paid.
 */
export const getPayableAppointment = internalQuery({
    args: {
        patientId: v.id("users"),
        appointmentId: v.id("appointments"),
    },
    handler: async (ctx, args) => {
        const appointment = await ctx.db.get(args.appointmentId);

        if (!appointment || appointment.patientId !== args.patientId) {
            throw new ConvexError("NOT_FOUND");
        }

        if (
            appointment.status !== "PENDING" &&
            appointment.status !== "CONFIRMED"
        ) {
            throw new ConvexError("NOT_PAYABLE");
        }

        if (appointment.paymentStatus === "PAID") {
            throw new ConvexError("ALREADY_PAID");
        }

        const patient = await ctx.db.get(args.patientId);
        const doctor = await ctx.db.get(appointment.doctorId);
        const doctorUser = doctor ? await ctx.db.get(doctor.userId) : null;

        if (!patient || !doctor || !doctorUser) {
            throw new ConvexError("NOT_FOUND");
        }

        return {
            id: appointment._id as string,
            fee: appointment.consultationFee,
            patientEmail: patient.email,
            doctorName: doctorUser.fullName,
            specialty: doctor.specialty,
            appointmentDate: appointment.appointmentDate,
            timeLabel: formatSlotLabel(appointment.appointmentTime),
        };
    },
});

/**
 * Called by the Stripe webhook only. Idempotent: Stripe may send the same
 * event more than once, and a second call changes nothing.
 */
export const markAppointmentPaid = internalMutation({
    args: {
        appointmentId: v.string(),
        sessionId: v.string(),
        paymentIntentId: v.optional(v.string()),
        amountTotal: v.number(), // in cents
    },
    handler: async (ctx, args) => {
        const id = ctx.db.normalizeId("appointments", args.appointmentId);
        if (!id) return { outcome: "IGNORED" as const };

        const appointment = await ctx.db.get(id);
        if (!appointment) return { outcome: "IGNORED" as const };

        if (appointment.paymentStatus === "PAID") {
            return { outcome: "ALREADY_PAID" as const };
        }

        // Never mark paid if the amount is not what the appointment costs.
        if (args.amountTotal !== Math.round(appointment.consultationFee * 100)) {
            return { outcome: "AMOUNT_MISMATCH" as const };
        }

        const now = Date.now();

        await ctx.db.patch(id, {
            paymentMethod: "ONLINE",
            paymentStatus: "PAID",
            stripeCheckoutSessionId: args.sessionId,
            ...(args.paymentIntentId
                ? { stripePaymentIntentId: args.paymentIntentId }
                : {}),
            paidAt: now,
            updatedAt: now,
        });

        // Paid but already cancelled/rejected: needs a manual refund.
        if (
            appointment.status === "CANCELLED" ||
            appointment.status === "REJECTED"
        ) {
            return { outcome: "PAID_BUT_INACTIVE" as const };
        }

        return { outcome: "PAID" as const };
    },
});