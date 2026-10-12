
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Full-stack Doctor Appointment Booking System
 *
 * Roles:
 * - ADMIN: manages doctors, users, and appointments
 * - DOCTOR: manages their profile and assigned appointments
 * - USER: patient account
 *
 * Important:
 * - Store password hashes, never plaintext passwords.
 * - Store hashed session/reset tokens, never raw tokens.
 * - Enforce authorization and business rules in Convex functions.
 * - Convex indexes do not automatically enforce uniqueness.
 */

const userRole = v.union(
    v.literal("ADMIN"),
    v.literal("DOCTOR"),
    v.literal("USER"),
);

const appointmentStatus = v.union(
    v.literal("PENDING"),
    v.literal("CONFIRMED"),
    v.literal("COMPLETED"),
    v.literal("CANCELLED"),
    v.literal("REJECTED"),
);

export default defineSchema({
    // --------------------------------------------------
    // USERS
    // Shared account information for admins, doctors,
    // and patients. Doctors also have a doctors profile.
    // --------------------------------------------------
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        passwordHash: v.string(),

        role: userRole,


        imageStorageId: v.optional(v.id("_storage")),

        // Allows an administrator to disable an account.
        isActive: v.boolean(),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_role_and_active", ["role", "isActive"]),

    // --------------------------------------------------
    // DOCTORS
    // Doctor-specific professional information.
    // Name, email, password, and profile image are stored
    // in users and linked using userId.
    // --------------------------------------------------
    doctors: defineTable({
        userId: v.id("users"),

        specialty: v.string(),
        degree: v.string(),
        about: v.string(),

        consultationFee: v.number(),
        address: v.string(),

        // Optional professional details.
        experienceYears: v.optional(v.number()),

        // Inactive doctors should not accept new bookings.
        isActive: v.boolean(),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_active", ["isActive"])
        .index("by_specialty_and_active", ["specialty", "isActive"]),

    // --------------------------------------------------
    // APPOINTMENTS
    // Simple date-and-time booking model.
    // No separate availability table is required.
    // --------------------------------------------------
    appointments: defineTable({
        patientId: v.id("users"),
        doctorId: v.id("doctors"),

        // Use a consistent format:
        // appointmentDate: "2026-10-20"
        // appointmentTime: "14:30" (24-hour format)
        appointmentDate: v.string(),
        appointmentTime: v.string(),

        // Optional note describing the reason for the visit.
        reason: v.optional(v.string()),

        status: appointmentStatus,

        // Optional note from the doctor or administrator.
        notes: v.optional(v.string()),

        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_patient", ["patientId"])
        .index("by_doctor", ["doctorId"])
        .index("by_date", ["appointmentDate"])
        .index("by_doctor_and_date", ["doctorId", "appointmentDate"])
        .index("by_patient_and_date", ["patientId", "appointmentDate"])
        .index("by_status", ["status"])
        .index("by_doctor_date_and_status", [
            "doctorId",
            "appointmentDate",
            "status",
        ]),

    // --------------------------------------------------
    // SESSIONS
    // For your custom authentication system.
    // Store a cryptographic hash of the session token.
    // The raw token belongs only in the secure cookie.
    // expiresAt and timestamps use Unix milliseconds.
    // --------------------------------------------------
    sessions: defineTable({
        userId: v.id("users"),
        tokenHash: v.string(),

        expiresAt: v.number(),
        createdAt: v.number(),

        lastSeenAt: v.optional(v.number()),
        revokedAt: v.optional(v.number()),
    })
        .index("by_token_hash", ["tokenHash"])
        .index("by_user", ["userId"])
        .index("by_expiration", ["expiresAt"]),

    // --------------------------------------------------
    // PASSWORD RESET TOKENS
    // Supports the forgot-password and reset-password
    // flows without storing raw reset tokens.
    // --------------------------------------------------
    passwordResetTokens: defineTable({
        userId: v.id("users"),
        tokenHash: v.string(),

        expiresAt: v.number(),
        createdAt: v.number(),

        usedAt: v.optional(v.number()),
    })
        .index("by_token_hash", ["tokenHash"])
        .index("by_user", ["userId"])
        .index("by_expiration", ["expiresAt"]),
});
