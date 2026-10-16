import { ListChecks } from "lucide-react";

import type { AdminAppointment } from "@/lib/appointments/admin-appointment.service";
import { formatAppointmentDate } from "@/features/admin/lib/format";
import PersonAvatar from "@/features/admin/components/PersonAvatar";
import AppointmentAction from "@/features/admin/components/AppointmentAction";

export default function LatestAppointments({
    appointments,
}: {
    appointments: AdminAppointment[];
}) {
    return (
        <section className="rounded-xl border bg-background">
            <header className="flex items-center gap-3 border-b px-5 py-4">
                <ListChecks className="size-5 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">Latest Appointments</h2>
            </header>

            {appointments.length === 0 ? (
                <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No appointments yet.
                </p>
            ) : (
                <ul className="divide-y">
                    {appointments.map((appointment) => (
                        <li
                            key={appointment.id}
                            className="flex items-center gap-4 px-5 py-4"
                        >
                            <PersonAvatar
                                imageUrl={appointment.doctor?.imageUrl}
                                className="size-11"
                            />

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {appointment.doctor?.fullName ?? "Unknown doctor"}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    Booking on{" "}
                                    {formatAppointmentDate(appointment.appointmentDate)}
                                </p>
                            </div>

                            <AppointmentAction appointment={appointment} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}