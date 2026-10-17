"use server";

import { revalidatePath } from "next/cache";

import { requireDoctor } from "@/features/doctor/lib/require-doctor";
import {
    updateAppointmentStatusAsDoctor,
    type DoctorAppointmentStatus,
} from "@/lib/appointments/doctor-appointment.service";

const ALLOWED: DoctorAppointmentStatus[] = [
    "CONFIRMED",
    "REJECTED",
    "COMPLETED",
    "CANCELLED",
];

export async function updateAppointmentStatusAction(
    appointmentId: string,
    status: DoctorAppointmentStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
    const user = await requireDoctor();

    if (!ALLOWED.includes(status)) {
        return { ok: false, message: "Invalid status." };
    }

    try {
        await updateAppointmentStatusAsDoctor(user.id, appointmentId, status);
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong.",
        };
    }

    revalidatePath("/doctor/dashboard");
    revalidatePath("/doctor/appointments");
    return { ok: true };
}