import { DoctorCard } from "./doctor-card";
import type { PublicDoctor } from "@/types/doctor";

interface RelatedDoctorsProps {
    doctors: PublicDoctor[];
}

export function RelatedDoctors({ doctors }: RelatedDoctorsProps) {
    if (doctors.length === 0) return null;

    return (
        <section className="mt-20 flex flex-col items-center gap-4 text-gray-900">
            <h2 className="text-3xl font-medium">Related Doctors</h2>
            <p className="mb-4 text-center text-sm text-gray-600">
                Simply browse through our extensive list of trusted doctors.
            </p>

            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
            </div>
        </section>
    );
}
