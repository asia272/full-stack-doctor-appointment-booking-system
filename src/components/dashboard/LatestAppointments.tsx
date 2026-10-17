import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";

import Avatar from "@/components/dashboard/Avatar";
import { formatDate } from "@/lib/format-appointment";
import type { AppointmentView } from "@/types/appointment";

type LatestAppointmentsProps = {
    title: string;
    appointments: AppointmentView[];
    show: "doctor" | "patient";
    renderAction?: (appointment: AppointmentView) => ReactNode;
    emptyText?: string;
};

export default function LatestAppointments({
    title,
    appointments,
    show,
    renderAction,
    emptyText = "No appointments yet.",
}: LatestAppointmentsProps) {
    return (
        <section className="overflow-hidden rounded-md border bg-background">
            <header className="flex items-center gap-2.5 border-b px-6 py-5">
                <ClipboardList className="size-5 text-primary" />
                <h2 className="text-lg font-medium text-[#262626]">{title}</h2>
            </header>

            {appointments.length === 0 ? (
                <p className="px-6 py-10 text-center text-[#6B7280]">{emptyText}</p>
            ) : (
                <ul className="divide-y">
                    {appointments.map((appointment) => {
                        const person =
                            show === "doctor"
                                ? appointment.doctor
                                : appointment.patient;
                        const name = person?.fullName ?? "Unknown";
                        const displayName =
                            show === "doctor" ? `Dr. ${name}` : name;

                        return (
                            <li
                                key={appointment.id}
                                className="flex items-center gap-4 px-6 py-4"
                            >
                                <Avatar name={name} src={person?.imageUrl} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-[#262626]">
                                        {displayName}
                                    </p>
                                    <p className="text-sm text-[#6B7280]">
                                        Booking on{" "}
                                        {formatDate(appointment.appointmentDate)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {renderAction?.(appointment)}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}