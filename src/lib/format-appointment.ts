const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    if (!year || !month || !day) return isoDate;
    return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatDateTime(isoDate: string, timeLabel: string): string {
    return `${formatDate(isoDate)}, ${timeLabel}`;
}

export function formatMoney(amount: number): string {
    return `$${amount.toLocaleString("en-US")}`;
}
export function appointmentSummary(a: {
    patient: { fullName: string } | null;
    doctor: { fullName: string } | null;
    appointmentDate: string;
    timeLabel: string;
}): string {
    const patient = a.patient?.fullName ?? "The patient";
    const doctor = a.doctor?.fullName ?? "the doctor";
    return `${patient} with Dr. ${doctor} on ${formatDate(a.appointmentDate)}, ${a.timeLabel}.`;
}