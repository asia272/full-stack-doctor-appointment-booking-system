
"use client";

import { useState, type FormEvent } from "react";

type ApiResponse = {
    success: boolean;
    message: string;
};

export default function SetupAdminForm() {
    const [step, setStep] = useState<"details" | "verify" | "done">("details");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(
        event: FormEvent<HTMLFormElement>,
        action: "send-code" | "verify-code",
    ) {
        event.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("/api/setup-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    action === "send-code"
                        ? {
                            action,
                            fullName,
                            email,
                            password,
                        }
                        : {
                            action,
                            email,
                            code,
                        },
                ),
            });

            const result = (await response.json()) as ApiResponse;

            if (!response.ok || !result.success) {
                setError(result.message || "Something went wrong.");
                return;
            }

            setMessage(result.message);

            if (action === "send-code") {
                setStep("verify");
            } else {
                setStep("done");
                setPassword("");
                setCode("");
            }
        } catch {
            setError("Unable to contact the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full space-y-5">
            {step === "details" && (
                <form
                    className="space-y-4"
                    onSubmit={(event) => submit(event, "send-code")}
                >
                    <div className="space-y-1.5">
                        <label htmlFor="admin-name" className="text-sm font-medium">
                            Full name
                        </label>
                        <input
                            id="admin-name"
                            name="fullName"
                            autoComplete="name"
                            required
                            minLength={2}
                            maxLength={100}
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5"
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="admin-email" className="text-sm font-medium">
                            Admin email
                        </label>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={254}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5"
                            placeholder="you@example.com"
                        />
                        <p className="text-xs opacity-70">
                            Use the email configured in ADMIN_EMAIL.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="admin-password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={12}
                            maxLength={128}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5"
                            placeholder="At least 12 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Sending code..." : "Send verification code"}
                    </button>
                </form>
            )}

            {step === "verify" && (
                <form
                    className="space-y-4"
                    onSubmit={(event) => submit(event, "verify-code")}
                >
                    <p className="text-sm opacity-80">
                        Enter the six-digit code sent to {email}.
                    </p>

                    <div className="space-y-1.5">
                        <label htmlFor="admin-code" className="text-sm font-medium">
                            Verification code
                        </label>
                        <input
                            id="admin-code"
                            name="code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                            minLength={6}
                            maxLength={6}
                            pattern="[0-9]{6}"
                            value={code}
                            onChange={(event) =>
                                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            className="w-full rounded-lg border px-3 py-2.5 tracking-[0.3em]"
                            placeholder="000000"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Verifying..." : "Verify and create admin"}
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            setStep("details");
                            setCode("");
                            setMessage("");
                            setError("");
                        }}
                        className="w-full rounded-lg border px-4 py-3 font-medium disabled:opacity-60"
                    >
                        Back to details
                    </button>
                </form>
            )}

            {step === "done" && (
                <div className="space-y-3 rounded-lg border p-4">
                    <p className="font-medium">Admin account created successfully.</p>
                    <p className="text-sm opacity-80">
                        Go to your existing staff login page and sign in with your admin email and password.
                    </p>
                </div>
            )}

            {message && step !== "done" && (
                <p role="status" className="text-sm">
                    {message}
                </p>
            )}

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
