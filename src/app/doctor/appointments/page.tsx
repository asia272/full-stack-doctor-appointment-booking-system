import type { Metadata } from "next";

import { requireDoctor } from "@/features/doctor/lib/require-doctor";
import { listAppointmentsForDoctor } from "@/lib/appointments/doctor-appointment.service";
import PageHeader from "@/features/admin/components/PageHeader";
import AppointmentsTable from "@/components/dashboard/AppointmentsTable";
import DoctorAppointmentActions from "@/features/doctor/components/DoctorAppointmentActions";

export const metadata: Metadata = { title: "All Appointments" };

export default async function DoctorAppointmentsPage() {
    const user = await requireDoctor();
    const appointments = await listAppointmentsForDoctor(user.id);

    return (
        <>
            <PageHeader title="All Appointments" />

            {appointments.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background p-12 text-center text-sm text-muted-foreground">
                    No appointments have been booked yet.
                </div>
            ) : (
                <AppointmentsTable
                    variant="doctor"
                    appointments={appointments}
                    renderAction={(a) => (
                        <DoctorAppointmentActions
                            appointmentId={a.id}
                            status={a.status}
                        />
                    )}
                />
            )}
        </>
    );
}