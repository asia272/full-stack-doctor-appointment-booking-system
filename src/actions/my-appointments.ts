"use server";

import { revalidatePath } from "next/cache";
import { ConvexError } from "convex/values";
import type { FunctionReference } from "convex/server";
import { internal } from "../../convex/_generated/api";
import { getConvexAdminClient, getCurrentSessionUser } from "@/lib/auth/session";
import type { CancelAppointmentResult } from "@/types/my-appointment";

type InternalMutation = FunctionReference<"mutation">;

// Same pattern as src/lib/auth/auth.service.ts.
function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

const ERROR_MESSAGES: Record<string, string> = {
    UNAUTHENTICATED: "Please log in to manage your appointments.",
    FORBIDDEN: "Only user accounts can manage appointments.",
    NOT_FOUND: "We couldn't find that appointment.",
    NOT_CANCELLABLE: "This appointment can no longer be cancelled.",
    ALREADY_PAST: "This appointment time has already passed.",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

function fail(code: string): CancelAppointmentResult {
    return {
        ok: false,
        code,
        message: ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE,
    };
}

function extractErrorCode(error: unknown): string {
    if (error instanceof ConvexError && typeof error.data === "string") {
        return error.data;
    }

    const message = error instanceof Error ? error.message : String(error);

    return (
        Object.keys(ERROR_MESSAGES).find((code) => message.includes(code)) ??
        "UNKNOWN"
    );
}

export async function cancelAppointmentAction(
    appointmentId: string,
): Promise<CancelAppointmentResult> {
    const user = await getCurrentSessionUser();

    if (!user) return fail("UNAUTHENTICATED");
    if (user.role !== "USER") return fail("FORBIDDEN");

    try {
        const client = getConvexAdminClient();

        await client.mutation(
            getInternalMutation(internal.appointments.cancelAppointment),
            {
                patientId: user.id as never,
                appointmentId: appointmentId as never,
            },
        );

        revalidatePath("/my-appointments");

        return { ok: true };
    } catch (error) {
        const code = extractErrorCode(error);

        if (code === "UNKNOWN") console.error("cancelAppointmentAction", error);

        return fail(code);
    }
}
