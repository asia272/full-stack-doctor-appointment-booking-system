"use server";

import { ConvexError } from "convex/values";
import type { FunctionReference } from "convex/server";
import { internal } from "../../convex/_generated/api";
import { getConvexAdminClient, getCurrentSessionUser } from "@/lib/auth/session";
import type { BookAppointmentResult } from "@/types/appointment";

type InternalMutation = FunctionReference<"mutation">;

// Same pattern as src/lib/auth/auth.service.ts.
function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

const ERROR_MESSAGES: Record<string, string> = {
    UNAUTHENTICATED: "Please create an account or log in to book an appointment.",
    PATIENT_ONLY: "Only user accounts can book appointments.",
    INVALID_PATIENT: "Your account cannot book appointments right now.",
    DOCTOR_UNAVAILABLE: "This doctor is not accepting appointments right now.",
    INVALID_DATE: "Please choose a valid date.",
    INVALID_TIME: "Please choose a valid time.",
    DATE_OUT_OF_RANGE: "That date is not open for booking.",
    INVALID_SLOT: "That time slot does not exist.",
    SLOT_IN_PAST: "That time has already passed. Please pick a later slot.",
    SLOT_TAKEN: "Sorry, that slot was just booked. Please pick another time.",
    PATIENT_ALREADY_BOOKED:
        "You already have an appointment at that date and time.",
    INVALID_REASON: "The reason is too long.",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

function fail(code: string): BookAppointmentResult {
    return {
        ok: false,
        code,
        message: ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE,
    };
}

/** Pulls our error code out of a ConvexError, or out of the message text. */
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

interface BookAppointmentInput {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
}

export async function bookAppointmentAction(
    input: BookAppointmentInput,
): Promise<BookAppointmentResult> {
    const user = await getCurrentSessionUser();

    if (!user) return fail("UNAUTHENTICATED");
    if (user.role !== "USER") return fail("PATIENT_ONLY");

    try {
        const client = getConvexAdminClient();

        const result = (await client.mutation(
            getInternalMutation(internal.appointments.createAppointment),
            {
                patientId: user.id as never,
                doctorId: input.doctorId as never,
                appointmentDate: input.appointmentDate,
                appointmentTime: input.appointmentTime,
                ...(input.reason ? { reason: input.reason } : {}),
            },
        )) as { appointmentId: string };

        return { ok: true, appointmentId: result.appointmentId };
    } catch (error) {
        const code = extractErrorCode(error);

        if (code === "UNKNOWN") console.error("bookAppointmentAction", error);

        return fail(code);
    }
}
