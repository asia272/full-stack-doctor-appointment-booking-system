import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Payment cancelled",
    robots: { index: false, follow: false },
};

export default function PaymentCancelledPage() {
    return (
        <section className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center sm:py-24">
            <span className="flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500">
                <XCircle className="size-10" aria-hidden="true" />
            </span>

            <h1 className="text-2xl font-medium text-[#1F2937] sm:text-3xl">
                Payment cancelled
            </h1>

            <p className="text-sm leading-6 text-[#4B5563]">
                No money was taken. Your appointment is still booked, and you can
                pay online later from your appointments page.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                    href="/my-appointments"
                    className="rounded-full bg-primary px-8 py-3 text-sm text-white transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    Back to my appointments
                </Link>
                <Link
                    href="/doctors"
                    className="rounded-full border border-[#ADADAD] px-8 py-3 text-sm text-[#4B5563] transition-colors hover:border-primary hover:text-primary"
                >
                    Browse doctors
                </Link>
            </div>
        </section>
    );
}