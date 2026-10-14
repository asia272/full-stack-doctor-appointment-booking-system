import type { Metadata } from "next";

import { requireAdmin } from "@/features/admin/lib/require-admin";
import PageHeader from "@/features/admin/components/PageHeader";
import CreateDoctorForm from "@/features/admin/components/CreateDoctorForm";

export const metadata: Metadata = { title: "Add Doctor" };

export default async function AddDoctorPage() {
    await requireAdmin();

    return (
        <>
            <PageHeader title="Add Doctor" />
            <CreateDoctorForm />
        </>
    );
}