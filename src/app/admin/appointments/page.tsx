import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import PageHeader from "@/features/admin/components/PageHeader";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AppointmentsPage() {
    const user = await requireAdmin();

    return (
        <>
            <PageHeader
                title="Appointments"
                description={`See all appointmetn here.`}
            />
            {/* stats cards go here */}
        </>
    );
}