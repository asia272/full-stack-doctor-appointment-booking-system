
import type { Metadata } from "next";


import RegisterForm from "@/features/auth/components/RegisterForm";
export const metadata: Metadata = {
    title: "Create Account | Doctor Appointment System",
    description: "Create your patient account to book doctor appointments.",
};

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
            <section className="w-full  space-y-6">

                <RegisterForm />
            </section>
        </main>
    );
}
