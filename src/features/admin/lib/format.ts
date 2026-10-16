const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function ordinal(day: number): string {
    const lastTwo = day % 100;
    if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;

    switch (day % 10) {
        case 1:
            return `${day}st`;
        case 2:
            return `${day}nd`;
        case 3:
            return `${day}rd`;
        default:
            return `${day}th`;
    }
}

/** "2026-10-20" → "20th October, 2026" */
export function formatAppointmentDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day || month > 12) return date;

    return `${ordinal(day)} ${MONTHS[month - 1]}, ${year}`;
}

const feeFormatter = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
});

export function formatFee(amount: number): string {
    return feeFormatter.format(amount);
}