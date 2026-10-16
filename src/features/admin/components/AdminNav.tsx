"use client";

import DashboardNav from "@/components/dashboard/DashboardNav";
import { adminNav } from "@/features/admin/config/nav";

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <DashboardNav
            items={adminNav}
            ariaLabel="Admin navigation"
            onNavigate={onNavigate}
        />
    );
}