"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";

import StatusLabel from "@/components/dashboard/StatusLabel";
import { updateAppointmentStatusAction } from "@/app/actions/doctor-appointments";
import type { AppointmentStatus } from "@/types/appointment";

type Props = { appointmentId: string; status: AppointmentStatus };

type Next = "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED";

const btn =
    "flex size-9 items-center justify-center rounded-full border transition-colors disabled:opacity-50";

export default function DoctorAppointmentActions({
    appointmentId,
    status,
}: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function run(next: Next) {
        setError(null);
        startTransition(async () => {
            const result = await updateAppointmentStatusAction(
                appointmentId,
                next,
            );
            if (!result.ok) setError(result.message);
        });
    }

    // PENDING: reject (X) or confirm (check). CONFIRMED: cancel (X) or complete (check).
    if (status === "PENDING" || status === "CONFIRMED") {
        const negative: Next = status === "PENDING" ? "REJECTED" : "CANCELLED";
        const positive: Next = status === "PENDING" ? "CONFIRMED" : "COMPLETED";

        return (
            <>
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(negative)}
                    aria-label={negative === "REJECTED" ? "Reject" : "Cancel"}
                    className={`${btn} border-red-100 bg-red-50 text-red-500 hover:bg-red-100`}
                >
                    <X className="size-4" />
                </button>
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(positive)}
                    aria-label={
                        positive === "CONFIRMED" ? "Confirm" : "Mark completed"
                    }
                    className={`${btn} border-green-300 text-green-600 hover:bg-green-50`}
                >
                    <Check className="size-4" />
                </button>
                {error && (
                    <span role="alert" className="text-xs text-red-500">
                        {error}
                    </span>
                )}
            </>
        );
    }

    return <StatusLabel status={status} />;
}