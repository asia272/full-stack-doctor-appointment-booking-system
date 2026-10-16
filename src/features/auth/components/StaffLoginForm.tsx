
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

    const inputClassName =
        "h-[42px] w-full rounded-[4px] border border-[#DADADA] bg-white px-4  outline-none  focus:border-black text-[16px] ";

    const labelClassName =
        "block text-sm font-medium leading-5";

    return (
        <main className="flex min-h-screen w-full items-start justify-center bg-white px-5 pt-[19.7vh] pb-12">
            <section
                aria-labelledby="staff-login-title"
                className="w-full max-w-[476px] rounded-[20px] border border-[##D4D4D4] bg-white px-5 py-7 shadow-[0px_20px_50px_0px_#5F6FFF1A] sm:px-8 sm:py-9">
                <header className="mb-[23px]">
                    <h1
                        id="staff-login-title"
                        className="text-center text-[27px] leading-[1.3] font-semibold tracking-[-0.8px]  sm:text-[32px]"
                    >
                        {otpStep ? (
                            <>
                                <span className="text-primary">Verify</span>{" "}
                                your email
                            </>
                        ) : (
                            <>
                                <span className="text-primary">
                                    {mode === "admin" ? "Admin" : "Doctor"}
                                </span>{" "}
                                Login
                            </>
                        )}
                    </h1>

                    {otpStep && (
                        <p className="mt-3 text-center text-[15px] leading-6 text-[#666666]">
                            Enter the six-digit code sent to your configured
                            Admin email.
                        </p>
                    )}
                </header>

                {!otpStep ? (
                    <form action={loginAction} className="flex flex-col gap-5">
                        <input type="hidden" name="mode" value={mode} />

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="staff-email"
                                className={labelClassName}
                            >
                                Email
                            </label>

                            <input
                                id="staff-email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                maxLength={254}
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className={inputClassName}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="staff-password"
                                className={labelClassName}
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
                                className={inputClassName}
                            />
                        </div>

                        {loginState.message && (
                            <p
                                role="status"
                                aria-live="polite"
                                className="-mt-1 text-sm leading-5 text-red-600"
                            >
                                {loginState.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loginPending}
                            className="flex h-[46px] w-full items-center justify-center rounded-[6px] bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-[#5061f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f6fff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loginPending ? "Please wait..." : "Login"}
                        </button>
                    </form>
                ) : (
                    <form action={otpAction} className="flex flex-col gap-5">
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

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="admin-otp"
                                className={labelClassName}
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
                                className={inputClassName}
                            />
                        </div>

                        {message && (
                            <p
                                role="status"
                                aria-live="polite"
                                className={`text-sm leading-5 ${success ? "text-green-700" : "text-red-600"
                                    }`}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={pending}
                            className="flex h-[46px] w-full items-center justify-center rounded-[6px] bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-[#5061f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f6fff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {pending ? "Verifying..." : "Verify and sign in"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setOtpStep(false);
                                setUserId("");
                            }}
                            className="h-[42px] w-full rounded-[4px] border border-[#DADADA] bg-white px-4 py-2.5 text-sm font-medium  hover:bg-[#f7f7f7]"
                        >
                            Back to sign in
                        </button>
                    </form>
                )}

                {!otpStep && (
                    <p className="mt-5 text-base leading-[1.6]">
                        {mode === "admin" ? "Doctor" : "Admin"} Login?{" "}
                        <button
                            type="button"
                            onClick={() =>
                                changeMode(
                                    mode === "admin" ? "doctor" : "admin",
                                )
                            }
                            className="text-primary underline underline-offset-2 hover:text-[#4f60b3]"
                        >
                            Click here
                        </button>
                    </p>
                )}

                {otpStep && (
                    <p className="mt-5 text-center text-xs leading-5 ">
                        Authorized staff only. Admin login requires email
                        verification.
                    </p>
                )}
            </section>
        </main>
    );
}
