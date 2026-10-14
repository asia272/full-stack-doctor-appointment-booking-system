"use server";

import { redirect } from "next/navigation";

import {
    loginSchema,
    registerSchema,
} from "@/lib/validations/auth.schema";

import {
    beginAdminLogin,
    loginPatient,
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
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Please correct the highlighted fields.",
            fieldErrors: getFieldErrors(parsed.error),
        };
    }

    try {
        const result = await registerPatient(parsed.data);

        redirect(
            `/verify-email?email=${encodeURIComponent(result.email)}`,
        );
    } catch (error) {
        // Next.js redirect() throws internally. Do not swallow it.
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
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to create your account. Please try again.",
        };
    }
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
        const result = await loginPatient(parsed.data);

        if (!result.verified) {
            redirect(
                `/verify-email?email=${encodeURIComponent(result.email)}`,
            );
        }
    } catch (error) {
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
            message:
                error instanceof Error
                    ? error.message
                    : "Invalid email or password.",
        };
    }

    redirect("/");
}




export async function staffLoginAction(
    _prevState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const mode = formData.get("mode") === "doctor" ? "doctor" : "admin";

    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Please enter a valid email and password.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    if (mode === "admin") {
        try {
            await beginAdminLogin(parsed.data);

            return {
                success: true,
                message: "Verification code sent to the configured Admin email.",
                userId: "env-admin",
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to start Admin sign-in.",
            };
        }
    }

    try {
        await loginWithPassword(parsed.data, ["DOCTOR"]);
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to sign in.",
        };
    }

    redirect("/doctor/dashboard");
}

export async function adminOtpLoginAction(
    _prevState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "");
    const userId = String(formData.get("userId") ?? "");
    const code = String(formData.get("code") ?? "").trim();

    if (userId !== "env-admin" || !/^\d{6}$/.test(code)) {
        return {
            success: false,
            message: "Enter the valid six-digit verification code.",
        };
    }

    try {
        await verifyAdminLogin(userId, email, code);
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to verify the Admin code.",
        };
    }

    redirect("/admin/dashboard");
}




export async function logoutAction(): Promise<void> {
    await logout();
    redirect("/");
}