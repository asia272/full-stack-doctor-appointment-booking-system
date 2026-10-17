import type { QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
    formatSlotLabel,
    getClinicNow,
    isSlotBlockingStatus,
} from "./booking";

type PatientInfo = {
    fullName: string;
    imageUrl: string | null;
    age: number | null;
};

type DoctorInfo = {
    fullName: string;
    specialty: string;
    imageUrl: string | null;
};

function memoize<K, V>(load: (key: K) => Promise<V>) {
    const cache = new Map<K, Promise<V>>();

    return (key: K): Promise<V> => {
        let pending = cache.get(key);

        if (!pending) {
            pending = load(key);
            cache.set(key, pending);
        }

        return pending;
    };
}

function calculateAge(
    dateOfBirth: string | undefined,
    today: string,
): number | null {
    if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return null;

    const [birthYear, birthMonth, birthDay] = dateOfBirth.split("-").map(Number);
    const [year, month, day] = today.split("-").map(Number);

    let age = year - birthYear;
    if (month < birthMonth || (month === birthMonth && day < birthDay)) {
        age -= 1;
    }

    return age >= 0 && age < 130 ? age : null;
}

/** Shared by the admin and doctor queries so both return the same shape. */
export async function withAppointmentDetails(
    ctx: QueryCtx,
    rows: Doc<"appointments">[],
) {
    const today = getClinicNow().date;

    const imageUrlFor = async (storageId: Id<"_storage"> | undefined) =>
        storageId ? await ctx.storage.getUrl(storageId) : null;

    const loadPatient = memoize(
        async (patientId: Id<"users">): Promise<PatientInfo | null> => {
            const user = await ctx.db.get(patientId);
            if (!user) return null;

            const profile = await ctx.db
                .query("patients")
                .withIndex("by_user", (q) => q.eq("userId", patientId))
                .first();

            return {
                fullName: user.fullName,
                imageUrl: await imageUrlFor(user.imageStorageId),
                age: calculateAge(profile?.dateOfBirth, today),
            };
        },
    );

    const loadDoctor = memoize(
        async (doctorId: Id<"doctors">): Promise<DoctorInfo | null> => {
            const doctor = await ctx.db.get(doctorId);
            if (!doctor) return null;

            const user = await ctx.db.get(doctor.userId);
            if (!user) return null;

            return {
                fullName: user.fullName,
                specialty: doctor.specialty,
                imageUrl: await imageUrlFor(user.imageStorageId),
            };
        },
    );

    return Promise.all(
        rows.map(async (row) => ({
            id: row._id as string,
            status: row.status,
            appointmentDate: row.appointmentDate,
            appointmentTime: row.appointmentTime,
            timeLabel: formatSlotLabel(row.appointmentTime),
            consultationFee: row.consultationFee,
            canCancel: isSlotBlockingStatus(row.status),
            patient: await loadPatient(row.patientId),
            doctor: await loadDoctor(row.doctorId),
        })),
    );
}