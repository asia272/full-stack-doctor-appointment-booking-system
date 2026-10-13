
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/dal";
import CreateDoctorForm from "@/features/admin/components/CreateDoctorForm";

export const metadata: Metadata = {
    title: "Admin Dashboard | Doctor Appointment System",
    description: "Manage doctor accounts.",
};

export default async function AdminDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/staff/login");
    }

    if (user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <main className="mx-auto w-full max-w-5xl space-y-8 px-5 py-12">
            <header className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-wider">
                    Administrator
                </p>
                <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm opacity-75">
                    Signed in as {user.fullName}. Create and manage doctor accounts.
                </p>
            </header>

            <section className="space-y-6 rounded-xl border p-5 sm:p-8">
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Register a doctor</h2>
                    <p className="text-sm opacity-75">
                        The doctor account and professional profile will be
                        created together.
                    </p>
                </div>

                <CreateDoctorForm />
            </section>
        </main>
    );
}
