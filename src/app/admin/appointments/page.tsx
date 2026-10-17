import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { listAppointmentsForAdmin } from "@/lib/appointments/admin-appointment.service";
import PageHeader from "@/features/admin/components/PageHeader";
import AppointmentsTable from "@/components/dashboard/AppointmentsTable";
import StatusLabel from "@/components/dashboard/StatusLabel";
import CancelAppointmentButton from "@/features/admin/components/CancelappointmentButton";
import { appointmentSummary } from "@/lib/format-appointment";

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
                <AppointmentsTable
                    variant="admin"
                    appointments={appointments}
                    renderAction={(a) =>
                        a.canCancel ? (
                            <CancelAppointmentButton
                                appointmentId={a.id}
                                summary={appointmentSummary(a)}
                            />
                        ) : (
                            <StatusLabel status={a.status} />
                        )
                    }
                />
            )}
        </>
    );
}