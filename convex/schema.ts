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
    // --------------------------------------------------
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        passwordHash: v.string(),

        role: userRole,
        emailVerified: v.optional(v.boolean()),

        // Shared by patient and doctor accounts.
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
    // CHANGED: added optional working-hours fields used to
    // generate booking slots. When omitted, defaults in
    // convex/lib/booking.ts apply (08:00 - 17:00, 30 min).
    // --------------------------------------------------
    doctors: defineTable({
        userId: v.id("users"),

        specialty: v.string(),
        degree: v.string(),
        experienceYears: v.optional(v.number()),
        about: v.string(),
        consultationFee: v.number(),
        address: v.string(),

        // Working hours, "HH:mm" 24-hour clinic time.
        workDayStart: v.optional(v.string()),
        workDayEnd: v.optional(v.string()),
        // Length of one appointment slot in minutes.
        slotMinutes: v.optional(v.number()),

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
    // CHANGED:
    // - consultationFee: price snapshot at booking time, so
    //   later fee changes never rewrite history.
    // - new indexes for fast slot-conflict checks.
    // --------------------------------------------------
    appointments: defineTable({
        patientId: v.id("users"),
        doctorId: v.id("doctors"),

        // appointmentDate: "2026-10-20"
        // appointmentTime: "14:30" (24-hour format, clinic time)
        appointmentDate: v.string(),
        appointmentTime: v.string(),

        // Fee charged for this visit (snapshot).
        consultationFee: v.number(),

        // Optional note describing the reason for the visit.
        reason: v.optional(v.string()),

        status: appointmentStatus,

        // Optional note from the doctor or administrator.
        notes: v.optional(v.string()),

        // Payment. Missing values mean "CASH / UNPAID" (old appointments).
        paymentMethod: v.optional(
            v.union(v.literal("CASH"), v.literal("ONLINE")),
        ),
        paymentStatus: v.optional(
            v.union(v.literal("UNPAID"), v.literal("PAID")),
        ),
        stripeCheckoutSessionId: v.optional(v.string()),
        stripePaymentIntentId: v.optional(v.string()),
        paidAt: v.optional(v.number()),

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
        ])
        .index("by_doctor_date_and_time", [
            "doctorId",
            "appointmentDate",
            "appointmentTime",
        ])
        .index("by_patient_date_and_time", [
            "patientId",
            "appointmentDate",
            "appointmentTime",
        ]),

    // --------------------------------------------------
    // SESSIONS
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

    emailVerificationCodes: defineTable({
        userId: v.id("users"),
        codeHash: v.string(),
        expiresAt: v.number(),
        attempts: v.number(),
        createdAt: v.number(),
        consumedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_expiration", ["expiresAt"]),

    patients: defineTable({
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
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),
});
