"use client";

import { useState, useActionState } from "react";

import {
    resendVerificationCodeAction,
    verifyEmailAction,
    type AuthActionState,
} from "@/app/actions/auth";

const initialState: AuthActionState = {
    success: false,
    message: "",
};

type VerifyEmailFormProps = {
    initialEmail: string;
};

export default function VerifyEmailForm({
    initialEmail,
}: VerifyEmailFormProps) {
    const [email, setEmail] = useState(initialEmail);

    const [verifyState, verifyAction, verifying] = useActionState(
        verifyEmailAction,
        initialState,
    );

    const [resendState, resendAction, resending] = useActionState(
        resendVerificationCodeAction,
        initialState,
    );

    return (
        <div className="space-y-6">
            <form action={verifyAction} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="verification-email" className="text-sm font-medium">
                        Email address
                    </label>

                    <input
                        id="verification-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                        maxLength={254}
                        placeholder="you@example.com"
                        aria-invalid={Boolean(verifyState.fieldErrors?.email?.length)}
                        className="w-full rounded-md border bg-transparent px-3 py-2.5 outline-none focus:border-current"
                    />

                    {verifyState.fieldErrors?.email?.[0] && (
                        <p className="text-sm text-red-600">
                            {verifyState.fieldErrors.email[0]}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="verification-code" className="text-sm font-medium">
                        Verification code
                    </label>

                    <input
                        id="verification-code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        minLength={6}
                        maxLength={6}
                        required
                        placeholder="000000"
                        aria-invalid={Boolean(verifyState.fieldErrors?.code?.length)}
                        className="w-full rounded-md border bg-transparent px-3 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-current"
                    />

                    {verifyState.fieldErrors?.code?.[0] && (
                        <p className="text-sm text-red-600">
                            {verifyState.fieldErrors.code[0]}
                        </p>
                    )}
                </div>

                {verifyState.message && (
                    <p
                        role="alert"
                        className="rounded-md border border-red-300 p-3 text-sm text-red-700"
                    >
                        {verifyState.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={verifying}
                    className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {verifying ? "Verifying..." : "Verify email"}
                </button>
            </form>

            <div className="space-y-3 border-t pt-5">
                <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code? Check your spam folder or request
                    another.
                </p>

                {resendState.message && (
                    <p
                        role={resendState.success ? "status" : "alert"}
                        className="text-sm"
                    >
                        {resendState.message}
                    </p>
                )}

                <form action={resendAction}>
                    <input type="hidden" name="email" value={email} />

                    <button
                        type="submit"
                        disabled={resending}
                        className="w-full rounded-md border px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {resending ? "Requesting code..." : "Resend verification code"}
                    </button>
                </form>
            </div>
        </div>
    );
}