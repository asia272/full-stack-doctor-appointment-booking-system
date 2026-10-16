import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DoctorDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            {/* Reuse AdminStatCard / LatestAppointments here with doctor-only data */}
        </div>
    );
}