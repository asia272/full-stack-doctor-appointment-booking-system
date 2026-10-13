import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function validateIdentity(fullName: string, email: string): void {
    if (fullName.length < 2 || fullName.length > 100) {
        throw new ConvexError("INVALID_FULL_NAME");
    }

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        throw new ConvexError("INVALID_EMAIL");
    }
}

function validatePasswordHash(passwordHash: string): void {
    if (
        !passwordHash ||
        passwordHash.length > 256 ||
        !passwordHash.startsWith("$argon2id$")
    ) {
        throw new ConvexError("INVALID_PASSWORD_HASH");
    }
}

/**
 * Creates a doctor account and its professional profile atomically.
 * The caller must authorize the administrator before invoking it.
 */
export const createDoctor = internalMutation({
    args: {
        fullName: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        specialty: v.string(),
        degree: v.string(),
        about: v.string(),
        consultationFee: v.number(),
        address: v.string(),
        experienceYears: v.optional(v.number()),
    },

    handler: async (ctx, args) => {
        const fullName = args.fullName.trim();
        const email = normalizeEmail(args.email);
        const specialty = args.specialty.trim();
        const degree = args.degree.trim();
        const about = args.about.trim();
        const address = args.address.trim();
        const { consultationFee, experienceYears } = args;

        validateIdentity(fullName, email);
        validatePasswordHash(args.passwordHash);

        if (specialty.length < 2 || specialty.length > 100) {
            throw new ConvexError("INVALID_SPECIALTY");
        }

        if (degree.length < 2 || degree.length > 150) {
            throw new ConvexError("INVALID_DEGREE");
        }

        if (about.length < 10 || about.length > 3000) {
            throw new ConvexError("INVALID_ABOUT");
        }

        if (
            !Number.isFinite(consultationFee) ||
            consultationFee < 0 ||
            consultationFee > 10_000_000
        ) {
            throw new ConvexError("INVALID_CONSULTATION_FEE");
        }

        if (
            experienceYears !== undefined &&
            (!Number.isInteger(experienceYears) ||
                experienceYears < 0 ||
                experienceYears > 80)
        ) {
            throw new ConvexError("INVALID_EXPERIENCE_YEARS");
        }

        if (address.length < 2 || address.length > 300) {
            throw new ConvexError("INVALID_ADDRESS");
        }

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (existingUser) {
            throw new ConvexError("EMAIL_ALREADY_EXISTS");
        }

        const now = Date.now();

        const userId = await ctx.db.insert("users", {
            fullName,
            email,
            passwordHash: args.passwordHash,
            role: "DOCTOR",
            emailVerified: true,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        const doctorId = await ctx.db.insert("doctors", {
            userId,
            specialty,
            degree,
            about,
            consultationFee,
            address,
            ...(experienceYears !== undefined ? { experienceYears } : {}),
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        return { userId, doctorId };
    },
});

/**
 * Returns the sole administrator.
 * This implementation deliberately supports one administrator account.
 */
export const getAdminForLogin = internalQuery({
    args: {},
    handler: async (ctx) => {
        const admins = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "ADMIN"))
            .collect();

        if (admins.length !== 1) {
            return null;
        }

        return admins[0];
    },
});

/**
 * Creates an OTP for an existing, active, verified administrator.
 * OTPs are hashed by the server before reaching this mutation.
 */
export const createAdminLoginOtp = internalMutation({
    args: {
        userId: v.id("users"),
        codeHash: v.string(),
    },

    handler: async (ctx, args) => {
        if (!/^[a-f0-9]{64}$/i.test(args.codeHash)) {
            throw new ConvexError("INVALID_CODE_HASH");
        }

        const user = await ctx.db.get(args.userId);

        if (
            !user ||
            user.role !== "ADMIN" ||
            !user.isActive ||
            user.emailVerified !== true
        ) {
            throw new ConvexError("INVALID_ADMIN");
        }

        const now = Date.now();

        const codes = await ctx.db
            .query("emailVerificationCodes")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const latest = codes.reduce<
            (typeof codes)[number] | null
        >((current, item) => {
            return !current || item.createdAt > current.createdAt
                ? item
                : current;
        }, null);

        if (latest && now - latest.createdAt < 60_000) {
            throw new ConvexError("OTP_COOLDOWN");
        }

        // Expire any outstanding codes before creating a new one.
        for (const item of codes) {
            if (item.consumedAt === undefined) {
                await ctx.db.patch(item._id, { consumedAt: now });
            }
        }

        await ctx.db.insert("emailVerificationCodes", {
            userId: args.userId,
            codeHash: args.codeHash,
            expiresAt: now + 10 * 60_000,
            attempts: 0,
            createdAt: now,
        });

        return { success: true as const };
    },
});

/**
 * Verifies and consumes an administrator login OTP.
 * On success, synchronizes the database email with the configured email.
 */
export const verifyAdminLoginOtp = internalMutation({
    args: {
        userId: v.id("users"),
        email: v.string(),
        codeHash: v.string(),
    },

    handler: async (ctx, args) => {
        const email = normalizeEmail(args.email);
        const now = Date.now();

        if (
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !/^[a-f0-9]{64}$/i.test(args.codeHash)
        ) {
            return { verified: false as const, reason: "INVALID_CODE" as const };
        }

        const user = await ctx.db.get(args.userId);

        if (
            !user ||
            user.role !== "ADMIN" ||
            !user.isActive ||
            user.emailVerified !== true
        ) {
            return { verified: false as const, reason: "INVALID_CODE" as const };
        }

        const codes = await ctx.db
            .query("emailVerificationCodes")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const otp = codes.reduce<
            (typeof codes)[number] | null
        >((latest, item) => {
            return !latest || item.createdAt > latest.createdAt
                ? item
                : latest;
        }, null);

        if (!otp || otp.consumedAt !== undefined) {
            return { verified: false as const, reason: "INVALID_CODE" as const };
        }

        if (otp.expiresAt <= now) {
            await ctx.db.patch(otp._id, { consumedAt: now });
            return { verified: false as const, reason: "EXPIRED" as const };
        }

        if (otp.attempts >= 5) {
            return {
                verified: false as const,
                reason: "TOO_MANY_ATTEMPTS" as const,
            };
        }

        if (otp.codeHash !== args.codeHash) {
            const attempts = otp.attempts + 1;

            await ctx.db.patch(otp._id, {
                attempts,
                ...(attempts >= 5 ? { consumedAt: now } : {}),
            });

            return {
                verified: false as const,
                reason: attempts >= 5
                    ? "TOO_MANY_ATTEMPTS" as const
                    : "INVALID_CODE" as const,
            };
        }

        // Do not overwrite another user's email.
        const emailOwner = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (emailOwner && emailOwner._id !== user._id) {
            await ctx.db.patch(otp._id, { consumedAt: now });

            return {
                verified: false as const,
                reason: "EMAIL_IN_USE" as const,
            };
        }

        await ctx.db.patch(otp._id, { consumedAt: now });

        if (normalizeEmail(user.email) !== email) {
            await ctx.db.patch(user._id, {
                email,
                updatedAt: now,
            });
        }

        return {
            verified: true as const,
            reason: "VERIFIED" as const,
        };
    },
});
