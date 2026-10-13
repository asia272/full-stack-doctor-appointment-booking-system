import "server-only";

import { createHmac, randomInt } from "node:crypto";
import type { FunctionReference } from "convex/server";
import { internal } from "../../../convex/_generated/api";
import { sendVerificationEmail } from "../email/brevo";

import {
    hashPassword,
    validatePassword,
    verifyPassword,
} from "./passwords";

import {
    createSession,
    destroyCurrentSession,
    getConvexAdminClient,
    type AppRole,
    type SessionUser,
} from "./session";

type AdminLoginStartInput = {
    email: string;
    password: string;
};
type RegisterPatientInput = {
    fullName: string;
    email: string;
    password: string;
};
type LoginInput = {
    email: string;
    password: string;
};
type InternalQuery = FunctionReference<"query">;
type InternalMutation = FunctionReference<"mutation">;

function getInternalQuery(ref: unknown): InternalQuery {
    return ref as InternalQuery;
}

function getInternalMutation(ref: unknown): InternalMutation {
    return ref as InternalMutation;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function isInvalidEmail(email: string): boolean {
    return (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function toSessionUser(user: {
    _id: string;
    fullName: string;
    email: string;
    role: AppRole;
}): SessionUser {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
}

function getOtpHashSecret(): string {
    const secret = process.env.OTP_HASH_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error("OTP_HASH_SECRET is not configured securely.");
    }

    return secret;
}

function hashVerificationCode(userId: string, code: string): string {
    return createHmac("sha256", getOtpHashSecret())
        .update(`${userId}:${code}`)
        .digest("hex");
}

function createOtp(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

async function issueVerificationCode(
    userId: string,
    email: string,
    fullName: string,
): Promise<void> {
    const client = getConvexAdminClient();
    const code = createOtp();
    const codeHash = hashVerificationCode(userId, code);

    await client.mutation(
        getInternalMutation(internal.users.createEmailVerificationCode),
        {
            userId: userId as never,
            codeHash,
        },
    );

    try {
        await sendVerificationEmail(email, fullName, code);
    } catch (error) {
        console.error("[auth] Verification email delivery failed:", error);

        throw new Error(
            "We couldn't send the verification email. Please try again later.",
        );
    }
}

export async function registerPatient(
    input: RegisterPatientInput,
): Promise<{ email: string }> {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);

    if (fullName.length < 2 || fullName.length > 100) {
        throw new Error("Please enter a valid full name.");
    }

    if (isInvalidEmail(email)) {
        throw new Error("Please enter a valid email address.");
    }

    validatePassword(input.password);

    const client = getConvexAdminClient();

    const existingUser = await client.query(
        getInternalQuery(internal.users.getByEmail),
        { email },
    );

    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    let userId: string;

    try {
        userId = await client.mutation(
            getInternalMutation(internal.users.registerPatient),
            {
                fullName,
                email,
                passwordHash,
            },
        );
    } catch (error) {
        if (getErrorMessage(error).includes("EMAIL_ALREADY_EXISTS")) {
            throw new Error("An account with this email already exists.");
        }

        console.error("[auth] Patient creation failed:", error);
        throw new Error("Unable to create your account. Please try again.");
    }

    try {
        await issueVerificationCode(userId, email, fullName);
    } catch (error) {
        try {
            await client.mutation(
                getInternalMutation(internal.users.deleteUnverifiedPatient),
                { userId: userId as never },
            );
        } catch (cleanupError) {
            console.error("[auth] Registration cleanup failed:", cleanupError);
        }

        throw error;
    }

    return { email };
}

export async function resendVerificationCode(
    rawEmail: string,
): Promise<void> {
    const email = normalizeEmail(rawEmail);

    if (isInvalidEmail(email)) {
        throw new Error("Enter a valid email address.");
    }

    const client = getConvexAdminClient();

    const user = await client.query(
        getInternalQuery(internal.users.getByEmail),
        { email },
    );

    // Do not reveal whether an account exists or is already verified.
    if (
        !user ||
        user.role !== "USER" ||
        !user.isActive ||
        user.emailVerified === true
    ) {
        return;
    }

    await issueVerificationCode(user._id, user.email, user.fullName);
}

export async function verifyPatientEmail(
    rawEmail: string,
    code: string,
): Promise<SessionUser> {
    const email = normalizeEmail(rawEmail);

    if (isInvalidEmail(email) || !/^\d{6}$/.test(code)) {
        throw new Error("Invalid or expired verification code.");
    }

    const client = getConvexAdminClient();

    const user = await client.query(
        getInternalQuery(internal.users.getByEmail),
        { email },
    );

    if (!user || user.role !== "USER" || !user.isActive) {
        throw new Error("Invalid or expired verification code.");
    }

    // Never create a session by submitting a code for an already verified user.
    if (user.emailVerified === true) {
        throw new Error("Your email is already verified. Please sign in.");
    }

    const result = await client.mutation(
        getInternalMutation(internal.users.verifyEmailCode),
        {
            userId: user._id,
            codeHash: hashVerificationCode(user._id, code),
        },
    );

    if (!result.verified) {
        if (result.reason === "TOO_MANY_ATTEMPTS") {
            throw new Error(
                "Too many incorrect attempts. Request a new verification code.",
            );
        }

        if (result.reason === "EXPIRED") {
            throw new Error("Your code has expired. Request a new code.");
        }

        if (result.reason === "ALREADY_VERIFIED") {
            throw new Error("Your email is already verified. Please sign in.");
        }

        throw new Error("Invalid or expired verification code.");
    }

    await createSession(user._id);

    return toSessionUser(user);
}

export async function loginWithPassword(
    input: LoginInput,
    allowedRoles: readonly AppRole[] = ["ADMIN", "DOCTOR", "USER"],
): Promise<SessionUser> {
    const email = normalizeEmail(input.email);

    if (
        isInvalidEmail(email) ||
        !input.password ||
        input.password.length > 128
    ) {
        throw new Error("Invalid email or password.");
    }

    const client = getConvexAdminClient();

    const user = await client.query(
        getInternalQuery(internal.users.getByEmail),
        { email },
    );

    // Verify a dummy hash when the user does not exist, helping reduce
    // timing differences between existing and non-existing email addresses.
    const passwordMatches = await verifyPassword(
        user?.passwordHash ?? "",
        input.password,
    );

    if (
        !user ||
        !passwordMatches ||
        !user.isActive ||
        !allowedRoles.includes(user.role) ||
        (user.role === "USER" && user.emailVerified !== true)
    ) {
        throw new Error("Invalid email or password.");
    }

    await createSession(user._id);

    return toSessionUser(user);
}



export async function beginAdminLogin(
    input: AdminLoginStartInput,
): Promise<{ userId: string }> {
    const email = normalizeEmail(input.email);
    const configuredEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? "");

    if (
        !configuredEmail ||
        isInvalidEmail(configuredEmail) ||
        email !== configuredEmail ||
        !input.password ||
        input.password.length > 128
    ) {
        throw new Error("Invalid email or password.");
    }

    const client = getConvexAdminClient();

    const admin = await client.query(
        getInternalQuery(internal.staff.getAdminForLogin),
        {},
    );

    const passwordMatches = await verifyPassword(
        admin?.passwordHash ?? "",
        input.password,
    );

    if (
        !admin ||
        !passwordMatches ||
        !admin.isActive ||
        admin.role !== "ADMIN" ||
        admin.emailVerified !== true
    ) {
        throw new Error("Invalid email or password.");
    }

    const code = createOtp();
    const codeHash = hashVerificationCode(admin._id, code);

    await client.mutation(
        getInternalMutation(internal.staff.createAdminLoginOtp),
        {
            userId: admin._id,
            codeHash,
        },
    );

    try {
        await sendVerificationEmail(
            configuredEmail,
            admin.fullName,
            code,
        );
    } catch (error) {
        console.error("[auth] Admin OTP delivery failed:", error);

        throw new Error(
            "Unable to send the Admin verification code. Please try again later.",
        );
    }

    return { userId: admin._id };
}

export async function verifyAdminLogin(
    userId: string,
    rawEmail: string,
    code: string,
): Promise<SessionUser> {
    const email = normalizeEmail(rawEmail);
    const configuredEmail = normalizeEmail(process.env.ADMIN_EMAIL ?? "");

    if (
        !configuredEmail ||
        isInvalidEmail(configuredEmail) ||
        email !== configuredEmail ||
        !/^\d{6}$/.test(code)
    ) {
        throw new Error("Invalid or expired verification code.");
    }

    const client = getConvexAdminClient();

    const result = await client.mutation(
        getInternalMutation(internal.staff.verifyAdminLoginOtp),
        {
            userId: userId as never,
            email: configuredEmail,
            codeHash: hashVerificationCode(userId, code),
        },
    );

    if (!result.verified) {
        if (result.reason === "TOO_MANY_ATTEMPTS") {
            throw new Error(
                "Too many incorrect attempts. Please request a new code.",
            );
        }

        if (result.reason === "EXPIRED") {
            throw new Error("Your code has expired. Please request a new code.");
        }

        if (result.reason === "EMAIL_IN_USE") {
            throw new Error(
                "The configured Admin email belongs to another account. Please check ADMIN_EMAIL.",
            );
        }

        throw new Error("Invalid or expired verification code.");
    }

    const user = await client.query(
        getInternalQuery(internal.users.getById),
        { userId: userId as never },
    );

    if (
        !user ||
        user.role !== "ADMIN" ||
        !user.isActive ||
        user.emailVerified !== true
    ) {
        throw new Error("Unable to verify the administrator account.");
    }

    // The Admin session is created only after successful OTP verification.
    await createSession(user._id);

    return toSessionUser(user);
}

export async function logout(): Promise<void> {
    await destroyCurrentSession();
}