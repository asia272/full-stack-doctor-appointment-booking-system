"use client";

import DashboardNav from "@/components/dashboard/DashboardNav";
import { doctorNav } from "@/features/doctor/config/nav";

export default function DoctorNav({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <DashboardNav
            items={doctorNav}
            ariaLabel="Doctor navigation"
            onNavigate={onNavigate}
        />
    );
}