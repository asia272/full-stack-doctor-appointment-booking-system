
import "server-only";

import {
    createHash,
    createHmac,
    randomBytes,
    timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";

const SESSION_COOKIE_NAME = "doctor_appointment_session";
const ADMIN_SESSION_COOKIE_NAME = "doctor_appointment_admin_session";
const ADMIN_OTP_COOKIE_NAME = "doctor_appointment_admin_otp";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_OTP_DURATION_MS = 10 * 60 * 1000;
const MAX_ADMIN_OTP_ATTEMPTS = 5;

export type AppRole = "ADMIN" | "DOCTOR" | "USER";

export type SessionUser = {
    id: string;
    fullName: string;
    email: string;
    role: AppRole;
};

type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

type AdminOtpChallenge = {
    email: string;
    codeHash: string;
    expiresAt: number;
    attempts: number;
};

type AdminSessionPayload = {
    email: string;
    expiresAt: number;
    nonce: string;
};

function getInternalQuery(ref: unknown): InternalQuery {
    return ref as InternalQuery;
}

function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

function getOtpHashSecret(): string {
    const secret = process.env.OTP_HASH_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("OTP_HASH_SECRET must contain at least 32 characters.");
    }

    return secret;
}

function deriveKey(purpose: string): Buffer {
    return createHmac("sha256", getOtpHashSecret())
        .update(`doctor-appointment-system:${purpose}`)
        .digest();
}

function safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
        leftBuffer.length === rightBuffer.length &&
        timingSafeEqual(leftBuffer, rightBuffer)
    );
}

function signPayload(purpose: string, payload: object): string {
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = createHmac("sha256", deriveKey(purpose))
        .update(encoded)
        .digest("base64url");

    return `${encoded}.${signature}`;
}

function readSignedPayload<T>(
    purpose: string,
    token: string | undefined,
): T | null {
    if (!token || token.length > 4096) {
        return null;
    }

    const separator = token.lastIndexOf(".");

    if (separator <= 0) {
        return null;
    }

    const encoded = token.slice(0, separator);
    const suppliedSignature = token.slice(separator + 1);

    const expectedSignature = createHmac("sha256", deriveKey(purpose))
        .update(encoded)
        .digest("base64url");

    if (!safeEqual(suppliedSignature, expectedSignature)) {
        return null;
    }

    try {
        return JSON.parse(
            Buffer.from(encoded, "base64url").toString("utf8"),
        ) as T;
    } catch {
        return null;
    }
}

function hashAdminOtp(email: string, code: string): string {
    return createHmac("sha256", deriveKey("admin-otp-code"))
        .update(`${email}:${code}`)
        .digest("hex");
}

function cookieOptions(expiresAt: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        expires: new Date(expiresAt),
    };
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

    // Convex's deployment key must remain server-side.
    // @ts-expect-error Convex internal admin API
    client.setAdminAuth(deployKey);

    return client;
}

/* Existing database-backed patient/doctor sessions */

export async function createSession(userId: string): Promise<void> {
    const client = getConvexAdminClient();
    const token = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + SESSION_DURATION_MS;

    await client.mutation(
        getInternalMutation(internal.sessions.create),
        {
            userId: userId as never,
            tokenHash: createHash("sha256").update(token).digest("hex"),
            expiresAt,
        },
    );

    const cookieStore = await cookies();
    cookieStore.set(
        SESSION_COOKIE_NAME,
        token,
        cookieOptions(expiresAt),
    );
}

/* Environment-based Admin OTP challenge; no database record required */

export async function createAdminOtpChallenge(
    rawEmail: string,
    code: string,
): Promise<void> {
    const email = rawEmail.trim().toLowerCase();
    const expiresAt = Date.now() + ADMIN_OTP_DURATION_MS;

    const challenge: AdminOtpChallenge = {
        email,
        codeHash: hashAdminOtp(email, code),
        expiresAt,
        attempts: 0,
    };

    const cookieStore = await cookies();
    cookieStore.set(
        ADMIN_OTP_COOKIE_NAME,
        signPayload("admin-otp-challenge", challenge),
        cookieOptions(expiresAt),
    );
}

export async function clearAdminOtpChallenge(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
}

export async function verifyAdminOtpChallenge(
    rawEmail: string,
    code: string,
): Promise<{ verified: boolean; reason?: "INVALID" | "EXPIRED" | "TOO_MANY_ATTEMPTS" }> {
    const email = rawEmail.trim().toLowerCase();
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_OTP_COOKIE_NAME)?.value;

    const challenge = readSignedPayload<AdminOtpChallenge>(
        "admin-otp-challenge",
        token,
    );

    if (
        !challenge ||
        typeof challenge.email !== "string" ||
        typeof challenge.codeHash !== "string" ||
        typeof challenge.expiresAt !== "number" ||
        typeof challenge.attempts !== "number"
    ) {
        cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
        return { verified: false, reason: "INVALID" };
    }

    if (challenge.expiresAt <= Date.now()) {
        cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
        return { verified: false, reason: "EXPIRED" };
    }

    if (challenge.attempts >= MAX_ADMIN_OTP_ATTEMPTS) {
        cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
        return { verified: false, reason: "TOO_MANY_ATTEMPTS" };
    }

    if (challenge.email !== email || !/^\d{6}$/.test(code)) {
        challenge.attempts += 1;

        if (challenge.attempts >= MAX_ADMIN_OTP_ATTEMPTS) {
            cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
            return { verified: false, reason: "TOO_MANY_ATTEMPTS" };
        }

        cookieStore.set(
            ADMIN_OTP_COOKIE_NAME,
            signPayload("admin-otp-challenge", challenge),
            cookieOptions(challenge.expiresAt),
        );

        return { verified: false, reason: "INVALID" };
    }

    const submittedHash = hashAdminOtp(email, code);

    if (!safeEqual(submittedHash, challenge.codeHash)) {
        challenge.attempts += 1;

        if (challenge.attempts >= MAX_ADMIN_OTP_ATTEMPTS) {
            cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
            return { verified: false, reason: "TOO_MANY_ATTEMPTS" };
        }

        cookieStore.set(
            ADMIN_OTP_COOKIE_NAME,
            signPayload("admin-otp-challenge", challenge),
            cookieOptions(challenge.expiresAt),
        );

        return { verified: false, reason: "INVALID" };
    }

    cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
    return { verified: true };
}

/* Environment-based Admin session; no Convex user/session record */

export async function createAdminSession(rawEmail: string): Promise<void> {
    const email = rawEmail.trim().toLowerCase();
    const configuredEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

    if (!configuredEmail || email !== configuredEmail) {
        throw new Error("The configured Admin email does not match.");
    }

    const expiresAt = Date.now() + SESSION_DURATION_MS;

    const payload: AdminSessionPayload = {
        email,
        expiresAt,
        nonce: randomBytes(16).toString("base64url"),
    };

    const cookieStore = await cookies();

    // Do not leave a regular database session cookie active for Admin.
    cookieStore.delete(SESSION_COOKIE_NAME);

    cookieStore.set(
        ADMIN_SESSION_COOKIE_NAME,
        signPayload("admin-session", payload),
        cookieOptions(expiresAt),
    );
}

async function getAdminSessionUser(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    const payload = readSignedPayload<AdminSessionPayload>(
        "admin-session",
        token,
    );

    const configuredEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

    if (
        !payload ||
        !configuredEmail ||
        payload.email !== configuredEmail ||
        typeof payload.expiresAt !== "number" ||
        payload.expiresAt <= Date.now() ||
        typeof payload.nonce !== "string"
    ) {
        return null;
    }

    return {
        id: "env-admin",
        fullName: "Administrator",
        email: configuredEmail,
        role: "ADMIN",
    };
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
    // Admin authentication does not query the Convex users table.
    const adminUser = await getAdminSessionUser();

    if (adminUser) {
        return adminUser;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token || token.length > 100) {
        return null;
    }

    const client = getConvexAdminClient();

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const session = await client.query(
        getInternalQuery(internal.sessions.getByTokenHash),
        { tokenHash },
    );

    if (
        !session ||
        session.revokedAt !== undefined ||
        session.expiresAt <= Date.now()
    ) {
        return null;
    }

    const user = await client.query(
        getInternalQuery(internal.users.getById),
        { userId: session.userId },
    );

    if (
        !user ||
        !user.isActive ||
        (user.role === "USER" && user.emailVerified !== true)
    ) {
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
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    try {
        if (token && token.length <= 100) {
            const client = getConvexAdminClient();
            const tokenHash = createHash("sha256").update(token).digest("hex");

            const session = await client.query(
                getInternalQuery(internal.sessions.getByTokenHash),
                { tokenHash },
            );

            if (session && session.revokedAt === undefined) {
                await client.mutation(
                    getInternalMutation(internal.sessions.revoke),
                    { sessionId: session._id },
                );
            }
        }
    } finally {
        cookieStore.delete(SESSION_COOKIE_NAME);
        cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
        cookieStore.delete(ADMIN_OTP_COOKIE_NAME);
    }
}
