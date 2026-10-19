import { ConvexError, v } from "convex/values";
import {
    internalMutation,
    internalQuery,
    type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { withAppointmentDetails } from "./lib/appointmentDetails";

const LIST_LIMIT = 200;
const COUNT_LIMIT = 5000;

/** Finds the doctor profile that belongs to a logged-in user account. */
async function getDoctorByUserId(ctx: QueryCtx, userId: Id<"users">) {
    const doctor = await ctx.db
        .query("doctors")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

    if (!doctor) throw new ConvexError("DOCTOR_NOT_FOUND");
    return doctor;
}

/** Earnings, appointment and patient totals, plus the latest bookings. */
export const getDoctorDashboardData = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const doctor = await getDoctorByUserId(ctx, args.userId);

        const [all, latest] = await Promise.all([
            ctx.db
                .query("appointments")
                .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
                .take(COUNT_LIMIT),
            ctx.db
                .query("appointments")
                .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
                .order("desc")
                .take(5),
        ]);

        // Counted once per appointment:
        // - COMPLETED visits (cash or online), or
        // - paid online and still active (PENDING / CONFIRMED).
        // CANCELLED and REJECTED never count, because paid ones need a refund.
        const earnings = all
            .filter(
                (a) =>
                    a.status === "COMPLETED" ||
                    (a.paymentStatus === "PAID" &&
                        (a.status === "PENDING" || a.status === "CONFIRMED")),
            )
            .reduce((sum, a) => sum + a.consultationFee, 0);

        const patients = new Set(all.map((a) => a.patientId as string)).size;

        return {
            stats: { earnings, appointments: all.length, patients },
            latestAppointments: await withAppointmentDetails(ctx, latest),
        };
    },
});

/** Only this doctor's appointments, newest booking first. */
export const listAppointmentsForDoctor = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const doctor = await getDoctorByUserId(ctx, args.userId);

        const rows = await ctx.db
            .query("appointments")
            .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
            .order("desc")
            .take(LIST_LIMIT);

        return withAppointmentDetails(ctx, rows);
    },
});

/**
 * Doctor moves one of THEIR appointments forward:
 *   PENDING   -> CONFIRMED | REJECTED
 *   CONFIRMED -> COMPLETED | CANCELLED
 */
export const updateAppointmentStatusByDoctor = internalMutation({
    args: {
        userId: v.id("users"),
        appointmentId: v.id("appointments"),
        status: v.union(
            v.literal("CONFIRMED"),
            v.literal("REJECTED"),
            v.literal("COMPLETED"),
            v.literal("CANCELLED"),
        ),
    },
    handler: async (ctx, args) => {
        const doctor = await getDoctorByUserId(ctx, args.userId);

        const appointment = await ctx.db.get(args.appointmentId);
        if (!appointment) throw new ConvexError("NOT_FOUND");

        // A doctor can never touch another doctor's booking.
        if (appointment.doctorId !== doctor._id) {
            throw new ConvexError("FORBIDDEN");
        }

        const allowed: Record<string, string[]> = {
            PENDING: ["CONFIRMED", "REJECTED"],
            CONFIRMED: ["COMPLETED", "CANCELLED"],
        };

        if (!allowed[appointment.status]?.includes(args.status)) {
            throw new ConvexError("INVALID_TRANSITION");
        }

        const now = Date.now();

        await ctx.db.patch(args.appointmentId, {
            status: args.status,
            updatedAt: now,
            // A cash visit is paid when the doctor completes it.
            // Online payments are already PAID by the Stripe webhook.
            ...(args.status === "COMPLETED" &&
                appointment.paymentStatus !== "PAID"
                ? {
                    paymentMethod: "CASH" as const,
                    paymentStatus: "PAID" as const,
                    paidAt: now,
                }
                : {}),
        });

        return { appointmentId: args.appointmentId as string };
    },
});