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
        <article className="group overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-md">
            <div
                className={cn(
                    "relative aspect-[4/5] bg-primary/10 transition-colors group-hover:bg-primary/25",
                    !available && "bg-muted group-hover:bg-muted",
                )}
            >
                {doctor.imageUrl ? (
                    <Image
                        src={doctor.imageUrl}
                        alt={doctor.fullName}
                        fill
                        sizes="(min-width: 1536px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
                        className={cn(
                            "object-cover object-top transition duration-300",
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

            <div className="space-y-1 p-4">
                <h3 className="truncate text-base font-semibold">
                    {doctor.fullName}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                    {doctor.specialty}
                </p>

                <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                        id={checkboxId}
                        checked={available}
                        disabled={isPending}
                        onCheckedChange={(value) => handleToggle(value === true)}
                    />
                    <Label
                        htmlFor={checkboxId}
                        className="cursor-pointer text-sm font-normal"
                    >
                        Available
                    </Label>
                </div>
            </div>
        </article>
    );
}