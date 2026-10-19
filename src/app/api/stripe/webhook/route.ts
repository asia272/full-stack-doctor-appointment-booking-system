import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { markAppointmentPaid } from "@/lib/payments/payment.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !secret) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // The signature is checked against the RAW body, so read it as text.
    const body = await request.text();

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, signature, secret);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
        ) {
            const session = event.data.object as Stripe.Checkout.Session;
            const appointmentId = session.metadata?.appointmentId;

            if (session.payment_status === "paid" && appointmentId) {
                const paymentIntentId =
                    typeof session.payment_intent === "string"
                        ? session.payment_intent
                        : session.payment_intent?.id;

                const outcome = await markAppointmentPaid({
                    appointmentId,
                    sessionId: session.id,
                    paymentIntentId,
                    amountTotal: session.amount_total ?? 0,
                });

                if (outcome === "AMOUNT_MISMATCH" || outcome === "PAID_BUT_INACTIVE") {
                    // Needs a human: check the payment in the Stripe dashboard.
                    console.error("[stripe] Needs review:", outcome, {
                        appointmentId,
                        sessionId: session.id,
                    });
                }
            }
        }
    } catch (error) {
        console.error("[stripe] Webhook handling failed:", error);
        // 500 makes Stripe retry later.
        return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}