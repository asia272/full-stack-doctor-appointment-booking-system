import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import DashboardShell from "@/components/dashboard/DashboardShell";
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
        <DashboardShell header={<AdminHeader />} sidebar={<AdminNav />}>
            {children}
        </DashboardShell>
    );
}