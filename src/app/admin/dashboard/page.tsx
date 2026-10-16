import type { Metadata } from "next";
import { CalendarCheck, Stethoscope, Users } from "lucide-react";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { getAdminDashboardData } from "@/lib/appointments/admin-appointment.service";
import AdminStatCard from "@/features/admin/components/AdminStatCard";
import LatestAppointments from "@/features/admin/components/LatestAppointments";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
    await requireAdmin();
    const { stats, latestAppointments } = await getAdminDashboardData();

    return (
        <div className="max-w-4xl space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                <AdminStatCard icon={Stethoscope} value={stats.doctors} label="Doctors" />
                <AdminStatCard
                    icon={CalendarCheck}
                    value={stats.appointments}
                    label="Appointments"
                />
                <AdminStatCard icon={Users} value={stats.patients} label="Patients" />
            </div>

            <LatestAppointments appointments={latestAppointments} />
        </div>
    );
}