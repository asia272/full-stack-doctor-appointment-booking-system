export type AppointmentStatus =
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED";

export interface MyAppointment {
    id: string;
    status: AppointmentStatus;
    /** "2026-10-20" */
    appointmentDate: string;
    /** "14:30" (24-hour) */
    appointmentTime: string;
    consultationFee: number;
    reason: string | null;
    canCancel: boolean;
    paymentMethod?: "CASH" | "ONLINE";
    paymentStatus?: "UNPAID" | "PAID";
    /** null when the doctor record no longer exists. */
    doctor: {
        id: string;
        fullName: string;
        specialty: string;
        address: string;
        imageUrl: string | null;
    } | null;
}

export type CancelAppointmentResult =
    | { ok: true }
    | { ok: false; code: string; message: string };
