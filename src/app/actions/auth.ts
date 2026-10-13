"use server";

import { redirect } from "next/navigation";

import {
    loginSchema,
    registerSchema,
} from "@/lib/validations/auth.schema";

import {
    loginWithPassword,
    logout,
    registerPatient,
    resendVerificationCode,
    verifyPatientEmail,
} from "@/lib/auth/auth.service";

export type AuthActionState = {
    success: boolean;
    message: string;
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

    let user;

    try {
        user = await loginWithPassword(parsed.data, ["ADMIN", "DOCTOR"]);
    } catch {
        return {
            success: false,
            message: INVALID_LOGIN_MESSAGE,
        };
    }

    redirect(
        user.role === "ADMIN"
            ? "/admin/dashboard"
            : "/doctor/dashboard",
    );
}

export async function logoutAction(): Promise<void> {
    await logout();
    redirect("/");
}