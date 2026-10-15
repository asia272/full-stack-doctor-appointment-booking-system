export type BookAppointmentResult =
    | { ok: true; appointmentId: string }
    | { ok: false; code: string; message: string };
