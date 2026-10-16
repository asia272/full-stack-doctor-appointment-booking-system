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

    const inputClassName =
        "h-[42px] w-full rounded-[4px] border border-[#DADADA] bg-white px-4  outline-none  focus:border-black text-[16px] ";

    const labelClassName =
        "mb-2 block text-sm font-medium leading-5";

    return (
        <section className="flex w-full justify-center px-4 py-8 sm:px-6 sm:py-12">
            <div className="w-full max-w-[476px] rounded-[20px] border border-[##D4D4D4] bg-white px-5 py-7 shadow-[0px_20px_50px_0px_#5F6FFF1A] sm:px-8 sm:py-9">
                {/* Heading */}
                <div className="mb-7">
                    <h1 className="text-2xl font-semibold leading-tight tracking-[-0.5px]  sm:text-[30px]">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>

                    <p className="mt-2 text-[18px] leading-6  sm:text-base">
                        {isLogin
                            ? "Please sign in to book appointment"
                            : "Please sign up to book appointment"}
                    </p>
                </div>


                {/* Form */}
                <form
                    key={mode}
                    action={isLogin ? loginFormAction : registerFormAction}
                    className="space-y-5"
                >
                    {/* Server action feedback */}
                    {state.message && (
                        <p
                            role="alert"
                            aria-live="polite"
                            className={`rounded-lg border p-3 text-sm ${state.success
                                ? "border-green-300 bg-green-50 text-green-700"
                                : "border-red-300 bg-red-50 text-red-700"
                                }`}
                        >
                            {state.message}
                        </p>
                    )}

                    {/* Full Name */}
                    {!isLogin && (
                        <div>
                            <label htmlFor="fullName" className={labelClassName}>
                                Full Name
                            </label>

                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                minLength={2}
                                maxLength={100}
                                aria-invalid={Boolean(
                                    fieldErrors?.fullName?.length,
                                )}
                                aria-describedby={
                                    fieldErrors?.fullName?.length
                                        ? "fullName-error"
                                        : undefined
                                }
                                className={inputClassName}
                            />

                            {fieldErrors?.fullName?.[0] && (
                                <p
                                    id="fullName-error"
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {fieldErrors.fullName[0]}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className={labelClassName}>
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={254}
                            aria-invalid={Boolean(
                                fieldErrors?.email?.length,
                            )}
                            aria-describedby={
                                fieldErrors?.email?.length
                                    ? "email-error"
                                    : undefined
                            }
                            className={inputClassName}
                        />

                        {fieldErrors?.email?.[0] && (
                            <p
                                id="email-error"
                                className="mt-2 text-sm text-red-600"
                            >
                                {fieldErrors.email[0]}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className={labelClassName}>
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={
                                isLogin ? "current-password" : "new-password"
                            }
                            required
                            minLength={isLogin ? undefined : 12}
                            maxLength={128}
                            aria-invalid={Boolean(
                                fieldErrors?.password?.length,
                            )}
                            aria-describedby={
                                fieldErrors?.password?.length
                                    ? "password-error"
                                    : undefined
                            }
                            className={inputClassName}
                        />

                        {fieldErrors?.password?.[0] && (
                            <p
                                id="password-error"
                                className="mt-2 text-sm text-red-600"
                            >
                                {fieldErrors.password[0]}
                            </p>
                        )}
                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={pending}
                        className="flex h-[46px] w-full items-center justify-center rounded-[6px] bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-[#5061f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f6fff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pending
                            ? isLogin
                                ? "Signing in..."
                                : "Creating account..."
                            : isLogin
                                ? "Sign in"
                                : "Create account"}
                    </button>

                    {/* Switch between login and registration */}
                    <p className="pt-1 text-center text-sm leading-6 text-[#626b7b] sm:text-base">
                        {isLogin
                            ? "Don't have an account? "
                            : "Already have an account? "}

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(isLogin ? "signup" : "login")
                            }
                            className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-[#3f51d7]"
                        >
                            {isLogin ? "Sign up here" : "Login here"}
                        </button>
                    </p>
                </form>
            </div>
        </section>
    );
}