"use server";

import { revalidatePath } from "next/cache";

import { requireDoctor } from "@/features/doctor/lib/require-doctor";
import {
    createDoctorPhotoUploadUrl,
    updateDoctorProfile,
} from "@/lib/doctors/doctor-profile.service";

type ActionResult = { success: boolean; message: string };

type UploadUrlResult =
    | { success: true; url: string }
    | { success: false; message: string };

/** Only a signed-in doctor can get an upload URL. */
export async function getDoctorPhotoUploadUrlAction(): Promise<UploadUrlResult> {
    await requireDoctor();

    try {
        const url = await createDoctorPhotoUploadUrl();
        return { success: true, url };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Something went wrong.",
        };
    }
}

export async function updateDoctorProfileAction(input: {
    about: string;
    address: string;
    consultationFee: number;
    experienceYears?: number;
    isActive: boolean;
    imageStorageId?: string;
}): Promise<ActionResult> {
    const user = await requireDoctor();

    try {
        await updateDoctorProfile(user.id, {
            about: String(input.about ?? ""),
            address: String(input.address ?? ""),
            consultationFee: Number(input.consultationFee),
            experienceYears:
                input.experienceYears === undefined
                    ? undefined
                    : Number(input.experienceYears),
            isActive: input.isActive === true,
            imageStorageId: input.imageStorageId
                ? String(input.imageStorageId)
                : undefined,
        });
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Something went wrong.",
        };
    }

    revalidatePath("/doctor/profile");
    return { success: true, message: "Profile updated successfully." };
}