import type { ReactNode } from "react";
import Image from "next/image";

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
        <section className="w-full min-w-0 overflow-hidden rounded-[5px] border border-[#D8D8D8] bg-white">
            <header className="flex min-h-[65px] items-center gap-3 border-b border-[#E1E1E1] px-4 py-4 sm:gap-3.5 sm:px-6">
                <Image
                    src="/assets/assets_admin/list_icon.svg"
                    alt=""
                    width={22}
                    height={22}
                    className="size-[22px] shrink-0 object-contain"
                    aria-hidden="true"
                />

                <h2 className="font-sans text-[18px] font-medium leading-[100%] tracking-normal text-[#323232]">
                    {title}
                </h2>
            </header>

            {appointments.length === 0 ? (
                <p className="px-4 py-10 text-center font-sans text-sm text-[#6B7280] sm:px-6">
                    {emptyText}
                </p>
            ) : (
                <ul className="divide-y divide-[#EAEAEA]">
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
                                className="flex min-w-0 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6"
                            >
                                <Avatar
                                    name={name}
                                    src={person?.imageUrl}
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-sans text-[18px] font-medium leading-5 text-[#262626]">
                                        {displayName}
                                    </p>


                                    <p className="mt-1 font-sans text-[16px] font-normal leading-5 text-[#696B80] ">
                                        Booking on{" "}
                                        {formatDate(
                                            appointment.appointmentDate
                                        )}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
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