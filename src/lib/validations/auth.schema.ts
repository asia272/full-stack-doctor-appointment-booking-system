
import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email address is required.")
    .max(254, "Email address is too long.")
    .email("Please enter a valid email address.");

const passwordSchema = z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(128, "Password must not exceed 128 characters.");

export const loginSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(1, "Password is required.")
        .max(128, "Password is too long."),
});

export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must contain at least 2 characters.")
        .max(100, "Full name must not exceed 100 characters."),
    email: emailSchema,
    password: passwordSchema,
});
