export type BookAppointmentResult =
    | { ok: true; appointmentId: string }
    | { ok: false; code: string; message: string };


export type AppointmentStatus =
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED";

export type AppointmentView = {
    id: string;
    status: AppointmentStatus;
    appointmentDate: string;
    appointmentTime: string;
    timeLabel: string;
    consultationFee: number;
    canCancel: boolean;
    patient: {
        fullName: string;
        imageUrl: string | null;
        age: number | null;
    } | null;
    doctor: {
        fullName: string;
        specialty: string;
        imageUrl: string | null;
    } | null;
};