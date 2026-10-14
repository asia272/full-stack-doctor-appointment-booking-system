
import { ConvexError, v } from "convex/values";
import {
    internalMutation,
    internalQuery,
} from "./_generated/server";

const genderValidator = v.union(
    v.literal("MALE"),
    v.literal("FEMALE"),
    v.literal("OTHER"),
    v.literal("PREFER_NOT_TO_SAY"),
);

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

/**
 * Loads the signed-in patient's account and profile data.
 * The caller must authenticate the patient before calling this query.
 */
export const getProfile = internalQuery({
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
            throw new ConvexError("INVALID_VERIFIED_PATIENT");
        }

        const patient = await ctx.db
            .query("patients")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        const imageUrl = user.imageStorageId
            ? await ctx.storage.getUrl(user.imageStorageId)
            : null;

        return {
            fullName: user.fullName,
            email: user.email,
            phoneNumber: patient?.phoneNumber ?? "",
            address: patient?.address ?? "",
            dateOfBirth: patient?.dateOfBirth ?? "",
            gender: patient?.gender ?? "",
            imageUrl,
        };
    },
});

/**
 * Generates a temporary URL for uploading a photo to Convex Storage.
 * Keep this function internal; call it from your trusted server action.
 */
export const generateProfileUploadUrl = internalMutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const updateProfile = internalMutation({
    args: {
        userId: v.id("users"),
        fullName: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        address: v.optional(v.string()),
        dateOfBirth: v.optional(v.string()),
        gender: v.optional(genderValidator),
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

        const fullName =
            args.fullName === undefined ? undefined : args.fullName.trim();

        if (
            fullName !== undefined &&
            (fullName.length < 2 || fullName.length > 100)
        ) {
            throw new ConvexError("INVALID_FULL_NAME");
        }

        const phoneNumber =
            args.phoneNumber === undefined
                ? undefined
                : args.phoneNumber.trim();

        if (
            phoneNumber !== undefined &&
            phoneNumber.length > 30
        ) {
            throw new ConvexError("INVALID_PHONE_NUMBER");
        }

        const address =
            args.address === undefined ? undefined : args.address.trim();

        if (address !== undefined && address.length > 500) {
            throw new ConvexError("INVALID_ADDRESS");
        }

        if (args.dateOfBirth !== undefined && args.dateOfBirth !== "") {
            const date = args.dateOfBirth;
            const parsedDate = new Date(`${date}T00:00:00.000Z`);

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                Number.isNaN(parsedDate.getTime()) ||
                parsedDate.toISOString().slice(0, 10) !== date ||
                parsedDate.getTime() > Date.now()
            ) {
                throw new ConvexError("INVALID_DATE_OF_BIRTH");
            }
        }

        const now = Date.now();

        const patient = await ctx.db
            .query("patients")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

        const patientUpdates = {
            ...(phoneNumber !== undefined
                ? { phoneNumber }
                : {}),
            ...(address !== undefined ? { address } : {}),
            ...(args.dateOfBirth !== undefined
                ? { dateOfBirth: args.dateOfBirth }
                : {}),
            ...(args.gender !== undefined ? { gender: args.gender } : {}),
            updatedAt: now,
        };

        if (patient) {
            await ctx.db.patch(patient._id, patientUpdates);
        } else {
            // Supports verified accounts created before the profile row existed.
            await ctx.db.insert("patients", {
                userId: args.userId,
                ...(phoneNumber ? { phoneNumber } : {}),
                ...(address ? { address } : {}),
                ...(args.dateOfBirth ? { dateOfBirth: args.dateOfBirth } : {}),
                ...(args.gender ? { gender: args.gender } : {}),
                createdAt: now,
                updatedAt: now,
            });
        }

        await ctx.db.patch(args.userId, {
            ...(fullName !== undefined ? { fullName } : {}),
            ...(args.imageStorageId !== undefined
                ? { imageStorageId: args.imageStorageId }
                : {}),
            updatedAt: now,
        });

        // Delete the old photo only after the account points to the new one.
        if (
            args.imageStorageId !== undefined &&
            user.imageStorageId !== undefined &&
            args.imageStorageId !== user.imageStorageId
        ) {
            await ctx.storage.delete(user.imageStorageId);
        }

        return { success: true };
    },
});
