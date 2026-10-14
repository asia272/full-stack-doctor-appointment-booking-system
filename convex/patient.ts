
import { ConvexError, v } from "convex/values";
import {
    internalMutation,
    internalQuery,
} from "./_generated/server";

export const getByUserId = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (
            !user ||
            user.role !== "USER" ||
            !user.isActive ||
            user.emailVerified !== true
        ) {
            return null;
        }

        return await ctx.db
            .query("patients")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

export const updateProfile = internalMutation({
    args: {
        userId: v.id("users"),
        phoneNumber: v.optional(v.string()),
        address: v.optional(v.string()),
        dateOfBirth: v.optional(v.string()),
        gender: v.optional(
            v.union(
                v.literal("MALE"),
                v.literal("FEMALE"),
                v.literal("OTHER"),
                v.literal("PREFER_NOT_TO_SAY"),
            ),
        ),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (
            !user ||
            user.role !== "USER" ||
            !user.isActive ||
            user.emailVerified !== true
        ) {
            throw new ConvexError("INVALID_VERIFIED_PATIENT");
        }

        const patient = await ctx.db
            .query("patients")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        if (!patient) {
            throw new ConvexError("PATIENT_PROFILE_NOT_FOUND");
        }

        if (
            args.phoneNumber !== undefined &&
            args.phoneNumber.trim().length > 30
        ) {
            throw new ConvexError("INVALID_PHONE_NUMBER");
        }

        if (
            args.address !== undefined &&
            args.address.trim().length > 500
        ) {
            throw new ConvexError("INVALID_ADDRESS");
        }

        if (
            args.dateOfBirth !== undefined &&
            args.dateOfBirth !== "" &&
            !/^\d{4}-\d{2}-\d{2}$/.test(args.dateOfBirth)
        ) {
            throw new ConvexError("INVALID_DATE_OF_BIRTH");
        }

        const updates: {
            updatedAt: number;
            phoneNumber?: string;
            address?: string;
            dateOfBirth?: string;
            gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
            imageStorageId?: typeof args.imageStorageId;
        } = {
            updatedAt: Date.now(),
        };

        if (args.phoneNumber !== undefined) {
            updates.phoneNumber = args.phoneNumber.trim();
        }

        if (args.address !== undefined) {
            updates.address = args.address.trim();
        }

        if (args.dateOfBirth !== undefined) {
            updates.dateOfBirth = args.dateOfBirth;
        }

        if (args.gender !== undefined) {
            updates.gender = args.gender;
        }

        if (args.imageStorageId !== undefined) {
            updates.imageStorageId = args.imageStorageId;
        }

        await ctx.db.patch(patient._id, updates);

        return { success: true };
    },
});
