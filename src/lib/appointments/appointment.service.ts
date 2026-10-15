import "server-only";

import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";
import { getConvexAdminClient } from "@/lib/auth/session";
import type { MyAppointment } from "@/types/my-appointment";

type InternalQuery = FunctionReference<"query">;

// Same pattern as src/lib/auth/auth.service.ts.
function getInternalQuery(ref: unknown): InternalQuery {
    return ref as InternalQuery;
}

/** Appointments of the signed-in patient. Pass the id from the session, never from the client. */
export async function getMyAppointments(
    patientId: string,
): Promise<MyAppointment[]> {
    const client = getConvexAdminClient();

    return (await client.query(
        getInternalQuery(internal.appointments.listMyAppointments),
        { patientId: patientId as never },
    )) as MyAppointment[];
}
