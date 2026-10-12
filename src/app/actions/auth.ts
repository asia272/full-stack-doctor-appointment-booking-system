
"use server";

import { redirect } from "next/navigation";

import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "@/lib/validations/auth.schema";

import {
    loginWithPassword,
    logout,
    registerPatient,
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

    try {
        await registerPatient({
            fullName: parsed.data.fullName,
            email: parsed.data.email,
            password: parsed.data.password,
        });
    } catch {
        return {
            success: false,
            message:
                "Unable to create your account. Check your details or try again later.",
        };
    }

    redirect("/dashboard");
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

    let user;

    try {
        user = await loginWithPassword(parsed.data);
    } catch {
        return {
            success: false,
            message: INVALID_LOGIN_MESSAGE,
        };
    }

    if (user.role !== "USER") {
        await logout();

        return {
            success: false,
            message: INVALID_LOGIN_MESSAGE,
        };
    }

    redirect("/dashboard");
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
        user = await loginWithPassword(parsed.data);
    } catch {
        return {
            success: false,
            message: INVALID_LOGIN_MESSAGE,
        };
    }

    if (user.role !== "ADMIN" && user.role !== "DOCTOR") {
        await logout();

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
    redirect("/login");
}
