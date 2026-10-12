
import { v } from "convex/values";

import {
    internalMutation,
    internalQuery,
} from "./_generated/server";

/**
 * Creates a session using a hashed token.
 * This function is internal and cannot be called directly by clients.
 */
export const create = internalMutation({
    args: {
        userId: v.id("users"),
        tokenHash: v.string(),
        expiresAt: v.number(),
    },

    handler: async (ctx, args) => {
        const now = Date.now();

        if (!args.tokenHash || args.tokenHash.length !== 64) {
            throw new Error("Invalid session token hash.");
        }

        if (args.expiresAt <= now) {
            throw new Error("Session expiration must be in the future.");
        }

        const user = await ctx.db.get(args.userId);

        if (!user || !user.isActive) {
            throw new Error("Cannot create a session for an inactive user.");
        }

        // Avoid creating duplicate active sessions for the same token.
        const existing = await ctx.db
            .query("sessions")
            .withIndex("by_token_hash", (q) =>
                q.eq("tokenHash", args.tokenHash),
            )
            .unique();

        if (existing) {
            throw new Error("A session with this token already exists.");
        }

        return await ctx.db.insert("sessions", {
            userId: args.userId,
            tokenHash: args.tokenHash,
            expiresAt: args.expiresAt,
            createdAt: now,
        });
    },
});

/**
 * Finds a session by the SHA-256 hash of its cookie token.
 */
export const getByTokenHash = internalQuery({
    args: {
        tokenHash: v.string(),
    },

    handler: async (ctx, args) => {
        return await ctx.db
            .query("sessions")
            .withIndex("by_token_hash", (q) =>
                q.eq("tokenHash", args.tokenHash),
            )
            .unique();
    },
});

/**
 * Revokes a session. Repeated revocation does not change its timestamp.
 */
export const revoke = internalMutation({
    args: {
        sessionId: v.id("sessions"),
    },

    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);

        if (!session || session.revokedAt !== undefined) {
            return null;
        }

        await ctx.db.patch(args.sessionId, {
            revokedAt: Date.now(),
        });

        return null;
    },
});

/**
 * Revokes every session belonging to a user.
 * Useful for logout-all-devices and account-security workflows.
 */
export const revokeAllForUser = internalMutation({
    args: {
        userId: v.id("users"),
    },

    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_user", (q) =>
                q.eq("userId", args.userId),
            )
            .collect();

        const now = Date.now();
        let revokedCount = 0;

        for (const session of sessions) {
            if (session.revokedAt === undefined) {
                await ctx.db.patch(session._id, {
                    revokedAt: now,
                });

                revokedCount++;
            }
        }

        return { revokedCount };
    },
});
