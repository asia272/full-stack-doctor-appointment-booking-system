
import "server-only";

import { BrevoClient } from "@getbrevo/brevo";

function getBrevoClient(): BrevoClient {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("BREVO_API_KEY is not configured.");
    }

    return new BrevoClient({ apiKey });
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function sendVerificationEmail(
    email: string,
    fullName: string,
    code: string,
): Promise<void> {
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName =
        process.env.BREVO_SENDER_NAME ?? "Doctor Appointment System";

    if (!senderEmail) {
        throw new Error("BREVO_SENDER_EMAIL is not configured.");
    }

    await getBrevoClient().transactionalEmails.sendTransacEmail({
        sender: {
            email: senderEmail,
            name: senderName,
        },
        to: [
            {
                email,
                name: fullName,
            },
        ],
        subject: "Verify your email address",
        textContent: [
            `Hello ${fullName},`,
            "",
            `Your email verification code is: ${code}`,
            "",
            "This code expires in 10 minutes.",
            "If you did not request this, you can ignore this email.",
        ].join("\n"),
        htmlContent: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#18181b">
                <h2>Verify your email address</h2>
                <p>Hello ${escapeHtml(fullName)},</p>
                <p>Enter this code to verify your email address:</p>
                <p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p>
                <p>This code expires in <strong>10 minutes</strong>.</p>
                <p>If you did not request this, you can ignore this email.</p>
            </div>
        `,
    });
}
