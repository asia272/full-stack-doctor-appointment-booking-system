"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/dal";
import { cancelAppointmentAsAdmin } from "@/lib/appointments/admin-appointment.service";

const cancelSchema = z.object({
    appointmentId: z.string().min(1),
});

export type CancelAppointmentResult = {
    success: boolean;
    message: string;
};

export async function cancelAppointmentByAdminAction(
    input: z.infer<typeof cancelSchema>,
): Promise<CancelAppointmentResult> {
    try {
        await requireAdmin();
    } catch {
        return { success: false, message: "You are not authorized to do this." };
    }

    const parsed = cancelSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: "Invalid request." };
    }

    try {
        await cancelAppointmentAsAdmin(parsed.data.appointmentId);

        revalidatePath("/admin/appointments");
        revalidatePath("/admin/dashboard");

        return { success: true, message: "Appointment cancelled." };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to cancel the appointment. Please try again.",
        };
    }
}