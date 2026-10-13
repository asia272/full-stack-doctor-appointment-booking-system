
"use client";

import { useActionState, useEffect, useState } from "react";

import {
    adminOtpLoginAction,
    staffLoginAction,
    type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = {
    success: false,
    message: "",
};

export default function StaffLoginForm() {
    const [mode, setMode] = useState<"admin" | "doctor">("admin");
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [otpStep, setOtpStep] = useState(false);

    const [loginState, loginAction, loginPending] = useActionState(
        staffLoginAction,
        initialState,
    );

    const [otpState, otpAction, otpPending] = useActionState(
        adminOtpLoginAction,
        initialState,
    );

    useEffect(() => {
        if (loginState.success && loginState.userId) {
            setUserId(loginState.userId);
            setOtpStep(true);
        }
    }, [loginState]);

    function changeMode(nextMode: "admin" | "doctor") {
        setMode(nextMode);
        setOtpStep(false);
        setUserId("");
    }

    const message = otpStep ? otpState.message : loginState.message;
    const success = otpStep ? otpState.success : loginState.success;
    const pending = otpStep ? otpPending : loginPending;

    return (
        <main className="mx-auto w-full max-w-md px-5 py-10">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                        {otpStep
                            ? "Verify your email"
                            : "Staff sign in"}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        {otpStep
                            ? "Enter the six-digit code sent to your configured Admin email."
                            : "Sign in to access your staff dashboard."}
                    </p>
                </header>

                {!otpStep && (
                    <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => changeMode("admin")}
                            aria-pressed={mode === "admin"}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition ${mode === "admin"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Admin
                        </button>

                        <button
                            type="button"
                            onClick={() => changeMode("doctor")}
                            aria-pressed={mode === "doctor"}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition ${mode === "doctor"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Doctor
                        </button>
                    </div>
                )}

                {!otpStep ? (
                    <form action={loginAction} className="space-y-5">
                        <input
                            type="hidden"
                            name="mode"
                            value={mode}
                        />

                        <div>
                            <label
                                htmlFor="staff-email"
                                className="mb-1.5 block text-sm font-medium text-gray-800"
                            >
                                Email address
                            </label>

                            <input
                                id="staff-email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                maxLength={254}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="staff-password"
                                className="mb-1.5 block text-sm font-medium text-gray-800"
                            >
                                Password
                            </label>

                            <input
                                id="staff-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                maxLength={128}
                                placeholder="Enter your password"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500"
                            />
                        </div>

                        {loginState.message && (
                            <p
                                role="status"
                                className="text-sm text-red-600"
                            >
                                {loginState.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loginPending}
                            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loginPending
                                ? "Please wait..."
                                : mode === "admin"
                                    ? "Continue to email verification"
                                    : "Sign in as Doctor"}
                        </button>
                    </form>
                ) : (
                    <form action={otpAction} className="space-y-5">
                        <input
                            type="hidden"
                            name="email"
                            value={email.trim().toLowerCase()}
                        />

                        <input
                            type="hidden"
                            name="userId"
                            value={userId}
                        />

                        <div>
                            <label
                                htmlFor="admin-otp"
                                className="mb-1.5 block text-sm font-medium text-gray-800"
                            >
                                Six-digit verification code
                            </label>

                            <input
                                id="admin-otp"
                                name="code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                minLength={6}
                                maxLength={6}
                                required
                                autoFocus
                                placeholder="000000"
                                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-lg tracking-[0.35em] text-gray-900 outline-none transition focus:border-gray-500"
                            />
                        </div>

                        {message && (
                            <p
                                role="status"
                                className={`text-sm ${success ? "text-green-700" : "text-red-600"
                                    }`}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {pending ? "Verifying..." : "Verify and sign in"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setOtpStep(false);
                                setUserId("");
                            }}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Back to sign in
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-xs leading-5 text-gray-500">
                    Authorized staff only. Admin login requires email verification.
                </p>
            </section>
        </main>
    );
}
