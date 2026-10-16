import type { AdminAppointment } from "@/lib/appointments/admin-appointment.service";
import { formatAppointmentDate } from "@/features/admin/lib/format";
import CancelAppointmentButton from "./CancelappointmentButton";

const STATUS_LABELS = {
    CANCELLED: { label: "Cancelled", className: "text-destructive" },
    COMPLETED: { label: "Completed", className: "text-green-600" },
    REJECTED: { label: "Rejected", className: "text-destructive" },
} as const;

export default function AppointmentAction({
    appointment,
}: {
    appointment: AdminAppointment;
}) {
    if (appointment.canCancel) {
        const patient = appointment.patient?.fullName ?? "this patient";
        const doctor = appointment.doctor?.fullName ?? "the doctor";

        return (
            <CancelAppointmentButton
                appointmentId={appointment.id}
                summary={`${patient} with ${doctor} on ${formatAppointmentDate(appointment.appointmentDate)}, ${appointment.timeLabel}.`}
            />
        );
    }

    const status =
        appointment.status in STATUS_LABELS
            ? STATUS_LABELS[appointment.status as keyof typeof STATUS_LABELS]
            : null;

    return status ? (
        <span className={`text-sm font-medium ${status.className}`}>
            {status.label}
        </span>
    ) : null;
}