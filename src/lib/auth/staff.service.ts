
import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";

import type { DoctorCreateInput } from "@/lib/validations/doctor.schema";
import { hashPassword } from "./passwords";
import { getConvexAdminClient } from "./session";

type InternalMutation = FunctionReference<"mutation">;

function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function createDoctorAccount(
    input: DoctorCreateInput,
): Promise<void> {
    const client = getConvexAdminClient();
    const passwordHash = await hashPassword(input.password);

    try {
        await client.mutation(
            getInternalMutation(internal.staff.createDoctor),
            {
                fullName: input.fullName,
                email: input.email,
                passwordHash,
                specialty: input.specialty,
                degree: input.degree,
                about: input.about,
                consultationFee: input.consultationFee,
                address: input.address,
                ...(input.experienceYears !== undefined
                    ? { experienceYears: input.experienceYears }
                    : {}),
            },
        );
    } catch (error) {
        const message = getErrorMessage(error);

        if (message.includes("EMAIL_ALREADY_EXISTS")) {
            throw new Error("An account with this email already exists.");
        }

        if (message.includes("INVALID_")) {
            throw new Error(
                "Some doctor details are invalid. Please review the form.",
            );
        }

        console.error("[staff] Doctor account creation failed:", error);
        throw new Error("Unable to create the doctor account. Please try again.");
    }
}
