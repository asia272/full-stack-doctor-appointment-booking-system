import type { Metadata } from "next";

import VerifyEmailForm from "@/features/auth/components/verify-email";

export const metadata: Metadata = {
    title: "Verify Your Email | Doctor Appointment System",
    description:
        "Verify your email address to activate your patient account.",
};

type VerifyEmailPageProps = {
    searchParams: Promise<{
        email?: string | string[];
    }>;
};

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const params = await searchParams;

    const email = typeof params.email === "string" ? params.email : "";

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
            <section className="w-full max-w-md space-y-6">
                <div className="space-y-3 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-2xl" aria-hidden="true">
                            ✉
                        </span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        Verify your email
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        We sent a six-digit verification code to your email address.
                        Enter the code below to verify your account.
                    </p>
                </div>

                <VerifyEmailForm initialEmail={email} />

                <p className="text-center text-xs text-muted-foreground">
                    The code expires after 10 minutes. You can request another code
                    after the resend cooldown.
                </p>
            </section>
        </main>
    );
}