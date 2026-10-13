
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck, Stethoscope } from "lucide-react";

import {
    staffLoginAction,
    type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = {
    success: false,
    message: "",
};

type LoginMode = "admin" | "doctor";

export default function StaffLoginForm() {
    const [mode, setMode] = useState<LoginMode>("admin");
    const [showPassword, setShowPassword] = useState(false);

    const [state, formAction, isPending] = useActionState(
        staffLoginAction,
        initialState,
    );

    const isAdmin = mode === "admin";

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f9f9f9] px-4 py-12 text-[#111111]">
            <section className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-sm font-medium text-[#c53fad] transition hover:opacity-80"
                    >
                        ← Back to home
                    </Link>

                    <h1 className="mt-6 text-3xl font-semibold tracking-tight">
                        Staff sign in
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Sign in to access your{" "}
                        {isAdmin ? "administration" : "doctor"} dashboard.
                    </p>
                </div>

                <div className="rounded-2xl border border-[#e0dae2] bg-white p-6 shadow-sm sm:p-8">
                    <div
                        className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f1f6] p-1"
                        aria-label="Choose login mode"
                    >
                        <button
                            type="button"
                            onClick={() => setMode("admin")}
                            aria-pressed={isAdmin}
                            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition ${isAdmin
                                    ? "bg-white text-[#a52f91] shadow-sm"
                                    : "text-gray-600 hover:text-[#a52f91]"
                                }`}
                        >
                            <ShieldCheck size={17} />
                            Admin
                        </button>

                        <button
                            type="button"
                            onClick={() => setMode("doctor")}
                            aria-pressed={!isAdmin}
                            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition ${!isAdmin
                                    ? "bg-white text-[#a52f91] shadow-sm"
                                    : "text-gray-600 hover:text-[#a52f91]"
                                }`}
                        >
                            <Stethoscope size={17} />
                            Doctor
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">
                            {isAdmin ? "Admin login" : "Doctor login"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {isAdmin
                                ? "Manage doctors, appointments, and the platform."
                                : "Access your doctor account and appointments."}
                        </p>
                    </div>

                    <form action={formAction} className="space-y-5">
                        <input
                            type="hidden"
                            name="mode"
                            value={mode}
                        />

                        <div className="space-y-2">
                            <label
                                htmlFor="staff-email"
                                className="block text-sm font-medium"
                            >
                                Email address
                            </label>

                            <input
                                id="staff-email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                placeholder="you@example.com"
                                required
                                maxLength={254}
                                className="h-11 w-full rounded-lg border border-[#e0dae2] bg-white px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#c53fad]"
                            />

                            {state.fieldErrors?.email?.[0] && (
                                <p className="text-sm text-red-600">
                                    {state.fieldErrors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="staff-password"
                                className="block text-sm font-medium"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="staff-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    required
                                    maxLength={128}
                                    className="h-11 w-full rounded-lg border border-[#e0dae2] bg-white px-3 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#c53fad]"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((visible) => !visible)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 transition hover:text-[#a52f91]"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>

                            {state.fieldErrors?.password?.[0] && (
                                <p className="text-sm text-red-600">
                                    {state.fieldErrors.password[0]}
                                </p>
                            )}
                        </div>

                        {state.message && (
                            <p
                                role="alert"
                                aria-live="polite"
                                className={`rounded-lg px-3 py-2 text-sm ${state.success
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                            >
                                {state.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#c53fad] px-4 text-sm font-semibold text-white transition hover:bg-[#ad3297] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending
                                ? "Signing in..."
                                : `Sign in as ${isAdmin ? "Admin" : "Doctor"}`}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs leading-5 text-gray-500">
                    Authorized staff only. Your account must be created by an
                    administrator or through the initial admin setup process.
                </p>
            </section>
        </main>
    );
}
