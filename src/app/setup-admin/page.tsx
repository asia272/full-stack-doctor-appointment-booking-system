
import type { Metadata } from "next";
import SetupAdminForm from "@/features/auth/components/SetupAdminForm";

export const metadata: Metadata = {
    title: "Initial Admin Setup",
    robots: {
        index: false,
        follow: false,
    },
};

export default function SetupAdminPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-5 py-12">
            <section className="w-full space-y-6">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-wider">
                        Initial setup
                    </p>
                    <h1 className="text-3xl font-semibold">
                        Create the administrator account
                    </h1>
                    <p className="text-sm opacity-75">
                        Verify your configured admin email to finish the one-time setup.
                    </p>
                </div>

                <SetupAdminForm />
            </section>
        </main>
    );
}
