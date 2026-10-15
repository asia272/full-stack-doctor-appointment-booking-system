const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

/** "2026-10-20" -> "20, October, 2026" (matches the design). */
export function formatAppointmentDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);
    return `${day}, ${MONTHS[month - 1] ?? ""}, ${year}`;
}

/** "14:30" -> "2:30 PM" */
export function formatAppointmentTime(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
