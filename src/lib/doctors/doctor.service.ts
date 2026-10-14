import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";

import { getConvexAdminClient } from "@/lib/auth/session";

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

export type AdminDoctor = {
    id: string;
    fullName: string;
    email: string;
    specialty: string;
    degree: string;
    experienceYears: number | null;
    consultationFee: number;
    isActive: boolean;
    imageUrl: string | null;
};

export async function listDoctorsForAdmin(): Promise<AdminDoctor[]> {
    const client = getConvexAdminClient();

    const doctors = await client.query(
        internal.staff.listDoctorsForAdmin as unknown as InternalQuery,
        {},
    );

    return doctors as AdminDoctor[];
}

export async function setDoctorAvailability(
    doctorId: string,
    isActive: boolean,
): Promise<void> {
    const client = getConvexAdminClient();

    await client.mutation(
        internal.staff.setDoctorAvailability as unknown as InternalMutation,
        { doctorId, isActive },
    );
}