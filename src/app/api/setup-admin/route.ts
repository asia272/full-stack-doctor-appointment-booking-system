
import { createHmac, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { FunctionReference } from "convex/server";
import { internal } from "../../../../convex/_generated/api";

import { sendVerificationEmail } from "@/lib/email/brevo";
import { hashPassword, validatePassword } from "@/lib/auth/passwords";
import { getConvexAdminClient } from "@/lib/auth/session";

export const runtime = "nodejs";

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

function getInternalQuery(ref: unknown): InternalQuery {
    return ref as InternalQuery;
}

function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function getOtpHashSecret(): string {
    const secret = process.env.OTP_HASH_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("OTP_HASH_SECRET is not configured securely.");
    }

    return secret;
}

function hashOtp(userId: string, code: string): string {
    return createHmac("sha256", getOtpHashSecret())
        .update(`${userId}:${code}`)
        .digest("hex");
}

function createOtp(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function errorResponse(message: string, status: number) {
    return NextResponse.json({ success: false, message }, { status });
}

const sendSchema = z.object({
    action: z.literal("send-code"),
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(12).max(128),
});

const verifySchema = z.object({
    action: z.literal("verify-code"),
    email: z.string().trim().email().max(254),
    code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return errorResponse("Invalid request body.", 400);
    }

    if (
        typeof body !== "object" ||
        body === null ||
        !("action" in body) ||
        typeof body.action !== "string"
    ) {
        return errorResponse("Invalid request.", 400);
    }

    const configuredAdminEmail = process.env.ADMIN_EMAIL;

    if (
        !configuredAdminEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredAdminEmail.trim())
    ) {
        return errorResponse("Admin setup is not configured correctly.", 503);
    }

    const allowedEmail = normalizeEmail(configuredAdminEmail);
    const client = getConvexAdminClient();

    if (body.action === "send-code") {
        const parsed = sendSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                "Enter a valid name and email. Password must contain at least 12 characters.",
                400,
            );
        }

        const { fullName } = parsed.data;
        const email = normalizeEmail(parsed.data.email);

        if (email !== allowedEmail) {
            return errorResponse(
                "This email is not authorized for initial admin setup.",
                403,
            );
        }

        try {
            validatePassword(parsed.data.password);
        } catch (error) {
            return errorResponse(getErrorMessage(error), 400);
        }

        let userId: string | undefined;

        try {
            const existingUser = await client.query(
                getInternalQuery(internal.users.getByEmail),
                { email },
            );

            if (existingUser) {
                return errorResponse(
                    "An account already exists with this email. Do not use admin setup to overwrite an existing account.",
                    409,
                );
            }

            const passwordHash = await hashPassword(parsed.data.password);
            const createdUserId = await client.mutation(
                getInternalMutation(internal.users.registerPatient),
                {
                    fullName: fullName.trim(),
                    email,
                    passwordHash,
                },
            );

            userId = createdUserId;

            const code = createOtp();

            await client.mutation(
                getInternalMutation(internal.users.createEmailVerificationCode),
                {
                    userId: createdUserId,
                    codeHash: hashOtp(String(createdUserId), code),
                }
            );

            await sendVerificationEmail(email, fullName.trim(), code);

            return NextResponse.json({
                success: true,
                message: "Verification code sent. Check your email.",
            });
        } catch (error) {
            if (userId) {
                try {
                    await client.mutation(
                        getInternalMutation(internal.users.deleteUnverifiedPatient),
                        { userId: userId as never },
                    );
                } catch (cleanupError) {
                    console.error(
                        "[setup-admin] Temporary user cleanup failed:",
                        cleanupError,
                    );
                }
            }

            const message = getErrorMessage(error);

            if (message.includes("EMAIL_ALREADY_EXISTS")) {
                return errorResponse("An account already exists with this email.", 409);
            }

            if (message.includes("ADMIN_ALREADY_EXISTS")) {
                return errorResponse("An administrator already exists.", 409);
            }

            if (message.includes("OTP_COOLDOWN")) {
                return errorResponse(
                    "Please wait one minute before requesting another code.",
                    429,
                );
            }

            console.error("[setup-admin] OTP send failed:", error);

            return errorResponse(
                "Unable to send the verification email. Please check your email service configuration and try again.",
                500,
            );
        }
    }

    if (body.action === "verify-code") {
        const parsed = verifySchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Enter a valid email and six-digit code.", 400);
        }

        const email = normalizeEmail(parsed.data.email);

        if (email !== allowedEmail) {
            return errorResponse(
                "This email is not authorized for initial admin setup.",
                403,
            );
        }

        try {
            const user = await client.query(
                getInternalQuery(internal.users.getByEmail),
                { email },
            );

            if (
                !user ||
                user.role !== "USER" ||
                user.emailVerified === true ||
                !user.isActive
            ) {
                return errorResponse(
                    "No pending admin setup was found for this email. Request a new code.",
                    400,
                );
            }

            const result = await client.mutation(
                getInternalMutation(internal.staff.verifyFirstAdminOtp),
                {
                    userId: user._id,
                    email,
                    codeHash: hashOtp(user._id, parsed.data.code),
                },
            );

            if (!result.success) {
                if (result.reason === "EXPIRED") {
                    return errorResponse(
                        "The code has expired. Request a new code.",
                        400,
                    );
                }

                if (result.reason === "TOO_MANY_ATTEMPTS") {
                    return errorResponse(
                        "Too many incorrect attempts. Request a new code.",
                        429,
                    );
                }

                if (result.reason === "ADMIN_ALREADY_EXISTS") {
                    return errorResponse("An administrator already exists.", 409);
                }

                return errorResponse("Invalid or expired verification code.", 400);
            }

            return NextResponse.json({
                success: true,
                message: "Admin email verified and account created. You can now sign in.",
            });
        } catch (error) {
            console.error("[setup-admin] OTP verification failed:", error);

            return errorResponse("Unable to verify the code. Please try again.", 500);
        }
    }

    return errorResponse("Unsupported action.", 400);
}
