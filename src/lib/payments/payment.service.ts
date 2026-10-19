import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";
import { getConvexAdminClient } from "@/lib/auth/session";

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

export type PayableAppointment = {
    id: string;
    fee: number;
    patientEmail: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    timeLabel: string;
};

export type MarkPaidOutcome =
    | "PAID"
    | "ALREADY_PAID"
    | "IGNORED"
    | "AMOUNT_MISMATCH"
    | "PAID_BUT_INACTIVE";

export async function getPayableAppointment(
    patientId: string,
    appointmentId: string,
): Promise<PayableAppointment> {
    const client = getConvexAdminClient();

    return (await client.query(
        internal.payments.getPayableAppointment as unknown as InternalQuery,
        { patientId: patientId as never, appointmentId: appointmentId as never },
    )) as PayableAppointment;
}

export async function markAppointmentPaid(input: {
    appointmentId: string;
    sessionId: string;
    paymentIntentId?: string;
    amountTotal: number;
}): Promise<MarkPaidOutcome> {
    const client = getConvexAdminClient();

    const result = (await client.mutation(
        internal.payments.markAppointmentPaid as unknown as InternalMutation,
        input,
    )) as { outcome: MarkPaidOutcome };

    return result.outcome;
}