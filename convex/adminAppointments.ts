import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { isSlotBlockingStatus } from "./lib/booking";
import { withAppointmentDetails } from "./lib/appointmentDetails";

const LIST_LIMIT = 200;
// Counting reads documents, so cap it. Switch to a stored counter past ~5k rows.
const COUNT_LIMIT = 5000;

/** Totals plus the 5 most recent bookings, for the dashboard. */
export const getAdminDashboardData = internalQuery({
    args: {},
    handler: async (ctx) => {
        const [doctors, patients, appointments, latest] = await Promise.all([
            ctx.db.query("doctors").take(COUNT_LIMIT),
            ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", "USER"))
                .take(COUNT_LIMIT),
            ctx.db.query("appointments").take(COUNT_LIMIT),
            ctx.db.query("appointments").order("desc").take(5),
        ]);

        return {
            stats: {
                doctors: doctors.length,
                appointments: appointments.length,
                patients: patients.length,
            },
            latestAppointments: await withAppointmentDetails(ctx, latest),
        };
    },
});

/** All appointments, newest booking first. */
export const listAppointmentsForAdmin = internalQuery({
    args: {},
    handler: async (ctx) => {
        const rows = await ctx.db
            .query("appointments")
            .order("desc")
            .take(LIST_LIMIT);

        return withAppointmentDetails(ctx, rows);
    },
});

/**
 * Cancels any PENDING or CONFIRMED appointment. Unlike the patient version,
 * the admin may also cancel one whose time has passed (for example a no-show).
 */
export const cancelAppointmentByAdmin = internalMutation({
    args: { appointmentId: v.id("appointments") },
    handler: async (ctx, args) => {
        const appointment = await ctx.db.get(args.appointmentId);
        if (!appointment) throw new ConvexError("NOT_FOUND");

        if (!isSlotBlockingStatus(appointment.status)) {
            throw new ConvexError("NOT_CANCELLABLE");
        }

        await ctx.db.patch(args.appointmentId, {
            status: "CANCELLED",
            updatedAt: Date.now(),
        });

        return { appointmentId: args.appointmentId as string };
    },
});