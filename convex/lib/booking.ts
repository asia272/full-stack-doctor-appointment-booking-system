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

// NEW: 0 = Sunday, 1 = Monday ... 6 = Saturday. Sunday is off by default.
export const DEFAULT_WORKING_DAYS: number[] = [1, 2, 3, 4, 5, 6];

/** Appointments in these statuses occupy a slot. */
export const SLOT_BLOCKING_STATUSES = ["PENDING", "CONFIRMED"] as const;

export function isSlotBlockingStatus(status: string): boolean {
    return (SLOT_BLOCKING_STATUSES as readonly string[]).includes(status);
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
// NEW: full names used in error messages.
const WEEKDAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

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

// --------------------------------------------------
// NEW: WORKING DAYS / DAYS OFF
// --------------------------------------------------

/** NEW: weekday number of a "YYYY-MM-DD" date. 0 = Sunday ... 6 = Saturday. */
export function getWeekdayIndex(date: string): number {
    const [year, month, day] = parseDate(date);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

interface AvailabilityFields {
    workingDays?: number[];
    daysOff?: string[];
}

/** NEW: the doctor's working weekdays, falling back to Mon-Sat if missing or invalid. */
function resolveWorkingDays(doctor: AvailabilityFields): number[] {
    const days = doctor.workingDays;
    const valid =
        Array.isArray(days) &&
        days.length > 0 &&
        days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
    return valid ? (days as number[]) : DEFAULT_WORKING_DAYS;
}

/** NEW: returns null if the doctor works on this date, otherwise the reason. */
export function getUnavailableReason(
    doctor: AvailabilityFields,
    date: string,
): string | null {
    if (!isValidDateString(date)) {
        return "Invalid date.";
    }

    const weekday = getWeekdayIndex(date);

    if (!resolveWorkingDays(doctor).includes(weekday)) {
        return `The doctor is off on ${WEEKDAY_NAMES[weekday]}.`;
    }

    if (doctor.daysOff?.includes(date)) {
        return "The doctor is on leave on this date.";
    }

    return null;
}

/** NEW: true if the doctor works on this date. */
export function isDoctorWorking(
    doctor: AvailabilityFields,
    date: string,
): boolean {
    return getUnavailableReason(doctor, date) === null;
}

/** NEW: booking dates (same 7-day window) with the doctor's days off removed. */
export function getBookableDates(
    today: string,
    doctor: AvailabilityFields,
): string[] {
    return getBookingDates(today).filter((date) =>
        isDoctorWorking(doctor, date),
    );
}

/** NEW: validates and cleans working days (unique, sorted, 0-6, at least 1). */
export function normalizeWorkingDays(days: number[]): number[] {
    const unique = Array.from(new Set(days));
    if (unique.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
        throw new Error("Working days must be numbers from 0 (Sun) to 6 (Sat).");
    }
    if (unique.length === 0) {
        throw new Error("A doctor must work at least one day per week.");
    }
    return unique.sort((a, b) => a - b);
}

/** NEW: validates and cleans days off (unique, sorted, valid dates). */
export function normalizeDaysOff(dates: string[]): string[] {
    const unique = Array.from(new Set(dates));
    if (unique.some((d) => !isValidDateString(d))) {
        throw new Error("Days off must be valid dates in YYYY-MM-DD format.");
    }
    return unique.sort();
}

// --------------------------------------------------
// SLOTS
// --------------------------------------------------

// CHANGED: added workingDays and daysOff (both optional).
interface ScheduleFields {
    workDayStart?: string;
    workDayEnd?: string;
    slotMinutes?: number;
    workingDays?: number[];
    daysOff?: string[];
}

/**
 * Returns every slot start time for a doctor, falling back to defaults.
 *
 * CHANGED: optional second argument `date`.
 * - Not passed: works exactly as before.
 * - Passed: returns [] when the doctor is off on that date.
 */
export function getDoctorSlotTimes(
    doctor: ScheduleFields,
    date?: string,
): string[] {
    // NEW: no slots on days off.
    if (date !== undefined && !isDoctorWorking(doctor, date)) {
        return [];
    }

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