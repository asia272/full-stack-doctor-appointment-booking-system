
import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";

import { internal } from "../../../convex/_generated/api";

const SESSION_COOKIE_NAME = "doctor_appointment_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type AppRole = "ADMIN" | "DOCTOR" | "USER";

export type SessionUser = {
    id: string;
    fullName: string;
    email: string;
    role: AppRole;
};

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

function getInternalQuery(ref: unknown): InternalQuery {
    return ref as InternalQuery;
}

function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

function hashSessionToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export function getConvexAdminClient(): ConvexHttpClient {
    const url =
        process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;

    const deployKey = process.env.CONVEX_DEPLOY_KEY;

    if (!url) {
        throw new Error("Missing CONVEX_URL environment variable.");
    }

    if (!deployKey) {
        throw new Error("Missing CONVEX_DEPLOY_KEY environment variable.");
    }

    const client = new ConvexHttpClient(url);

    // Keep the Convex deployment key on the server only.
    // @ts-expect-error Convex internal admin API
    client.setAdminAuth(deployKey);

    return client;
}

async function setSessionCookie(
    token: string,
    expiresAt: number,
): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(expiresAt),
    });
}

export async function createSession(userId: string): Promise<void> {
    const client = getConvexAdminClient();

    const token = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    await client.mutation(
        getInternalMutation(internal.sessions.create),
        {
            userId: userId as never,
            tokenHash: hashSessionToken(token),
            expiresAt,
        },
    );

    // Call createSession only from a Server Action or Route Handler.
    await setSessionCookie(token, expiresAt);
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
    // This function is read-only because it may run during Server Component rendering.
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token || token.length > 100) {
        return null;
    }

    const client = getConvexAdminClient();

    const session = await client.query(
        getInternalQuery(internal.sessions.getByTokenHash),
        {
            tokenHash: hashSessionToken(token),
        },
    );

    if (
        !session ||
        session.revokedAt !== undefined ||
        session.expiresAt <= Date.now()
    ) {
        // Do not modify cookies or database records during page rendering.
        return null;
    }

    const user = await client.query(
        getInternalQuery(internal.users.getById),
        {
            userId: session.userId,
        },
    );

    if (
        !user ||
        !user.isActive ||
        (user.role === "USER" && user.emailVerified !== true)
    ) {
        // Invalid users are denied access; cleanup belongs in a Server Action
        // or Route Handler, not in this read-only session check.
        return null;
    }

    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
}

export async function destroyCurrentSession(): Promise<void> {
    // Call this function only from a Server Action or Route Handler.
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    try {
        if (token && token.length <= 100) {
            const client = getConvexAdminClient();

            const session = await client.query(
                getInternalQuery(internal.sessions.getByTokenHash),
                {
                    tokenHash: hashSessionToken(token),
                },
            );

            if (session && session.revokedAt === undefined) {
                await client.mutation(
                    getInternalMutation(internal.sessions.revoke),
                    {
                        sessionId: session._id,
                    },
                );
            }
        }
    } finally {
        // Cookie deletion is valid in a Server Action or Route Handler.
        cookieStore.delete(SESSION_COOKIE_NAME);
    }
}
