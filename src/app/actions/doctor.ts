"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/dal";
import { createDoctorAccount } from "@/lib/auth/staff.service";
import { setDoctorAvailability } from "@/lib/doctors/doctor.service";
import { doctorCreateSchema } from "@/lib/validations/doctor.schema";

export type DoctorActionState = {
    success: boolean;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

export async function createDoctorAction(
    _previousState: DoctorActionState,
    formData: FormData,
): Promise<DoctorActionState> {
    try {
        await requireAdmin();
    } catch {
        return {
            success: false,
            message: "You are not authorized to create doctor accounts.",
        };
    }

    const parsed = doctorCreateSchema.safeParse({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
        specialty: formData.get("specialty"),
        degree: formData.get("degree"),
        about: formData.get("about"),
        consultationFee: formData.get("consultationFee"),
        address: formData.get("address"),
        experienceYears: formData.get("experienceYears"),
        // formData.get returns null when missing; null would fail .optional()
        imageStorageId: formData.get("imageStorageId") || undefined,
    });

    if (!parsed.success) {
        return {
            success: false,
            message: "Please correct the highlighted fields.",
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {
        await createDoctorAccount(parsed.data);
        revalidatePath("/admin/doctors");

        return {
            success: true,
            message:
                "Doctor account created successfully. The doctor can now sign in through the staff login page.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to create the doctor account. Please try again.",
        };
    }
}

const toggleSchema = z.object({
    doctorId: z.string().min(1),
    isActive: z.boolean(),
});

export type ToggleAvailabilityResult = {
    success: boolean;
    message: string;
};

export async function toggleDoctorAvailabilityAction(
    input: z.infer<typeof toggleSchema>,
): Promise<ToggleAvailabilityResult> {
    try {
        await requireAdmin();
    } catch {
        return { success: false, message: "You are not authorized to do this." };
    }

    const parsed = toggleSchema.safeParse(input);

    if (!parsed.success) {
        return { success: false, message: "Invalid request." };
    }

    try {
        await setDoctorAvailability(parsed.data.doctorId, parsed.data.isActive);
        revalidatePath("/admin/doctors");

        return {
            success: true,
            message: parsed.data.isActive
                ? "Doctor is now available."
                : "Doctor marked as unavailable.",
        };
    } catch {
        return {
            success: false,
            message: "Unable to update availability. Please try again.",
        };
    }
}