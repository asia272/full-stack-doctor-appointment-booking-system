
import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const email = args.email.trim().toLowerCase();

        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();
    },
});

export const getById = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const registerPatient = internalMutation({
    args: {
        fullName: v.string(),
        email: v.string(),
        passwordHash: v.string(),
    },
    handler: async (ctx, args) => {
        const fullName = args.fullName.trim();
        const email = args.email.trim().toLowerCase();

        if (fullName.length < 2 || fullName.length > 100) {
            throw new ConvexError("INVALID_FULL_NAME");
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            email.length > 254
        ) {
            throw new ConvexError("INVALID_EMAIL");
        }

        if (!args.passwordHash) {
            throw new ConvexError("INVALID_PASSWORD_HASH");
        }

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (existingUser) {
            if (
                existingUser.role === "USER" &&
                existingUser.isActive &&
                existingUser.emailVerified !== true
            ) {
                // Resume verification for the existing unverified account.
                // Never replace its password with a new registration attempt.
                return existingUser._id;
            }

            throw new ConvexError("EMAIL_ALREADY_EXISTS");
        }

        const now = Date.now();

        // Create the authentication account only.
        // Do not create a patient profile before email verification.
        return await ctx.db.insert("users", {
            fullName,
            email,
            passwordHash: args.passwordHash,
            role: "USER",
            emailVerified: false,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const createEmailVerificationCode = internalMutation({
    args: {
        userId: v.id("users"),
        codeHash: v.string(),
    },
    handler: async (ctx, args) => {
        if (!/^[a-f0-9]{64}$/i.test(args.codeHash)) {
            throw new ConvexError("INVALID_CODE_HASH");
        }

        const user = await ctx.db.get(args.userId);

        if (!user || user.role !== "USER" || !user.isActive) {
            throw new ConvexError("INVALID_USER");
        }

        if (user.emailVerified === true) {
            throw new ConvexError("ALREADY_VERIFIED");
        }

        const now = Date.now();

        const existingCodes = await ctx.db
            .query("emailVerificationCodes")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const latestCode = existingCodes.reduce<
            (typeof existingCodes)[number] | null
        >((latest, current) => {
            if (!latest || current.createdAt > latest.createdAt) {
                return current;
            }

            return latest;
        }, null);

        if (latestCode && now - latestCode.createdAt < 60_000) {
            throw new ConvexError("OTP_COOLDOWN");
        }

        for (const existingCode of existingCodes) {
            await ctx.db.delete(existingCode._id);
        }

        await ctx.db.insert("emailVerificationCodes", {
            userId: args.userId,
            codeHash: args.codeHash,
            expiresAt: now + 10 * 60 * 1000,
            attempts: 0,
            createdAt: now,
        });

        return { success: true };
    },
});

export const verifyEmailCode = internalMutation({
    args: {
        userId: v.id("users"),
        codeHash: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user || user.role !== "USER" || !user.isActive) {
            return {
                verified: false,
                reason: "INVALID_USER" as const,
            };
        }

        if (user.emailVerified === true) {
            return {
                verified: false,
                reason: "ALREADY_VERIFIED" as const,
            };
        }

        const codes = await ctx.db
            .query("emailVerificationCodes")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        const code = codes.sort(
            (a, b) => b.createdAt - a.createdAt,
        )[0];

        if (!code || code.consumedAt !== undefined) {
            return {
                verified: false,
                reason: "INVALID_CODE" as const,
            };
        }

        const now = Date.now();

        if (code.expiresAt <= now) {
            await ctx.db.patch(code._id, { consumedAt: now });

            return {
                verified: false,
                reason: "EXPIRED" as const,
            };
        }

        if (code.attempts >= 5) {
            return {
                verified: false,
                reason: "TOO_MANY_ATTEMPTS" as const,
            };
        }

        if (code.codeHash !== args.codeHash) {
            const attempts = code.attempts + 1;

            await ctx.db.patch(code._id, {
                attempts,
                ...(attempts >= 5 ? { consumedAt: now } : {}),
            });

            return {
                verified: false,
                reason:
                    attempts >= 5
                        ? ("TOO_MANY_ATTEMPTS" as const)
                        : ("INVALID_CODE" as const),
            };
        }

        // Consume the OTP and verify the user.
        await ctx.db.patch(code._id, { consumedAt: now });

        await ctx.db.patch(user._id, {
            emailVerified: true,
            updatedAt: now,
        });

        // Create a patient profile only after successful verification.
        // Check first so verification retries cannot create duplicates.
        const existingProfile = await ctx.db
            .query("patients")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique();

        if (!existingProfile) {
            await ctx.db.insert("patients", {
                userId: user._id,
                createdAt: now,
                updatedAt: now,
            });
        }

        return {
            verified: true,
            reason: "VERIFIED" as const,
        };
    },
});

export const deleteUnverifiedPatient = internalMutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (
            !user ||
            user.role !== "USER" ||
            user.emailVerified === true
        ) {
            return { deleted: false };
        }

        const codes = await ctx.db
            .query("emailVerificationCodes")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        for (const code of codes) {
            await ctx.db.delete(code._id);
        }

        // Clean up any legacy profile from before this change.
        const profiles = await ctx.db
            .query("patients")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        for (const profile of profiles) {
            await ctx.db.delete(profile._id);
        }

        await ctx.db.delete(user._id);

        return { deleted: true };
    },
});
export const getNavbarProfile = internalQuery({
    args: {
        userId: v.id("users"),
    },

    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user || !user.isActive) {
            return null;
        }

        const imageUrl = user.imageStorageId
            ? await ctx.storage.getUrl(user.imageStorageId)
            : null;

        return {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            imageUrl,
        };
    },
});
