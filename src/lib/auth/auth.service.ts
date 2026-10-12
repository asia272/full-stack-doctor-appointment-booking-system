
import "server-only";

import type { FunctionReference } from "convex/server";

import { internal } from "../../../convex/_generated/api";

import {
    hashPassword,
    validatePassword,
    verifyPassword,
} from "./passwords";

import {
    createSession,
    destroyCurrentSession,
    getConvexAdminClient,
    type SessionUser,
} from "./session";

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

function toSessionUser(user: {
    _id: string;
    fullName: string;
    email: string;
    role: "ADMIN" | "DOCTOR" | "USER";
}): SessionUser {
    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
    };
}

function errorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}

export async function registerPatient(
    input: RegisterPatientInput,
): Promise<SessionUser> {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);


    if (fullName.length < 2 || fullName.length > 100) {
        throw new Error("Please enter a valid full name.");
    }

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
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
        // Handles concurrent registrations for the same email.
        if (errorMessage(error).includes("EMAIL_ALREADY_EXISTS")) {
            throw new Error("An account with this email already exists.");
        }

        throw new Error(
            "Unable to create your account. Please try again.",
        );
    }

    await createSession(userId);

    return {
        id: userId,
        fullName,
        email,
        role: "USER",
    };
}

export async function loginWithPassword(
    input: LoginInput,
): Promise<SessionUser> {
    const email = normalizeEmail(input.email);

    if (
        !email ||
        email.length > 254 ||
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

    const passwordMatches = await verifyPassword(
        user?.passwordHash ?? "",
        input.password,
    );

    // Use the same message for a missing account and a wrong password.
    if (!user || !passwordMatches || !user.isActive) {
        throw new Error("Invalid email or password.");
    }

    await createSession(user._id);

    return toSessionUser(user);
}

export async function logout(): Promise<void> {
    await destroyCurrentSession();
}
