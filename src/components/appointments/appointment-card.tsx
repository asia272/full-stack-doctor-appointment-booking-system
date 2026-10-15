import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    formatAppointmentDate,
    formatAppointmentTime,
} from "@/lib/appointment-format";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppointmentStatus, MyAppointment } from "@/types/my-appointment";
import { CancelAppointmentButton } from "./cancel-appointment-button";

const STATUS_STYLES: Record<AppointmentStatus, { label: string; className: string }> = {
    PENDING: {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
    CONFIRMED: {
        label: "Confirmed",
        className: "bg-[#5F6FFF] text-white hover:bg-[#5F6FFF]",
    },
    COMPLETED: {
        label: "Completed",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700 hover:bg-red-100",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-gray-200 text-gray-700 hover:bg-gray-200",
    },
};

interface AppointmentCardProps {
    appointment: MyAppointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const { doctor, status } = appointment;
    const statusStyle = STATUS_STYLES[status];

    const dateLabel = formatAppointmentDate(appointment.appointmentDate);
    const timeLabel = formatAppointmentTime(appointment.appointmentTime);
    const doctorName = doctor?.fullName ?? "Doctor unavailable";

    return (
        <li className="flex flex-col gap-4 border-b border-gray-200 py-4 sm:flex-row sm:gap-6">
            {/* Doctor image */}
            <div className="size-28 shrink-0 overflow-hidden rounded-sm bg-[#EAEFFF] sm:size-48">
                {doctor?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={doctor.imageUrl}
                        alt={doctorName}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="flex size-14 items-center justify-center rounded-full bg-[#5F6FFF]/15 text-lg font-medium text-[#5F6FFF] sm:size-20 sm:text-2xl">
                            {doctor ? getInitials(doctor.fullName) : "?"}
                        </span>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1 text-sm text-gray-600">
                <p className="text-lg font-semibold text-gray-900">
                    {doctor ? (
                        <Link href={`/doctors/${doctor.id}`} className="hover:underline">
                            {doctorName}
                        </Link>
                    ) : (
                        doctorName
                    )}
                </p>
                {doctor && <p className="text-base text-gray-600">{doctor.specialty}</p>}

                {doctor && (
                    <>
                        <p className="mt-3 font-medium text-gray-700">Address:</p>
                        <p className="text-xs">{doctor.address}</p>
                    </>
                )}

                <p className="mt-2 text-sm">
                    <span className="font-medium text-gray-700">Date &amp; Time:</span>{" "}
                    {dateLabel} | {timeLabel}
                </p>
            </div>

            {/* Status + actions */}
            <div className="flex flex-col justify-end gap-2 sm:w-48">
                <Badge
                    className={cn(
                        "w-full justify-center rounded-sm py-2.5 text-sm font-normal",
                        statusStyle.className,
                    )}
                >
                    {statusStyle.label}
                </Badge>

                {appointment.canCancel && (
                    <CancelAppointmentButton
                        appointmentId={appointment.id}
                        doctorName={doctorName}
                        whenLabel={`${dateLabel} at ${timeLabel}`}
                    />
                )}
            </div>
        </li>
    );
}
