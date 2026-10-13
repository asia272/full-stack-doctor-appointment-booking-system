"use server";

import { redirect } from "next/navigation";

import {
    loginSchema,
    registerSchema,
} from "@/lib/validations/auth.schema";

import {
    beginAdminLogin,
    loginWithPassword,
    logout,
    registerPatient,
    resendVerificationCode,
    verifyAdminLogin,
    verifyPatientEmail,
} from "@/lib/auth/auth.service";

export type AuthActionState = {
    success: boolean;
    message: string;
    userId?: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

const INVALID_LOGIN_MESSAGE = "Invalid email or password.";

function getFieldErrors(error: {
    flatten: () => {
        fieldErrors: Record<string, string[] | undefined>;
    };
}): Record<string, string[] | undefined> {
    return error.flatten().fieldErrors;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function registerAction(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const parsed = registerSchema.safeParse({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Please correct the highlighted fields.",
            fieldErrors: getFieldErrors(parsed.error),
        };
    }

    let result: { email: string };

    try {
        result = await registerPatient({
            fullName: parsed.data.fullName,
            email: parsed.data.email,
            password: parsed.data.password,
        });
    } catch (error) {
        console.error("[auth] Registration failed:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to create your account. Please try again.",
        };
    }

    redirect(`/verify-email?email=${encodeURIComponent(result.email)}`);
}

export async function verifyEmailAction(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();

    const code = String(formData.get("code") ?? "").trim();

    if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return {
            success: false,
            message: "Enter a valid email address.",
            fieldErrors: {
                email: ["Enter a valid email address."],
            },
        };
    }

    if (!/^\d{6}$/.test(code)) {
        return {
            success: false,
            message: "Enter the six-digit code from your email.",
            fieldErrors: {
                code: ["The code must contain exactly six digits."],
            },
        };
    }

    try {
        await verifyPatientEmail(email, code);
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to verify your email. Please try again.",
        };
    }

    redirect("/");
}

export async function resendVerificationCodeAction(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();

    if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return {
            success: false,
            message: "Enter a valid email address.",
        };
    }

    try {
        await resendVerificationCode(email);

        return {
            success: true,
            message:
                "If this address has an unverified account, a verification email has been requested. Check your inbox and spam folder.",
        };
    } catch (error) {
        const message = getErrorMessage(error);

        if (message.includes("OTP_COOLDOWN")) {
            return {
                success: false,
                message:
                    "Please wait at least 60 seconds before requesting another code.",
            };
        }

        console.error("[auth] Resend verification failed:", error);

        return {
            success: false,
            message: "Unable to request another code. Please try again later.",
        };
    }
}

export async function patientLoginAction(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Please enter a valid email and password.",
            fieldErrors: getFieldErrors(parsed.error),
        };
    }

    try {
        await loginWithPassword(parsed.data, ["USER"]);
    } catch {
        return {
            success: false,
            message: INVALID_LOGIN_MESSAGE,
        };
    }

    redirect("/");
}



export async function staffLoginAction(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const mode = formData.get("mode");

    if (mode !== "admin" && mode !== "doctor") {
        return {
            success: false,
            message: "Please select a valid login mode.",
        };
    }

    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Please enter a valid email and password.",
            fieldErrors: getFieldErrors(parsed.error),
        };
    }

    if (mode === "admin") {
        try {
            const result = await beginAdminLogin(parsed.data);

            return {
                success: true,
                message: "A verification code has been sent to your Admin email.",
                userId: result.userId,
            };
        } catch (error) {
            const message = getErrorMessage(error);

            if (message.includes("OTP_COOLDOWN")) {
                return {
                    success: false,
                    message: "Please wait 60 seconds before requesting another code.",
                };
            }

            console.error("[auth] Admin login start failed:", error);

            return {
                success: false,
                message: message.includes("Unable to send the Admin verification code")
                    ? message
                    : INVALID_LOGIN_MESSAGE,
            };
        }
    }

    try {
        const user = await loginWithPassword(parsed.data, ["DOCTOR"]);

        redirect(
            user.role === "DOCTOR"
                ? "/doctor/dashboard"
                : "/",
        );
    } catch (error) {
        // Next.js redirect() throws internally; don't swallow its redirect.
        if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            typeof error.digest === "string" &&
            error.digest.startsWith("NEXT_REDIRECT")
        ) {
            throw error;
        }

        return {
            success: false,
            message: INVALID_LOGIN_MESSAGE,
        };
    }
}

export async function adminOtpLoginAction(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();

    const userId = String(formData.get("userId") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim();

    if (!email || !userId || !/^\d{6}$/.test(code)) {
        return {
            success: false,
            message: "Enter the six-digit verification code.",
        };
    }

    try {
        await verifyAdminLogin(userId, email, code);
    } catch (error) {
        const message = getErrorMessage(error);

        return {
            success: false,
            message:
                message === "Your code has expired. Please request a new code." ||
                    message === "Too many incorrect attempts. Please request a new code." ||
                    message.startsWith("The configured Admin email")
                    ? message
                    : "Invalid or expired verification code.",
        };
    }

    redirect("/admin/dashboard");
}



export async function logoutAction(): Promise<void> {
    await logout();
    redirect("/");
}