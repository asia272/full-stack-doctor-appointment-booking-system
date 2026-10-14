
"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { FunctionReference } from "convex/server";
import { Id } from "../../../convex/_generated/dataModel";
import { internal } from "../../../convex/_generated/api";

import {
    getConvexAdminClient,
    getCurrentSessionUser,
} from "@/lib/auth/session";

export type PatientProfileActionState = {
    success: boolean;
    message: string;
};

const internalQuery = (ref: unknown) =>
    ref as FunctionReference<"query">;

const internalMutation = (ref: unknown) =>
    ref as FunctionReference<"mutation">;

function readOptionalText(
    formData: FormData,
    name: string,
): string | undefined {
    const value = formData.get(name);

    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export async function updatePatientProfileAction(
    _previousState: PatientProfileActionState,
    formData: FormData,
): Promise<PatientProfileActionState> {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser || sessionUser.role !== "USER") {
        return {
            success: false,
            message: "Please sign in with your patient account.",
        };
    }

    const fullName = String(formData.get("fullName") ?? "").trim();
    const phoneNumber = readOptionalText(formData, "phoneNumber");
    const address = readOptionalText(formData, "address");
    const dateOfBirth = readOptionalText(formData, "dateOfBirth");
    const rawGender = readOptionalText(formData, "gender");
    const photo = formData.get("photo");

    if (fullName.length < 2 || fullName.length > 100) {
        return {
            success: false,
            message: "Your name must contain between 2 and 100 characters.",
        };
    }

    if (phoneNumber && phoneNumber.length > 30) {
        return { success: false, message: "Phone number is too long." };
    }

    if (address && address.length > 500) {
        return { success: false, message: "Address is too long." };
    }

    const allowedGenders = [
        "MALE",
        "FEMALE",
        "OTHER",
        "PREFER_NOT_TO_SAY",
    ] as const;

    if (
        rawGender !== undefined &&
        !allowedGenders.includes(
            rawGender as (typeof allowedGenders)[number],
        )
    ) {
        return { success: false, message: "Please select a valid gender." };
    }

    if (dateOfBirth) {
        const parsedDate = new Date(`${dateOfBirth}T00:00:00.000Z`);

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== dateOfBirth ||
            parsedDate.getTime() > Date.now()
        ) {
            return {
                success: false,
                message: "Please enter a valid date of birth.",
            };
        }
    }

    if (!(photo instanceof File)) {
        return { success: false, message: "Invalid photo upload." };
    }

    let imageStorageId: Id<"_storage"> | undefined;

    try {
        const client = getConvexAdminClient();

        if (photo.size > 0) {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

            if (!allowedTypes.includes(photo.type)) {
                return {
                    success: false,
                    message: "Choose a JPG, PNG, or WebP image.",
                };
            }

            if (photo.size > 5 * 1024 * 1024) {
                return {
                    success: false,
                    message: "Your photo must be 5 MB or smaller.",
                };
            }

            const uploadUrl = await client.mutation(
                internalMutation(
                    internal.patients.generateProfileUploadUrl,
                ),
                {},
            );

            const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": photo.type },
                body: photo,
            });

            if (!uploadResponse.ok) {
                throw new Error("PHOTO_UPLOAD_FAILED");
            }

            const uploaded = (await uploadResponse.json()) as {
                storageId: Id<"_storage">;
            };

            imageStorageId = uploaded.storageId;
        }

        await client.mutation(
            internalMutation(internal.patients.updateProfile),
            {
                userId: sessionUser.id as Id<"users">,
                fullName,
                ...(phoneNumber !== undefined ? { phoneNumber } : {}),
                ...(address !== undefined ? { address } : {}),
                ...(dateOfBirth !== undefined ? { dateOfBirth } : {}),
                ...(rawGender !== undefined
                    ? {
                        gender: rawGender as
                            | "MALE"
                            | "FEMALE"
                            | "OTHER"
                            | "PREFER_NOT_TO_SAY",
                    }
                    : {}),
                ...(imageStorageId !== undefined ? { imageStorageId } : {}),
            },
        );

        revalidatePath("/my-profile");
        revalidatePath("/");

        return {
            success: true,
            message: "Your profile has been updated successfully.",
        };
    } catch (error) {
        console.error("Patient profile update failed:", error);

        return {
            success: false,
            message: "We couldn't update your profile. Please try again.",
        };
    }
}
