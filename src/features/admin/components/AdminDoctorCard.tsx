"use client";

import { useOptimistic, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";
import { toggleDoctorAvailabilityAction } from "@/app/actions/doctor";
import type { AdminDoctor } from "@/lib/doctors/doctor.service";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function AdminDoctorCard({ doctor }: { doctor: AdminDoctor }) {
    const [isPending, startTransition] = useTransition();
    const [available, setAvailable] = useOptimistic(doctor.isActive);

    const checkboxId = `available-${doctor.id}`;

    function handleToggle(next: boolean) {
        startTransition(async () => {
            // Flips instantly; React reverts it automatically if the action fails
            // and the server data does not change.
            setAvailable(next);

            const result = await toggleDoctorAvailabilityAction({
                doctorId: doctor.id,
                isActive: next,
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <article className="group mx-auto w-full max-w-[226px] overflow-hidden rounded-lg border border-[#C9D8FF] bg-background font-['Outfit',sans-serif] transition-shadow hover:shadow-md">
            {/* Image area: square, #EAEFFF, 12px top corners */}
            <div
                className={cn(
                    "relative aspect-square w-full rounded-t-xl bg-[#EAEFFF] transition-colors group-hover:bg-[#DCE5FF]",
                    !available && "bg-muted group-hover:bg-muted",
                )}
            >
                {doctor.imageUrl ? (
                    <Image
                        src={doctor.imageUrl}
                        alt={doctor.fullName}
                        fill
                        sizes="(min-width: 640px) 226px, 46vw"
                        className={cn(
                            "rounded-t-xl object-cover object-top transition duration-300",
                            !available && "opacity-60 grayscale",
                        )}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <User
                            className="size-14 text-muted-foreground/50"
                            aria-hidden="true"
                        />
                    </div>
                )}
            </div>

            {/* Text area */}
            <div className="space-y-2 px-4 py-3">
                <h3 className="truncate text-[18px] font-medium leading-none text-[#1F2937]">
                    {doctor.fullName}
                </h3>
                <p className="truncate text-[14px] font-normal leading-none text-[#4B5563]">
                    {doctor.specialty}
                </p>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id={checkboxId}
                        checked={available}
                        disabled={isPending}
                        onCheckedChange={(value) => handleToggle(value === true)}
                    />
                    <Label
                        htmlFor={checkboxId}
                        className="cursor-pointer text-sm font-normal leading-none"
                    >
                        Available
                    </Label>
                </div>
            </div>
        </article>
    );
}