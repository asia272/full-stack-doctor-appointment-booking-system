import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
    title: "Payment",
    robots: { index: false, follow: false },
};

type PageProps = {
    searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const raw = Array.isArray(params.session_id)
        ? params.session_id[0]
        : params.session_id;

    let paid = false;
    let amount: string | null = null;

    // Only used to show a message. The webhook is what marks the appointment paid.
    if (raw && raw.startsWith("cs_") && raw.length < 200) {
        try {
            const session = await getStripe().checkout.sessions.retrieve(raw);
            paid = session.payment_status === "paid";

            if (paid && session.amount_total !== null) {
                amount = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: (session.currency ?? "usd").toUpperCase(),
                }).format(session.amount_total / 100);
            }
        } catch {
            // Fall through to the neutral message below.
        }
    }

    const Icon = paid ? CheckCircle2 : Clock;

    return (
        <section className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center sm:py-24">
            <span
                className={
                    paid
                        ? "flex size-20 items-center justify-center rounded-full bg-green-50 text-green-600"
                        : "flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"
                }
            >
                <Icon className="size-10" aria-hidden="true" />
            </span>

            <h1 className="text-2xl font-medium text-[#1F2937] sm:text-3xl">
                {paid ? "Payment successful" : "Payment is being confirmed"}
            </h1>

            <p className="text-sm leading-6 text-[#4B5563]">
                {paid
                    ? `Thank you! ${amount ? `We received ${amount}. ` : ""}Your appointment will show as paid in a moment.`
                    : "We haven't received confirmation yet. Your appointment will update to paid automatically once the payment clears."}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                    href="/my-appointments"
                    className="rounded-full bg-primary px-8 py-3 text-sm text-white transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    View my appointments
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