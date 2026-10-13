
"use server";

import { requireAdmin } from "@/lib/auth/dal";
import { createDoctorAccount } from "@/lib/auth/staff.service";
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
