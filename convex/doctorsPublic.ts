import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/**
 * Public, read-only doctor queries for the patient-facing site.
 * Only safe fields are returned (never email or passwordHash).
 */

const RELATED_DOCTORS_LIMIT = 5;

async function toPublicDoctor(ctx: QueryCtx, doctor: Doc<"doctors">) {
    const user = await ctx.db.get(doctor.userId);
    if (!user || !user.isActive) return null;

    const imageUrl = user.imageStorageId
        ? await ctx.storage.getUrl(user.imageStorageId)
        : null;

    return {
        id: doctor._id as string,
        fullName: user.fullName,
        specialty: doctor.specialty,
        degree: doctor.degree,
        experienceYears: doctor.experienceYears ?? null,
        about: doctor.about,
        consultationFee: doctor.consultationFee,
        address: doctor.address,
        imageUrl,
        isAvailable: doctor.isActive,
    };
}

type PublicDoctor = NonNullable<Awaited<ReturnType<typeof toPublicDoctor>>>;

function isPresent(doctor: PublicDoctor | null): doctor is PublicDoctor {
    return doctor !== null;
}

/**
 * Paginated list of bookable doctors for the home page.
 * Use with usePaginatedQuery on the client.
 */
export const listDoctors = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("doctors")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .order("desc")
            .paginate(args.paginationOpts);

        const page = (
            await Promise.all(
                result.page.map((doctor) => toPublicDoctor(ctx, doctor)),
            )
        ).filter(isPresent);

        return { ...result, page };
    },
});

/**
 * Single doctor for the detail page.
 * Accepts a plain string so a malformed URL returns null instead of throwing.
 */
export const getDoctorById = query({
    args: { doctorId: v.string() },
    handler: async (ctx, args) => {
        const id = ctx.db.normalizeId("doctors", args.doctorId);
        if (!id) return null;

        const doctor = await ctx.db.get(id);
        if (!doctor) return null;

        return await toPublicDoctor(ctx, doctor);
    },
});

/**
 * Same-specialty doctors first, topped up with other active doctors
 * so the "Related Doctors" row is never empty.
 */
export const listRelatedDoctors = query({
    args: { doctorId: v.id("doctors") },
    handler: async (ctx, args) => {
        const current = await ctx.db.get(args.doctorId);
        if (!current) return [];

        const picked: Doc<"doctors">[] = (
            await ctx.db
                .query("doctors")
                .withIndex("by_specialty_and_active", (q) =>
                    q.eq("specialty", current.specialty).eq("isActive", true),
                )
                .order("desc")
                .take(RELATED_DOCTORS_LIMIT + 1)
        )
            .filter((doctor) => doctor._id !== current._id)
            .slice(0, RELATED_DOCTORS_LIMIT);

        if (picked.length < RELATED_DOCTORS_LIMIT) {
            const others = await ctx.db
                .query("doctors")
                .withIndex("by_active", (q) => q.eq("isActive", true))
                .order("desc")
                .take(RELATED_DOCTORS_LIMIT * 2);

            for (const doctor of others) {
                if (picked.length >= RELATED_DOCTORS_LIMIT) break;
                if (doctor._id === current._id) continue;
                if (picked.some((item) => item._id === doctor._id)) continue;
                picked.push(doctor);
            }
        }

        return (
            await Promise.all(
                picked.map((doctor) => toPublicDoctor(ctx, doctor)),
            )
        ).filter(isPresent);
    },
});
