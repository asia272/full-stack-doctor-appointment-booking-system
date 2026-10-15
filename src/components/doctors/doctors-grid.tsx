"use client";

import { usePaginatedQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { DoctorCard, DoctorCardSkeleton } from "./doctor-card";

const PAGE_SIZE = 10;

export function DoctorsGrid() {
    const { results, status, loadMore } = usePaginatedQuery(
        api.doctorsPublic.listDoctors,
        {},
        { initialNumItems: PAGE_SIZE },
    );

    if (status === "LoadingFirstPage") {
        return (
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: PAGE_SIZE }, (_, index) => (
                    <DoctorCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-gray-500">
                No doctors are available right now. Please check back soon.
            </p>
        );
    }

    return (
        <>
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {results.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
            </div>

            {status !== "Exhausted" && (
                <Button
                    type="button"
                    variant="ghost"
                    disabled={status === "LoadingMore"}
                    onClick={() => loadMore(PAGE_SIZE)}
                    className="mt-6 h-auto rounded-full bg-[#EAEFFF] px-12 py-3 text-gray-600 hover:bg-[#dbe3ff]"
                >
                    {status === "LoadingMore" ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        "more"
                    )}
                </Button>
            )}
        </>
    );
}
