import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { BookingPanel } from "@/components/booking/booking-panel";
import { DoctorProfile } from "@/components/doctors/doctor-profile";
import { RelatedDoctors } from "@/components/doctors/related-doctors";

interface DoctorPageProps {
    params: Promise<{ doctorId: string }>;
}

// Shared between generateMetadata and the page so Convex is hit once.
const getDoctor = cache((doctorId: string) =>
    fetchQuery(api.doctorsPublic.getDoctorById, { doctorId }),
);

export async function generateMetadata({
    params,
}: DoctorPageProps): Promise<Metadata> {
    const { doctorId } = await params;
    const doctor = await getDoctor(doctorId);

    if (!doctor) return { title: "Doctor not found" };

    return {
        title: `${doctor.fullName} · ${doctor.specialty}`,
        description: doctor.about.slice(0, 160),
    };
}

export default async function DoctorPage({ params }: DoctorPageProps) {
    const { doctorId } = await params;
    const doctor = await getDoctor(doctorId);

    if (!doctor) notFound();

    const relatedDoctors = await fetchQuery(
        api.doctorsPublic.listRelatedDoctors,
        { doctorId: doctor.id as Id<"doctors"> },
    );

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            <DoctorProfile doctor={doctor} />

            <BookingPanel
                doctorId={doctor.id}
                doctorName={doctor.fullName}
                isAvailable={doctor.isAvailable}
            />

            <RelatedDoctors doctors={relatedDoctors} />
        </main>
    );
}
