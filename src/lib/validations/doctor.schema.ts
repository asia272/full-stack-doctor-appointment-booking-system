import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email is too long.")
    .email("Enter a valid email address.")
    .transform((email) => email.toLowerCase());

const passwordSchema = z
    .string()
    .min(12, "Password must contain at least 12 characters.")
    .max(128, "Password must not exceed 128 characters.");

const requiredNumber = z.preprocess(
    (value) =>
        typeof value === "string" && value.trim() !== ""
            ? Number(value)
            : value,
    z.number().finite(),
);

const optionalExperience = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }

        return typeof value === "string" ? Number(value) : value;
    },
    z.number().int().min(0).max(80).optional(),
);

export const doctorCreateSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must contain at least 2 characters.")
        .max(100, "Full name must not exceed 100 characters."),

    email: emailSchema,

    password: passwordSchema,

    specialty: z
        .string()
        .trim()
        .min(2, "Specialty is required.")
        .max(100, "Specialty must not exceed 100 characters."),

    degree: z
        .string()
        .trim()
        .min(2, "Degree is required.")
        .max(150, "Degree must not exceed 150 characters."),

    about: z
        .string()
        .trim()
        .min(10, "About must contain at least 10 characters.")
        .max(3000, "About must not exceed 3000 characters."),

    consultationFee: requiredNumber.pipe(
        z.number()
            .min(0, "Consultation fee cannot be negative.")
            .max(10_000_000, "Consultation fee is too high."),
    ),

    address: z
        .string()
        .trim()
        .min(2, "Address is required.")
        .max(300, "Address must not exceed 300 characters."),

    experienceYears: optionalExperience,

    // NEW: optional Convex storage ID of the uploaded profile photo.
    imageStorageId: z.string().min(1).optional(),
});

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;