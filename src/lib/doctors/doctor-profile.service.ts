import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";

import { getConvexAdminClient } from "@/lib/auth/session";
import type {
    DoctorProfile,
    UpdateDoctorProfileInput,
} from "@/types/doctor-profile";

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/** Pass the doctor's user id from the session, never from the client. */
export async function getDoctorProfile(userId: string): Promise<DoctorProfile> {
    const client = getConvexAdminClient();

    const data = await client.query(
        internal.doctorProfile.getDoctorProfile as unknown as InternalQuery,
        { userId: userId as never },
    );

    return data as DoctorProfile;
}

export async function createDoctorPhotoUploadUrl(): Promise<string> {
    const client = getConvexAdminClient();

    try {
        const url = await client.mutation(
            internal.doctorProfile
                .generateDoctorPhotoUploadUrl as unknown as InternalMutation,
            {},
        );

        return url as string;
    } catch (error) {
        console.error("[doctor] Photo upload URL failed:", error);
        throw new Error("Unable to start the photo upload. Please try again.");
    }
}

export async function updateDoctorProfile(
    userId: string,
    input: UpdateDoctorProfileInput,
): Promise<void> {
    const client = getConvexAdminClient();

    try {
        await client.mutation(
            internal.doctorProfile.updateDoctorProfile as unknown as InternalMutation,
            { userId: userId as never, ...input },
        );
    } catch (error) {
        const message = getErrorMessage(error);

        if (message.includes("INVALID_ABOUT")) {
            throw new Error("About must be between 10 and 3000 characters.");
        }
        if (message.includes("INVALID_ADDRESS")) {
            throw new Error("Address must be between 2 and 300 characters.");
        }
        if (message.includes("INVALID_CONSULTATION_FEE")) {
            throw new Error("Enter a valid appointment fee.");
        }
        if (message.includes("INVALID_EXPERIENCE_YEARS")) {
            throw new Error("Experience must be a whole number from 0 to 80.");
        }
        if (message.includes("INVALID_IMAGE")) {
            throw new Error("Photo must be a JPG, PNG or WebP up to 5 MB.");
        }
        if (message.includes("DOCTOR_NOT_FOUND")) {
            throw new Error("Doctor profile not found.");
        }

        console.error("[doctor] Profile update failed:", error);
        throw new Error("Unable to update your profile. Please try again.");
    }
}