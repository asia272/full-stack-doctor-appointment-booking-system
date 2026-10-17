import type { Metadata } from "next";

import { requireDoctor } from "@/features/doctor/lib/require-doctor";
import { getDoctorDashboardData } from "@/lib/appointments/doctor-appointment.service";
import StatCard from "@/components/dashboard/StatCard";
import LatestAppointments from "@/components/dashboard/LatestAppointments";
import DoctorAppointmentActions from "@/features/doctor/components/DoctorAppointmentActions";
import { formatMoney } from "@/lib/format-appointment";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DoctorDashboardPage() {
    const user = await requireDoctor();

    const { stats, latestAppointments } = await getDoctorDashboardData(user.id);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    iconSrc="/assets/assets_admin/earning_icon.svg"
                    value={formatMoney(stats.earnings)}
                    label="Earnings"
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
                title="Latest Bookings"
                show="patient"
                appointments={latestAppointments}
                renderAction={(a) => (
                    <DoctorAppointmentActions
                        appointmentId={a.id}
                        status={a.status}
                    />
                )}
            />
        </div>
    );
}