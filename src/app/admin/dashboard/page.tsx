import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import PageHeader from "@/features/admin/components/PageHeader";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
    const user = await requireAdmin();

    return (
        <>
            <PageHeader
                title="Dashboard"
                description={`Welcome back, ${user.fullName}.`}
            />
            {/* stats cards go here */}
        </>
    );
}