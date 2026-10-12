
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

export const registerSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(2, "Name must contain at least 2 characters.")
            .max(100, "Name must not exceed 100 characters."),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(1, "Password is required.")
        .max(128, "Invalid email or password."),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, "Reset token is required.").max(512),
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
