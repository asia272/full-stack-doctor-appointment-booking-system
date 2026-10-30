"use server";

import { ConvexError } from "convex/values";

import { getCurrentSessionUser } from "@/lib/auth/session";
import { getStripe } from "@/lib/stripe";
import { getPayableAppointment } from "@/lib/payments/payment.service";

type Result = { ok: true; url: string } | { ok: false; message: string };

const MESSAGES: Record<string, string> = {
    NOT_FOUND: "We couldn't find that appointment.",
    NOT_PAYABLE: "This appointment can no longer be paid.",
    ALREADY_PAID: "This appointment is already paid.",
};

function errorMessage(error: unknown): string {
    if (error instanceof ConvexError && typeof error.data === "string") {
        return MESSAGES[error.data] ?? "Something went wrong. Please try again.";
    }

    const text = error instanceof Error ? error.message : String(error);
    const code = Object.keys(MESSAGES).find((c) => text.includes(c));
    return code ? MESSAGES[code] : "Something went wrong. Please try again.";
}

export async function createCheckoutSessionAction(
    appointmentId: string,
): Promise<Result> {
    const user = await getCurrentSessionUser();

    if (!user) return { ok: false, message: "Please log in to pay." };
    if (user.role !== "USER") {
        return { ok: false, message: "Only patient accounts can pay." };
    }

    try {
        // Ownership and payable checks happen inside Convex.
        const data = await getPayableAppointment(user.id, appointmentId);

        const unitAmount = Math.round(data.fee * 100);
        if (unitAmount < 50) {
            return {
                ok: false,
                message: "Online payment needs a fee of at least $0.50.",
            };
        }

        const appUrl = process.env.APP_URL;
        if (!appUrl) throw new Error("APP_URL is not set.");

        const session = await getStripe().checkout.sessions.create({
            mode: "payment",
            customer_email: data.patientEmail,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "usd",
                        unit_amount: unitAmount,
                        product_data: {
                            name: `Appointment with Dr. ${data.doctorName}`,
                            description: `${data.specialty} · ${data.appointmentDate}, ${data.timeLabel}`,
                        },
                    },
                },
            ],
            metadata: { appointmentId: data.id },
            payment_intent_data: { metadata: { appointmentId: data.id } },
            success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/payment/cancelled`,
        });

        if (!session.url) throw new Error("Stripe returned no checkout URL.");

        return { ok: true, url: session.url };
    } catch (error) {
        console.error("createCheckoutSessionAction", error);
        return { ok: false, message: errorMessage(error) };
    }
}