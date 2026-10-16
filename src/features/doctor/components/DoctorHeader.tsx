"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { doctorNav } from "@/features/doctor/config/nav";

export default function DoctorHeader() {
    return (
        <DashboardHeader
            items={doctorNav}
            roleLabel="Doctor"
            homeHref="/doctor/dashboard"
        // logoSrc="/assets/assets_doctor/doctor_logo.svg"  // optional own logo
        />
    );
}