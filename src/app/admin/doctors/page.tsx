import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import { listDoctorsForAdmin } from "@/lib/doctors/doctor.service";
import PageHeader from "@/features/admin/components/PageHeader";
import AdminDoctorCard from "@/features/admin/components/AdminDoctorCard";

export const metadata: Metadata = { title: "All Doctors" };

export default async function DoctorsPage() {
    await requireAdmin();
    const doctors = await listDoctorsForAdmin();

    return (
        <>
            <PageHeader title="All Doctors" />

            {doctors.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-background p-12 text-center text-sm text-muted-foreground">
                    No doctors yet. Use <strong>Add Doctor</strong> to create the
                    first one.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
                    {doctors.map((doctor) => (
                        <AdminDoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            )}
        </>
    );
}