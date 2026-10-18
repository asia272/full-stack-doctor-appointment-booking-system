import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";

import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { SPECIALITIES } from "@/constants/specialities";
import { DoctorCard } from "@/components/doctors/doctor-card";
import type { PublicDoctor } from "@/types/doctor";

export const metadata: Metadata = { title: "All Doctors" };

type PageProps = {
    searchParams: Promise<{ specialty?: string | string[] }>;
};

export default async function DoctorsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const raw = Array.isArray(params.specialty)
        ? params.specialty[0]
        : params.specialty;
    const specialty = raw?.trim().slice(0, 100) || undefined;

    const doctors = (await fetchQuery(api.doctorsPublic.listPublicDoctors, {
        specialty,
    })) as PublicDoctor[];

    return (
        <section aria-labelledby="doctors-heading">
            <h1
                id="doctors-heading"
                className="text-lg text-[#4B5563] sm:text-xl"
            >
                Browse through the doctors specialist.
            </h1>

            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
                {/* Filters */}
                <nav
                    aria-label="Filter by speciality"
                    className="flex flex-wrap gap-3 lg:w-[300px] lg:shrink-0 lg:flex-col lg:gap-4"
                >
                    {SPECIALITIES.map((name) => {
                        const active = specialty === name;

                        return (
                            <Link
                                key={name}
                                // Clicking the active one clears the filter.
                                href={
                                    active
                                        ? "/doctors"
                                        : `/doctors?specialty=${encodeURIComponent(name)}`
                                }
                                aria-current={active ? "true" : undefined}
                                className={cn(
                                    "flex min-h-12 items-center rounded-md border border-[#ADADAD] bg-white px-4 text-base text-[#4B5563] transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:h-14 lg:w-full lg:px-5",
                                    active &&
                                    "border-[#E2E5FF] bg-[#E2E5FF] text-[#262626]",
                                )}
                            >
                                {name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Doctors */}
                <div className="min-w-0 flex-1">
                    {doctors.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                            No doctors found
                            {specialty ? ` for "${specialty}"` : ""}.
                            {specialty && (
                                <>
                                    {" "}
                                    <Link
                                        href="/doctors"
                                        className="text-primary underline"
                                    >
                                        Show all doctors
                                    </Link>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-x-6 md:gap-y-10 xl:grid-cols-4">
                            {doctors.map((doctor) => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}