import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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

/**
 * All appointments of one patient with doctor details.
 * Upcoming (cancellable) appointments come first, soonest first;
 * everything else follows, newest first.
 * Internal: call it from your server after verifying the session.
 */
export const listMyAppointments = internalQuery({
    args: { patientId: v.id("users") },
    handler: async (ctx, args) => {
        const rows = await ctx.db
            .query("appointments")
            .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
            .order("desc")
            .take(200);

        const now = getClinicNow();

        const doctorCache = new Map<
            Id<"doctors">,
            Promise<{
                id: string;
                fullName: string;
                specialty: string;
                address: string;
                imageUrl: string | null;
            } | null>
        >();

        function loadDoctor(doctorId: Id<"doctors">) {
            let pending = doctorCache.get(doctorId);

            if (!pending) {
                pending = (async () => {
                    const doctor = await ctx.db.get(doctorId);
                    if (!doctor) return null;

                    const user = await ctx.db.get(doctor.userId);
                    if (!user) return null;

                    const imageUrl = user.imageStorageId
                        ? await ctx.storage.getUrl(user.imageStorageId)
                        : null;

                    return {
                        id: doctor._id as string,
                        fullName: user.fullName,
                        specialty: doctor.specialty,
                        address: doctor.address,
                        imageUrl,
                    };
                })();

                doctorCache.set(doctorId, pending);
            }

            return pending;
        }

        const items = await Promise.all(
            rows.map(async (row) => {
                const isUpcoming =
                    isSlotBlockingStatus(row.status) &&
                    (row.appointmentDate > now.date ||
                        (row.appointmentDate === now.date &&
                            timeToMinutes(row.appointmentTime) > now.minutes));

                return {
                    id: row._id as string,
                    status: row.status,
                    appointmentDate: row.appointmentDate,
                    appointmentTime: row.appointmentTime,
                    consultationFee: row.consultationFee,
                    reason: row.reason ?? null,
                    canCancel: isUpcoming,
                    paymentMethod: row.paymentMethod ?? ("CASH" as const),
                    paymentStatus: row.paymentStatus ?? ("UNPAID" as const),
                    doctor: await loadDoctor(row.doctorId),
                };
            }),
        );

        const when = (item: (typeof items)[number]) =>
            `${item.appointmentDate} ${item.appointmentTime}`;

        const upcoming = items
            .filter((item) => item.canCancel)
            .sort((a, b) => when(a).localeCompare(when(b)));

        const others = items
            .filter((item) => !item.canCancel)
            .sort((a, b) => when(b).localeCompare(when(a)));

        return [...upcoming, ...others];
    },
});

/**
 * Cancels an upcoming appointment that belongs to the patient.
 * Cancelling frees the slot because only PENDING and CONFIRMED block slots.
 */
export const cancelAppointment = internalMutation({
    args: {
        patientId: v.id("users"),
        appointmentId: v.id("appointments"),
    },
    handler: async (ctx, args) => {
        const appointment = await ctx.db.get(args.appointmentId);

        // Same error for "missing" and "not yours" so ids cannot be probed.
        if (!appointment || appointment.patientId !== args.patientId) {
            throw new ConvexError("NOT_FOUND");
        }

        if (!isSlotBlockingStatus(appointment.status)) {
            throw new ConvexError("NOT_CANCELLABLE");
        }

        const now = getClinicNow();
        const isPast =
            appointment.appointmentDate < now.date ||
            (appointment.appointmentDate === now.date &&
                timeToMinutes(appointment.appointmentTime) <= now.minutes);

        if (isPast) throw new ConvexError("ALREADY_PAST");

        await ctx.db.patch(args.appointmentId, {
            status: "CANCELLED",
            updatedAt: Date.now(),
        });

        return { appointmentId: args.appointmentId as string };
    },
});
