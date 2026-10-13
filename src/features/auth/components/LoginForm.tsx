
"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
    registerAction,
    type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = {
    success: false,
    message: "",
};

export default function RegisterForm() {
    const [state, formAction, pending] = useActionState(
        registerAction,
        initialState,
    );

    const fieldErrors = state.fieldErrors;

    return (
        <form action={formAction} className="space-y-5">
            {state.message && (
                <p
                    role="alert"
                    className="rounded-md border border-red-300 p-3 text-sm text-red-700"
                >
                    {state.message}
                </p>
            )}

            <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                    Full name
                </label>

                <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    maxLength={100}
                    aria-invalid={Boolean(fieldErrors?.fullName?.length)}
                    aria-describedby={
                        fieldErrors?.fullName?.length ? "fullName-error" : undefined
                    }
                    className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                />

                {fieldErrors?.fullName?.[0] && (
                    <p id="fullName-error" className="text-sm text-red-600">
                        {fieldErrors.fullName[0]}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    aria-invalid={Boolean(fieldErrors?.email?.length)}
                    aria-describedby={
                        fieldErrors?.email?.length ? "email-error" : undefined
                    }
                    className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                />

                {fieldErrors?.email?.[0] && (
                    <p id="email-error" className="text-sm text-red-600">
                        {fieldErrors.email[0]}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 12 characters"
                    required
                    minLength={12}
                    maxLength={128}
                    aria-invalid={Boolean(fieldErrors?.password?.length)}
                    aria-describedby={
                        fieldErrors?.password?.length ? "password-error" : undefined
                    }
                    className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                />

                {fieldErrors?.password?.[0] && (
                    <p id="password-error" className="text-sm text-red-600">
                        {fieldErrors.password[0]}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password
                </label>

                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    required
                    minLength={12}
                    maxLength={128}
                    aria-invalid={Boolean(fieldErrors?.confirmPassword?.length)}
                    aria-describedby={
                        fieldErrors?.confirmPassword?.length
                            ? "confirmPassword-error"
                            : undefined
                    }
                    className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                />

                {fieldErrors?.confirmPassword?.[0] && (
                    <p id="confirmPassword-error" className="text-sm text-red-600">
                        {fieldErrors.confirmPassword[0]}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
                {pending ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
