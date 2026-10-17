import type { Metadata } from "next";

import { requireDoctor } from "@/features/doctor/lib/require-doctor";
import { getDoctorProfile } from "@/lib/doctors/doctor-profile.service";
import DoctorProfileView from "@/features/doctor/components/DoctorProfileView";

export const metadata: Metadata = { title: "Profile" };

export default async function DoctorProfilePage() {
    const user = await requireDoctor();
    const profile = await getDoctorProfile(user.id);

    return <DoctorProfileView profile={profile} />;
}