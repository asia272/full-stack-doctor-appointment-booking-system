import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { listAppointmentsForAdmin } from "@/lib/appointments/admin-appointment.service";
import PageHeader from "@/features/admin/components/PageHeader";
import AdminAppointmentsTable from "@/features/admin/components/AdminAppointmentsTable";

export const metadata: Metadata = { title: "All Appointments" };

export default async function AppointmentsPage() {
    await requireAdmin();
    const appointments = await listAppointmentsForAdmin();

    return (
        <>
            <PageHeader title="All Appointments" />

            {appointments.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background p-12 text-center text-sm text-muted-foreground">
                    No appointments have been booked yet.
                </div>
            ) : (
                <AdminAppointmentsTable appointments={appointments} />
            )}
        </>
    );
}