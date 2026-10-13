
import type { Metadata } from "next";


import RegisterForm from "@/features/auth/components/LoginForm";
export const metadata: Metadata = {
    title: "Create Account | Doctor Appointment System",
    description: "Create your patient account to book doctor appointments.",
};

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
            <section className="w-full max-w-md space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Create your account
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Register to book and manage your doctor appointments.
                    </p>
                </div>

                <RegisterForm />
            </section>
        </main>
    );
}
