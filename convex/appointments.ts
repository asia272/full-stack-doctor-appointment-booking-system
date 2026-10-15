import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import {
    formatSlotLabel,
    getBookingDates,
    getClinicNow,
    getDoctorSlotTimes,
    getWeekdayLabel,
    isSlotBlockingStatus,
    isValidDateString,
    isValidTimeString,
    timeToMinutes,
} from "./lib/booking";

const MAX_REASON_LENGTH = 500;

/**
 * The bookable days (today + 6 more), computed in clinic time
 * so every visitor sees the same calendar.
 */
export const getBookingDays = query({
    args: {},
    handler: async () => {
        const today = getClinicNow().date;

        return getBookingDates(today).map((date) => ({
            date,
            weekday: getWeekdayLabel(date),
            dayOfMonth: Number(date.slice(8, 10)),
        }));
    },
});

/**
 * Every slot for a doctor on a date, flagged available or not.
 * Reactive: when someone books, other viewers see the slot disable live.
 */
export const getAvailableSlots = query({
    args: {
        doctorId: v.id("doctors"),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        if (!isValidDateString(args.date)) return [];

        const doctor = await ctx.db.get(args.doctorId);
        if (!doctor || !doctor.isActive) return [];

        const now = getClinicNow();
        if (!getBookingDates(now.date).includes(args.date)) return [];

        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_doctor_and_date", (q) =>
                q.eq("doctorId", args.doctorId).eq("appointmentDate", args.date),
            )
            .take(500);

        const taken = new Set(
            appointments
                .filter((item) => isSlotBlockingStatus(item.status))
                .map((item) => item.appointmentTime),
        );

        return getDoctorSlotTimes(doctor).map((time) => {
            const isPast =
                args.date === now.date && timeToMinutes(time) <= now.minutes;

            return {
                time,
                label: formatSlotLabel(time),
                available: !taken.has(time) && !isPast,
            };
        });
    },
});

/**
 * Books a slot. Internal mutation: it can only be called by your Next.js
 * server (through the Convex admin client) after the patient's session
 * has been verified, never directly from a browser.
 *
 * Convex mutations are serializable transactions, so the check-then-insert
 * below cannot double-book even under concurrent requests.
 */
export const createAppointment = internalMutation({
    args: {
        patientId: v.id("users"),
        doctorId: v.id("doctors"),
        appointmentDate: v.string(),
        appointmentTime: v.string(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { appointmentDate, appointmentTime } = args;
        const reason = args.reason?.trim() || undefined;

        if (!isValidDateString(appointmentDate)) {
            throw new ConvexError("INVALID_DATE");
        }
        if (!isValidTimeString(appointmentTime)) {
            throw new ConvexError("INVALID_TIME");
        }
        if (reason && reason.length > MAX_REASON_LENGTH) {
            throw new ConvexError("INVALID_REASON");
        }

        const patient = await ctx.db.get(args.patientId);
        if (!patient || patient.role !== "USER" || !patient.isActive) {
            throw new ConvexError("INVALID_PATIENT");
        }

        const doctor = await ctx.db.get(args.doctorId);
        if (!doctor || !doctor.isActive) {
            throw new ConvexError("DOCTOR_UNAVAILABLE");
        }

        const doctorUser = await ctx.db.get(doctor.userId);
        if (!doctorUser || !doctorUser.isActive) {
            throw new ConvexError("DOCTOR_UNAVAILABLE");
        }

        const now = getClinicNow();

        if (!getBookingDates(now.date).includes(appointmentDate)) {
            throw new ConvexError("DATE_OUT_OF_RANGE");
        }

        if (!getDoctorSlotTimes(doctor).includes(appointmentTime)) {
            throw new ConvexError("INVALID_SLOT");
        }

        if (
            appointmentDate === now.date &&
            timeToMinutes(appointmentTime) <= now.minutes
        ) {
            throw new ConvexError("SLOT_IN_PAST");
        }

        const doctorSlot = await ctx.db
            .query("appointments")
            .withIndex("by_doctor_date_and_time", (q) =>
                q
                    .eq("doctorId", args.doctorId)
                    .eq("appointmentDate", appointmentDate)
                    .eq("appointmentTime", appointmentTime),
            )
            .take(20);

        if (doctorSlot.some((item) => isSlotBlockingStatus(item.status))) {
            throw new ConvexError("SLOT_TAKEN");
        }

        const patientSlot = await ctx.db
            .query("appointments")
            .withIndex("by_patient_date_and_time", (q) =>
                q
                    .eq("patientId", args.patientId)
                    .eq("appointmentDate", appointmentDate)
                    .eq("appointmentTime", appointmentTime),
            )
            .take(20);

        if (patientSlot.some((item) => isSlotBlockingStatus(item.status))) {
            throw new ConvexError("PATIENT_ALREADY_BOOKED");
        }

        const timestamp = Date.now();

        const appointmentId = await ctx.db.insert("appointments", {
            patientId: args.patientId,
            doctorId: args.doctorId,
            appointmentDate,
            appointmentTime,
            consultationFee: doctor.consultationFee,
            ...(reason ? { reason } : {}),
            status: "PENDING",
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return { appointmentId };
    },
});
