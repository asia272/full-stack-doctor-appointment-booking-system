
import { ConvexError, v } from "convex/values";
import {
    internalMutation,
    internalQuery,
} from "./_generated/server";

export const getByEmail = internalQuery({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const email = args.email.trim().toLowerCase();

        return ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();
    },
});

export const getById = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return ctx.db.get(args.userId);
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
        const passwordHash = args.passwordHash;

        if (fullName.length < 2 || fullName.length > 100) {
            throw new ConvexError("INVALID_FULL_NAME");
        }

        if (
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            throw new ConvexError("INVALID_EMAIL");
        }

        if (!passwordHash || passwordHash.length > 512) {
            throw new ConvexError("INVALID_PASSWORD_HASH");
        }

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (existingUser) {
            throw new ConvexError("EMAIL_ALREADY_EXISTS");
        }

        const now = Date.now();

        return ctx.db.insert("users", {
            fullName,
            email,
            passwordHash,
            role: "USER",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    },
});
