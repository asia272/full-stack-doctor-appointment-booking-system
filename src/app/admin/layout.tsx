import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import AdminHeader from "@/features/admin/components/AdminHeader";
import AdminNav from "@/features/admin/components/AdminNav";

export const metadata: Metadata = {
    title: {
        default: "Admin | Doctor Appointment System",
        template: "%s | Admin",
    },
    robots: { index: false, follow: false },
};

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    await requireAdmin();

    return (
        <div className="flex min-h-svh flex-col bg-muted/30">
            <AdminHeader />

            <div className="flex flex-1">
                <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-[340px] shrink-0 overflow-y-auto border-r border-[#BEBEBE] bg-background md:block">
                    <AdminNav />
                </aside>

                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}