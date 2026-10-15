import Link from "next/link";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import type { PublicDoctor } from "@/types/doctor";

interface DoctorCardProps {
    doctor: PublicDoctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
    return (
        <Link
            href={`/doctors/${doctor.id}`}
            className="group block overflow-hidden rounded-xl border border-[#C9D8FF] bg-white transition-transform duration-500 hover:-translate-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]"
        >
            <div className="aspect-square w-full bg-[#EAEFFF]">
                {doctor.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={doctor.imageUrl}
                        alt={doctor.fullName}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="flex size-20 items-center justify-center rounded-full bg-[#5F6FFF]/15 text-2xl font-medium text-[#5F6FFF]">
                            {getInitials(doctor.fullName)}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div
                    className={cn(
                        "flex items-center gap-2 text-xs",
                        doctor.isAvailable ? "text-green-500" : "text-gray-400",
                    )}
                >
                    <span
                        className={cn(
                            "size-2 rounded-full",
                            doctor.isAvailable ? "bg-green-500" : "bg-gray-400",
                        )}
                    />
                    <span>{doctor.isAvailable ? "Available" : "Not available"}</span>
                </div>

                <p className="mt-1 truncate text-base font-medium text-gray-900 sm:text-lg">
                    {doctor.fullName}
                </p>
                <p className="truncate text-xs text-gray-600">{doctor.specialty}</p>
            </div>
        </Link>
    );
}

export function DoctorCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-[#C9D8FF] bg-white">
            <div className="aspect-square w-full animate-pulse bg-[#EAEFFF]" />
            <div className="space-y-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
        </div>
    );
}
