import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed 18 doctors (9 male, 9 female).
 *
 * Put this file at: convex/seed.ts
 *
 * Run:   npx convex run seed:seedDoctors
 * Remove seeded doctors:   npx convex run seed:removeSeededDoctors
 *
 * Safe to run more than once: doctors whose email already exists are skipped.
 *
 * NOTE: All seeded accounts use the SAME placeholder passwordHash, so they
 * cannot log in until you give them a real hash. To seed a real hash, run:
 *   npx convex run seed:seedDoctors '{"passwordHash":"<your-real-hash>"}'
 * (generate it with the same hashing function your signup uses).
 */

const SEED_EMAIL_DOMAIN = "@seed.doctor.app";

type SeedDoctor = {
    fullName: string;
    gender: "MALE" | "FEMALE";
    specialty: string;
    degree: string;
    experienceYears: number;
    about: string;
    consultationFee: number;
    address: string;
};

const DOCTORS: SeedDoctor[] = [
    // ---------------- MALE ----------------
    {
        fullName: "Dr. Ahmed Raza",
        gender: "MALE",
        specialty: "Cardiology",
        degree: "MBBS, FCPS (Cardiology)",
        experienceYears: 14,
        about:
            "Consultant cardiologist focused on preventive heart care, hypertension management and cardiac rehabilitation.",
        consultationFee: 3000,
        address: "Heart Care Clinic, Mall Road, Lahore",
    },
    {
        fullName: "Dr. Usman Tariq",
        gender: "MALE",
        specialty: "Neurology",
        degree: "MBBS, FCPS (Neurology)",
        experienceYears: 11,
        about:
            "Treats migraine, epilepsy, stroke recovery and other neurological disorders with an evidence-based approach.",
        consultationFee: 3500,
        address: "NeuroCare Centre, Gulberg III, Lahore",
    },
    {
        fullName: "Dr. Bilal Hussain",
        gender: "MALE",
        specialty: "Orthopedics",
        degree: "MBBS, MS (Orthopedic Surgery)",
        experienceYears: 16,
        about:
            "Specialist in joint replacement, sports injuries and fracture management.",
        consultationFee: 2800,
        address: "Bone & Joint Hospital, Blue Area, Islamabad",
    },
    {
        fullName: "Dr. Hamza Siddiqui",
        gender: "MALE",
        specialty: "Dermatology",
        degree: "MBBS, FCPS (Dermatology)",
        experienceYears: 8,
        about:
            "Manages acne, eczema, hair loss and common skin infections, with a focus on long-term skin health.",
        consultationFee: 2000,
        address: "SkinFirst Clinic, Clifton, Karachi",
    },
    {
        fullName: "Dr. Imran Qureshi",
        gender: "MALE",
        specialty: "General Physician",
        degree: "MBBS, MRCGP",
        experienceYears: 20,
        about:
            "Family physician providing primary care, chronic disease management and routine health checkups.",
        consultationFee: 1500,
        address: "Family Health Centre, Satellite Town, Bahawalpur",
    },
    {
        fullName: "Dr. Kamran Abbasi",
        gender: "MALE",
        specialty: "ENT Specialist",
        degree: "MBBS, FCPS (ENT)",
        experienceYears: 12,
        about:
            "Treats ear, nose and throat conditions including sinusitis, hearing problems and tonsil disorders.",
        consultationFee: 2200,
        address: "ENT & Head-Neck Clinic, Saddar, Rawalpindi",
    },
    {
        fullName: "Dr. Faisal Mehmood",
        gender: "MALE",
        specialty: "Psychiatry",
        degree: "MBBS, FCPS (Psychiatry)",
        experienceYears: 10,
        about:
            "Provides care for anxiety, depression, sleep disorders and stress-related conditions in a supportive setting.",
        consultationFee: 3000,
        address: "Mind Wellness Centre, Johar Town, Lahore",
    },
    {
        fullName: "Dr. Salman Javed",
        gender: "MALE",
        specialty: "Urology",
        degree: "MBBS, FCPS (Urology)",
        experienceYears: 13,
        about:
            "Experienced in kidney stones, prostate conditions and minimally invasive urological procedures.",
        consultationFee: 2800,
        address: "Urology & Kidney Centre, University Road, Peshawar",
    },
    {
        fullName: "Dr. Naveed Anwar",
        gender: "MALE",
        specialty: "Gastroenterology",
        degree: "MBBS, FCPS (Gastroenterology)",
        experienceYears: 15,
        about:
            "Specializes in digestive and liver diseases, acid reflux, IBS and endoscopy procedures.",
        consultationFee: 3200,
        address: "Digestive Health Clinic, Model Town, Multan",
    },

    // ---------------- FEMALE ----------------
    {
        fullName: "Dr. Ayesha Khan",
        gender: "FEMALE",
        specialty: "Gynecology",
        degree: "MBBS, FCPS (Gynecology & Obstetrics)",
        experienceYears: 15,
        about:
            "Offers complete women's healthcare including antenatal care, fertility guidance and gynecological surgery.",
        consultationFee: 3000,
        address: "Women's Care Hospital, DHA Phase 5, Lahore",
    },
    {
        fullName: "Dr. Fatima Noor",
        gender: "FEMALE",
        specialty: "Pediatrics",
        degree: "MBBS, FCPS (Pediatrics)",
        experienceYears: 9,
        about:
            "Child specialist caring for newborns, infants and children, including vaccinations and growth monitoring.",
        consultationFee: 2000,
        address: "Little Stars Children's Clinic, F-8, Islamabad",
    },
    {
        fullName: "Dr. Sana Malik",
        gender: "FEMALE",
        specialty: "Dermatology",
        degree: "MBBS, MCPS (Dermatology)",
        experienceYears: 7,
        about:
            "Focuses on medical and cosmetic dermatology, including pigmentation, acne scars and skin allergies.",
        consultationFee: 2500,
        address: "Glow Skin & Laser Clinic, Gulshan-e-Iqbal, Karachi",
    },
    {
        fullName: "Dr. Zainab Ali",
        gender: "FEMALE",
        specialty: "Cardiology",
        degree: "MBBS, FCPS (Cardiology)",
        experienceYears: 12,
        about:
            "Cardiologist with a special interest in women's heart health, echocardiography and lifestyle-based prevention.",
        consultationFee: 3200,
        address: "Cardiac Wellness Centre, Hayatabad, Peshawar",
    },
    {
        fullName: "Dr. Maryam Iqbal",
        gender: "FEMALE",
        specialty: "Psychiatry",
        degree: "MBBS, FCPS (Psychiatry)",
        experienceYears: 8,
        about:
            "Provides counseling and treatment for mood disorders, anxiety and adolescent mental health concerns.",
        consultationFee: 2800,
        address: "Serenity Mental Health Clinic, Bahria Town, Rawalpindi",
    },
    {
        fullName: "Dr. Hina Shah",
        gender: "FEMALE",
        specialty: "General Physician",
        degree: "MBBS, MRCGP",
        experienceYears: 10,
        about:
            "Primary care physician offering diagnosis, preventive care and long-term management of common illnesses.",
        consultationFee: 1500,
        address: "City Family Clinic, Chowk Azam, Bahawalnagar",
    },
    {
        fullName: "Dr. Rabia Aslam",
        gender: "FEMALE",
        specialty: "Ophthalmology",
        degree: "MBBS, FCPS (Ophthalmology)",
        experienceYears: 11,
        about:
            "Eye specialist treating cataract, glaucoma, refractive errors and diabetic eye disease.",
        consultationFee: 2500,
        address: "ClearView Eye Hospital, Cantt, Faisalabad",
    },
    {
        fullName: "Dr. Nimra Farooq",
        gender: "FEMALE",
        specialty: "Endocrinology",
        degree: "MBBS, FCPS (Endocrinology)",
        experienceYears: 9,
        about:
            "Manages diabetes, thyroid disorders, PCOS and hormonal imbalances with personalized treatment plans.",
        consultationFee: 3000,
        address: "Diabetes & Hormone Centre, Johar Town, Lahore",
    },
    {
        fullName: "Dr. Saima Butt",
        gender: "FEMALE",
        specialty: "Pulmonology",
        degree: "MBBS, FCPS (Pulmonology)",
        experienceYears: 13,
        about:
            "Treats asthma, COPD, chest infections and sleep-related breathing disorders.",
        consultationFee: 2800,
        address: "Lung & Chest Clinic, Civil Lines, Sialkot",
    },
];

function slugify(name: string) {
    return name
        .toLowerCase()
        .replace(/^dr\.?\s+/, "")
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "");
}

export const seedDoctors = internalMutation({
    args: {
        // Optional: pass a real hash so seeded doctors can log in.
        passwordHash: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const passwordHash = args.passwordHash ?? "SEEDED_PLACEHOLDER_NOT_A_REAL_HASH";
        const now = Date.now();

        let created = 0;
        let skipped = 0;

        for (const d of DOCTORS) {
            const email = `${slugify(d.fullName)}${SEED_EMAIL_DOMAIN}`;

            // Skip if this seed doctor already exists (indexes don't enforce uniqueness).
            const existing = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", email))
                .first();

            if (existing) {
                skipped++;
                continue;
            }

            const userId = await ctx.db.insert("users", {
                fullName: d.fullName,
                email,
                passwordHash,
                role: "DOCTOR",
                emailVerified: true,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            await ctx.db.insert("doctors", {
                userId,
                specialty: d.specialty,
                degree: d.degree,
                experienceYears: d.experienceYears,
                about: d.about,
                consultationFee: d.consultationFee,
                address: d.address,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            created++;
        }

        return { created, skipped, total: DOCTORS.length };
    },
});

/**
 * Deletes only the doctors created by this seed (matched by the seed email domain).
 */
export const removeSeededDoctors = internalMutation({
    args: {},
    handler: async (ctx) => {
        const doctorUsers = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "DOCTOR"))
            .collect();

        let removed = 0;

        for (const user of doctorUsers) {
            if (!user.email.endsWith(SEED_EMAIL_DOMAIN)) continue;

            const profile = await ctx.db
                .query("doctors")
                .withIndex("by_user", (q) => q.eq("userId", user._id))
                .first();

            if (profile) await ctx.db.delete(profile._id);
            await ctx.db.delete(user._id);
            removed++;
        }

        return { removed };
    },
});