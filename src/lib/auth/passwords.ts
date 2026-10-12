
import "server-only";

import argon2 from "argon2";

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_MAX_LENGTH = 128;

export function validatePassword(password: string): void {
    if (
        password.length < PASSWORD_MIN_LENGTH ||
        password.length > PASSWORD_MAX_LENGTH
    ) {
        throw new Error(
            `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
        );
    }
}

export async function hashPassword(password: string): Promise<string> {
    validatePassword(password);

    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19_456,
        timeCost: 2,
        parallelism: 1,
        hashLength: 32,
    });
}

export async function verifyPassword(
    passwordHash: string,
    password: string,
): Promise<boolean> {
    if (!passwordHash || !password) {
        return false;
    }

    try {
        return await argon2.verify(passwordHash, password);
    } catch {
        // A malformed hash must not crash the login flow.
        return false;
    }
}
