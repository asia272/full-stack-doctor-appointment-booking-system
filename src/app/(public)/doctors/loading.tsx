import { DoctorCardSkeleton } from "@/components/doctors/doctor-card";

export default function DoctorsLoading() {
    return (
        <div>
            <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-5 flex flex-col gap-5 sm:flex-row">
                <div className="flex flex-wrap gap-2 sm:w-56 sm:flex-col sm:gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-8 w-32 animate-pulse rounded bg-gray-200 sm:w-full"
                        />
                    ))}
                </div>
                <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 gap-y-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <DoctorCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}