/**
 * Booking helpers shared by Convex queries and mutations.
 * All dates are "YYYY-MM-DD" strings and all times are "HH:mm" strings
 * expressed in the clinic time zone, so there is no client-timezone drift.
 */

export const CLINIC_TIME_ZONE = "Asia/Karachi";
export const BOOKING_WINDOW_DAYS = 7;

export const DEFAULT_WORK_DAY_START = "08:00";
export const DEFAULT_WORK_DAY_END = "17:00";
export const DEFAULT_SLOT_MINUTES = 30;

/** Appointments in these statuses occupy a slot. */
export const SLOT_BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

export function isSlotBlockingStatus(status: string): boolean {
    return (SLOT_BLOCKING_STATUSES as readonly string[]).includes(status);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

function parseDate(date: string): [number, number, number] {
    const [year, month, day] = date.split("-").map(Number);
    return [year, month, day];
}

export function isValidDateString(value: string): boolean {
    if (!DATE_PATTERN.test(value)) return false;
    const [year, month, day] = parseDate(value);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

export function isValidTimeString(value: string): boolean {
    return TIME_PATTERN.test(value);
}

export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
    return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

export function addDays(date: string, days: number): string {
    const [year, month, day] = parseDate(date);
    return new Date(Date.UTC(year, month - 1, day + days))
        .toISOString()
        .slice(0, 10);
}

/** Current date and minutes-since-midnight in the clinic time zone. */
export function getClinicNow(nowMs: number = Date.now()): {
    date: string;
    minutes: number;
} {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: CLINIC_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(nowMs));

    const get = (type: string) =>
        parts.find((part) => part.type === type)?.value ?? "00";

    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
    };
}

/** The dates a patient may book, starting today. */
export function getBookingDates(today: string): string[] {
    return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, index) =>
        addDays(today, index),
    );
}

export function getWeekdayLabel(date: string): string {
    const [year, month, day] = parseDate(date);
    return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

/** "14:30" -> "2.30 pm" (matches the design). */
export function formatSlotLabel(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}.${pad(minutes)} ${suffix}`;
}

interface ScheduleFields {
    workDayStart?: string;
    workDayEnd?: string;
    slotMinutes?: number;
}

/** Returns every slot start time for a doctor, falling back to defaults. */
export function getDoctorSlotTimes(doctor: ScheduleFields): string[] {
    let start = doctor.workDayStart ?? DEFAULT_WORK_DAY_START;
    let end = doctor.workDayEnd ?? DEFAULT_WORK_DAY_END;
    let step = doctor.slotMinutes ?? DEFAULT_SLOT_MINUTES;

    const invalid =
        !isValidTimeString(start) ||
        !isValidTimeString(end) ||
        timeToMinutes(end) <= timeToMinutes(start) ||
        !Number.isInteger(step) ||
        step < 5 ||
        step > 240;

    if (invalid) {
        start = DEFAULT_WORK_DAY_START;
        end = DEFAULT_WORK_DAY_END;
        step = DEFAULT_SLOT_MINUTES;
    }

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const slots: string[] = [];

    for (let t = startMinutes; t + step <= endMinutes; t += step) {
        slots.push(minutesToTime(t));
    }

    return slots;
}
