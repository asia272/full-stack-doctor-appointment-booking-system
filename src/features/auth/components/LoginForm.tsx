

"use client";

import { useState, useActionState } from "react";
import Link from "next/link";

import {
    patientLoginAction,
    registerAction,
    type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = {
    success: false,
    message: "",
};

export default function RegisterForm() {
    const [mode, setMode] = useState<"signup" | "login">("signup");

    const [registerState, registerFormAction, registerPending] =
        useActionState(registerAction, initialState);

    const [loginState, loginFormAction, loginPending] =
        useActionState(patientLoginAction, initialState);

    const isLogin = mode === "login";
    const state = isLogin ? loginState : registerState;
    const pending = isLogin ? loginPending : registerPending;
    const fieldErrors = state.fieldErrors;

    function switchMode(nextMode: "signup" | "login") {
        setMode(nextMode);
    }

    return (
        <div className="w-full space-y-6">
            <div className="grid grid-cols-2 rounded-lg border p-1">
                <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    aria-pressed={!isLogin}
                    className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${!isLogin
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                        }`}
                >
                    Sign Up
                </button>

                <button
                    type="button"
                    onClick={() => switchMode("login")}
                    aria-pressed={isLogin}
                    className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${isLogin
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                        }`}
                >
                    Sign In
                </button>
            </div>

            <div>
                <h2 className="text-2xl font-semibold">
                    {isLogin ? "Welcome back" : "Create your account"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {isLogin
                        ? "Sign in to continue to your account."
                        : "Enter your details to get started."}
                </p>
            </div>

            <form
                key={mode}
                action={isLogin ? loginFormAction : registerFormAction}
                className="space-y-5"
            >
                {state.message && (
                    <p
                        role="alert"
                        aria-live="polite"
                        className={`rounded-md border p-3 text-sm ${state.success
                            ? "border-green-300 text-green-700"
                            : "border-red-300 text-red-700"
                            }`}
                    >
                        {state.message}
                    </p>
                )}

                {!isLogin && (
                    <div className="space-y-2">
                        <label
                            htmlFor="fullName"
                            className="text-sm font-medium"
                        >
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
                            aria-invalid={Boolean(
                                fieldErrors?.fullName?.length,
                            )}
                            className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                        />

                        {fieldErrors?.fullName?.[0] && (
                            <p className="text-sm text-red-600">
                                {fieldErrors.fullName[0]}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium"
                    >
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
                        className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                    />

                    {fieldErrors?.email?.[0] && (
                        <p className="text-sm text-red-600">
                            {fieldErrors.email[0]}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="text-sm font-medium"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={
                            isLogin ? "current-password" : "new-password"
                        }
                        placeholder={
                            isLogin
                                ? "Enter your password"
                                : "At least 12 characters"
                        }
                        required
                        minLength={isLogin ? undefined : 12}
                        maxLength={128}
                        aria-invalid={Boolean(
                            fieldErrors?.password?.length,
                        )}
                        className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                    />

                    {fieldErrors?.password?.[0] && (
                        <p className="text-sm text-red-600">
                            {fieldErrors.password[0]}
                        </p>
                    )}
                </div>

                {isLogin && (
                    <div className="text-right text-sm">
                        <Link
                            href="/verify-email"
                            className="underline underline-offset-4"
                        >
                            Need to verify your email?
                        </Link>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={pending}
                    className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending
                        ? isLogin
                            ? "Signing in..."
                            : "Creating account..."
                        : isLogin
                            ? "Sign In"
                            : "Create Account"}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                    {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}

                    <button
                        type="button"
                        onClick={() =>
                            switchMode(isLogin ? "signup" : "login")
                        }
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </form>
        </div>
    );
}

