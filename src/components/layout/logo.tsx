import Link from "next/link";

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2" aria-label="Prescripto home">
            <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="34" height="34" rx="9" fill="#5F6FFF" />
                <path
                    d="M20 9c.9 5.6 3.4 8.1 9 9-5.6.9-8.1 3.4-9 9-.9-5.6-3.4-8.1-9-9 5.6-.9 8.1-3.4 9-9Z"
                    fill="#fff"
                />
                <circle cx="37" cy="4" r="2" fill="#5F6FFF" />
            </svg>
            <span className="text-[26px] font-semibold tracking-tight text-[#0A0A5C]">
                Prescripto
            </span>
        </Link>
    );
}