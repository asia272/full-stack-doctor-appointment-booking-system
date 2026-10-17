import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { getAdminDashboardData } from "@/lib/appointments/admin-appointment.service";
import StatCard from "@/components/dashboard/StatCard";
import StatusLabel from "@/components/dashboard/StatusLabel";
import LatestAppointments from "@/components/dashboard/LatestAppointments";
import CancelAppointmentButton from "@/features/admin/components/CancelappointmentButton";
import { appointmentSummary } from "@/lib/format-appointment";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
    await requireAdmin();

    const { stats, latestAppointments } = await getAdminDashboardData();

    return (
        <div className="max-w-4xl space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    iconSrc="/assets/assets_admin/doctor_icon.svg"
                    value={stats.doctors}
                    label="Doctors"
                />

                <StatCard
                    iconSrc="/assets/assets_admin/appointments_icon.svg"
                    value={stats.appointments}
                    label="Appointments"
                />

                <StatCard
                    iconSrc="/assets/assets_admin/patients_icon.svg"
                    value={stats.patients}
                    label="Patients"
                />
            </div>

            <LatestAppointments
                title="Latest Appointment"
                show="doctor"
                appointments={latestAppointments}
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
        </div>
    );
}