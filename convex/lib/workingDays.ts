// 0 = Sunday, 1 = Monday, ... 6 = Saturday
export const DEFAULT_WORKING_DAYS: number[] = [1, 2, 3, 4, 5, 6]; // Sunday off

export const WEEKDAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type AvailabilityDoctor = {
    workingDays?: number[];
    daysOff?: string[];
};

/** Weekday of a "YYYY-MM-DD" string. Uses UTC so server timezone never shifts the day. */
export function getWeekday(dateStr: string): number {
    if (!DATE_REGEX.test(dateStr)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (
        date.getUTCFullYear() !== y ||
        date.getUTCMonth() !== m - 1 ||
        date.getUTCDate() !== d
    ) {
        throw new Error("Invalid calendar date.");
    }
    return date.getUTCDay();
}

/** Returns null if the doctor works that day, otherwise the reason text. */
export function getUnavailableReason(
    doctor: AvailabilityDoctor,
    dateStr: string,
): string | null {
    const workingDays = doctor.workingDays ?? DEFAULT_WORKING_DAYS;
    const weekday = getWeekday(dateStr);

    if (!workingDays.includes(weekday)) {
        return `The doctor is off on ${WEEKDAY_NAMES[weekday]}.`;
    }
    if (doctor.daysOff?.includes(dateStr)) {
        return "The doctor is on leave on this date.";
    }
    return null;
}

export function isDoctorWorking(
    doctor: AvailabilityDoctor,
    dateStr: string,
): boolean {
    return getUnavailableReason(doctor, dateStr) === null;
}

/** Validates and cleans working days (unique, sorted, 0-6, at least 1). */
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

/** Validates and cleans days off (unique, sorted, valid dates). */
export function normalizeDaysOff(dates: string[]): string[] {
    const unique = Array.from(new Set(dates));
    unique.forEach((d) => getWeekday(d)); // throws if invalid
    return unique.sort();
}