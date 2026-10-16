import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireDoctor } from "@/features/doctor/lib/require-doctor";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DoctorHeader from "@/features/doctor/components/DoctorHeader";
import DoctorNav from "@/features/doctor/components/DoctorNav";

export const metadata: Metadata = {
    title: {
        default: "Doctor | Doctor Appointment System",
        template: "%s | Doctor",
    },
    robots: { index: false, follow: false },
};

export default async function DoctorLayout({
    children,
}: {
    children: ReactNode;
}) {
    await requireDoctor();

    return (
        <DashboardShell header={<DoctorHeader />} sidebar={<DoctorNav />}>
            {children}
        </DashboardShell>
    );
}