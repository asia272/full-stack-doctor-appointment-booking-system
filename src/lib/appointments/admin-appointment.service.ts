import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";

import { getConvexAdminClient } from "@/lib/auth/session";

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

export type AppointmentStatus =
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED";

export type AdminAppointment = {
    id: string;
    status: AppointmentStatus;
    appointmentDate: string;
    appointmentTime: string;
    timeLabel: string;
    consultationFee: number;
    canCancel: boolean;
    patient: {
        fullName: string;
        imageUrl: string | null;
        age: number | null;
    } | null;
    doctor: {
        fullName: string;
        specialty: string;
        imageUrl: string | null;
    } | null;
};

export type AdminDashboardData = {
    stats: { doctors: number; appointments: number; patients: number };
    latestAppointments: AdminAppointment[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
    const client = getConvexAdminClient();

    const data = await client.query(
        internal.adminAppointments.getAdminDashboardData as unknown as InternalQuery,
        {},
    );

    return data as AdminDashboardData;
}

export async function listAppointmentsForAdmin(): Promise<AdminAppointment[]> {
    const client = getConvexAdminClient();

    const rows = await client.query(
        internal.adminAppointments.listAppointmentsForAdmin as unknown as InternalQuery,
        {},
    );

    return rows as AdminAppointment[];
}

export async function cancelAppointmentAsAdmin(
    appointmentId: string,
): Promise<void> {
    const client = getConvexAdminClient();

    try {
        await client.mutation(
            internal.adminAppointments.cancelAppointmentByAdmin as unknown as InternalMutation,
            { appointmentId },
        );
    } catch (error) {
        const message = getErrorMessage(error);

        if (message.includes("NOT_FOUND")) {
            throw new Error("This appointment no longer exists.");
        }

        if (message.includes("NOT_CANCELLABLE")) {
            throw new Error("This appointment can no longer be cancelled.");
        }

        console.error("[admin] Appointment cancellation failed:", error);
        throw new Error("Unable to cancel the appointment. Please try again.");
    }
}