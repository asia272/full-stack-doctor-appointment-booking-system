/** Change these two to switch currency / locale site-wide. */
export const CURRENCY = "PKR";
export const CURRENCY_LOCALE = "en-PK";

const feeFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
});

export function formatFee(amount: number): string {
    return feeFormatter.format(amount);
}

export function formatExperience(years: number): string {
    return `${years} ${years === 1 ? "Year" : "Years"}`;
}

/** "Dr. Ahmed Raza" -> "AR" (used when a doctor has no photo). */
export function getInitials(fullName: string): string {
    const words = fullName
        .replace(/^dr\.?\s+/i, "")
        .split(/\s+/)
        .filter(Boolean);

    return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
}
