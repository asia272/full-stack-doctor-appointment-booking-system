import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";

import { getConvexAdminClient } from "@/lib/auth/session";
import type { AppointmentView } from "@/types/appointment";

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

export type DoctorAppointmentStatus =
    | "CONFIRMED"
    | "REJECTED"
    | "COMPLETED"
    | "CANCELLED";

export type DoctorDashboardData = {
    stats: { earnings: number; appointments: number; patients: number };
    latestAppointments: AppointmentView[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/** Pass the doctor's user id from the session, never from the client. */
export async function getDoctorDashboardData(
    userId: string,
): Promise<DoctorDashboardData> {
    const client = getConvexAdminClient();

    const data = await client.query(
        internal.doctorAppointments
            .getDoctorDashboardData as unknown as InternalQuery,
        { userId: userId as never },
    );

    return data as DoctorDashboardData;
}

export async function listAppointmentsForDoctor(
    userId: string,
): Promise<AppointmentView[]> {
    const client = getConvexAdminClient();

    const rows = await client.query(
        internal.doctorAppointments
            .listAppointmentsForDoctor as unknown as InternalQuery,
        { userId: userId as never },
    );

    return rows as AppointmentView[];
}

export async function updateAppointmentStatusAsDoctor(
    userId: string,
    appointmentId: string,
    status: DoctorAppointmentStatus,
): Promise<void> {
    const client = getConvexAdminClient();

    try {
        await client.mutation(
            internal.doctorAppointments
                .updateAppointmentStatusByDoctor as unknown as InternalMutation,
            { userId, appointmentId, status },
        );
    } catch (error) {
        const message = getErrorMessage(error);

        if (message.includes("NOT_FOUND")) {
            throw new Error("This appointment no longer exists.");
        }
        if (message.includes("FORBIDDEN")) {
            throw new Error("You cannot change this appointment.");
        }
        if (message.includes("INVALID_TRANSITION")) {
            throw new Error("This appointment can't be changed to that status.");
        }

        console.error("[doctor] Appointment update failed:", error);
        throw new Error("Unable to update the appointment. Please try again.");
    }
}