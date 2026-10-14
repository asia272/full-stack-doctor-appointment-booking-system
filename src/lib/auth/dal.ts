
import "server-only";

import {
    getCurrentSessionUser,
    type AppRole,
    type SessionUser,
} from "./session";

export async function getCurrentUser(): Promise<SessionUser | null> {
    return getCurrentSessionUser();
}

export async function requireUser(): Promise<SessionUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("UNAUTHORIZED");
    }

    return user;
}

export async function requireRole(
    ...allowedRoles: AppRole[]
): Promise<SessionUser> {
    const user = await requireUser();

    if (!allowedRoles.includes(user.role)) {
        throw new Error("FORBIDDEN");
    }

    return user;
}

export const requireAdmin = () => requireRole("ADMIN");
export const requireDoctor = () => requireRole("DOCTOR");
export const requirePatient = () => requireRole("USER");
