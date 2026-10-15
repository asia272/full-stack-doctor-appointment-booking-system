import { BadgeCheck, Info } from "lucide-react";
import { formatExperience, formatFee, getInitials } from "@/lib/format";
import type { PublicDoctor } from "@/types/doctor";

interface DoctorProfileProps {
    doctor: PublicDoctor;
}

export function DoctorProfile({ doctor }: DoctorProfileProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-full shrink-0 overflow-hidden rounded-lg bg-[#5F6FFF] sm:w-72">
                {doctor.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={doctor.imageUrl}
                        alt={doctor.fullName}
                        className="w-full object-cover"
                    />
                ) : (
                    <div className="flex aspect-square w-full items-center justify-center">
                        <span className="flex size-28 items-center justify-center rounded-full bg-white/20 text-4xl font-medium text-white">
                            {getInitials(doctor.fullName)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 rounded-lg border border-[#ADADAD] bg-white px-6 py-7 sm:px-8">
                <h1 className="flex items-center gap-2 text-2xl font-medium text-gray-900">
                    {doctor.fullName}
                    <BadgeCheck
                        className="size-5 fill-[#5F6FFF] text-white"
                        aria-label="Verified doctor"
                    />
                </h1>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <p>
                        {doctor.degree} - {doctor.specialty}
                    </p>
                    {doctor.experienceYears !== null && (
                        <span className="rounded-full border px-2 py-0.5 text-xs">
                            {formatExperience(doctor.experienceYears)}
                        </span>
                    )}
                </div>

                <div className="mt-3">
                    <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        About <Info className="size-3.5" />
                    </p>
                    <p className="mt-1 max-w-[700px] text-sm text-gray-600">
                        {doctor.about}
                    </p>
                </div>

                <p className="mt-4 font-medium text-gray-600">
                    Appointment fee:{" "}
                    <span className="text-gray-900">
                        {formatFee(doctor.consultationFee)}
                    </span>
                </p>
            </div>
        </div>
    );
}
