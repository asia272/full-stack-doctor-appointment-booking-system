import { ConvexError, v } from "convex/values";
import {
    internalMutation,
    internalQuery,
    type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function getDoctorByUserId(ctx: QueryCtx, userId: Id<"users">) {
    const doctor = await ctx.db
        .query("doctors")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

    if (!doctor) throw new ConvexError("DOCTOR_NOT_FOUND");
    return doctor;
}

/** The signed-in doctor's own profile, with a resolved image URL. */
export const getDoctorProfile = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const doctor = await getDoctorByUserId(ctx, args.userId);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new ConvexError("DOCTOR_NOT_FOUND");

        const imageUrl = user.imageStorageId
            ? await ctx.storage.getUrl(user.imageStorageId)
            : null;

        return {
            fullName: user.fullName,
            email: user.email,
            imageUrl,
            specialty: doctor.specialty,
            degree: doctor.degree,
            experienceYears: doctor.experienceYears ?? null,
            about: doctor.about,
            consultationFee: doctor.consultationFee,
            address: doctor.address,
            isActive: doctor.isActive,
        };
    },
});

/**
 * Upload URL for a doctor's new photo.
 * The caller (server action) must verify the user is a doctor first.
 */
export const generateDoctorPhotoUploadUrl = internalMutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * Updates only the fields a doctor may change themselves.
 * Name, specialty and degree stay admin-controlled.
 */
export const updateDoctorProfile = internalMutation({
    args: {
        userId: v.id("users"),
        about: v.string(),
        address: v.string(),
        consultationFee: v.number(),
        experienceYears: v.optional(v.number()),
        isActive: v.boolean(),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const doctor = await getDoctorByUserId(ctx, args.userId);

        const user = await ctx.db.get(args.userId);
        if (!user) throw new ConvexError("DOCTOR_NOT_FOUND");

        const about = args.about.trim();
        const address = args.address.trim();
        const { consultationFee, experienceYears, imageStorageId } = args;

        if (about.length < 10 || about.length > 3000) {
            throw new ConvexError("INVALID_ABOUT");
        }

        if (address.length < 2 || address.length > 300) {
            throw new ConvexError("INVALID_ADDRESS");
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

        if (imageStorageId) {
            const file = await ctx.db.system.get(imageStorageId);

            if (
                !file ||
                !ALLOWED_IMAGE_TYPES.includes(file.contentType ?? "") ||
                file.size > MAX_IMAGE_BYTES
            ) {
                throw new ConvexError("INVALID_IMAGE");
            }
        }

        const now = Date.now();

        await ctx.db.patch(doctor._id, {
            about,
            address,
            consultationFee,
            ...(experienceYears !== undefined ? { experienceYears } : {}),
            isActive: args.isActive,
            updatedAt: now,
        });

        if (imageStorageId) {
            const previousImageId = user.imageStorageId;

            await ctx.db.patch(user._id, {
                imageStorageId,
                updatedAt: now,
            });

            // Remove the old photo so storage doesn't fill up with unused files.
            if (previousImageId && previousImageId !== imageStorageId) {
                await ctx.storage.delete(previousImageId);
            }
        }

        return { success: true as const };
    },
});