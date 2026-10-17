import type { ReactNode } from "react";

import Avatar from "@/components/dashboard/Avatar";
import { formatDateTime, formatMoney } from "@/lib/format-appointment";
import type { AppointmentView } from "@/types/appointment";

type AppointmentsTableProps = {
    appointments: AppointmentView[];
    variant: "admin" | "doctor";
    renderAction?: (appointment: AppointmentView) => ReactNode;
    emptyText?: string;
};

const th = "px-4 py-4 text-left text-base font-[18px] text-[#323232]";
const td = "px-4 py-3 text-[#515151]";

export default function AppointmentsTable({
    appointments,
    variant,
    renderAction,
    emptyText = "No appointments found.",
}: AppointmentsTableProps) {
    const isAdmin = variant === "admin";

    return (
        <div className="overflow-x-auto rounded-md border bg-background">
            <table className="w-full min-w-[720px] border-collapse">
                <thead>
                    <tr className="border-b border-[#E1E1E1]">
                        <th className={th}>#</th>
                        <th className={th}>Patient</th>
                        {isAdmin && <th className={th}>Department</th>}
                        <th className={th}>Age</th>
                        <th className={th}>Date &amp; Time</th>
                        {isAdmin && <th className={th}>Doctor</th>}
                        <th className={th}>Fees</th>
                        <th className={th}>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td
                                colSpan={isAdmin ? 8 : 6}
                                className="px-4 py-12 text-center text-[#6B7280]"
                            >
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        appointments.map((a, index) => (
                            <tr key={a.id} className="border-b last:border-b-0 border-[#E1E1E1]">
                                <td className={td}>{index + 1}</td>

                                <td className={td}>
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            name={a.patient?.fullName ?? "?"}
                                            src={a.patient?.imageUrl}
                                        />
                                        <span>{a.patient?.fullName ?? "Unknown"}</span>
                                    </div>
                                </td>

                                {isAdmin && (
                                    <td className={td}>
                                        {a.doctor?.specialty ?? "-"}
                                    </td>
                                )}

                                <td className={td}>{a.patient?.age ?? "-"}</td>

                                <td className={td}>
                                    {formatDateTime(a.appointmentDate, a.timeLabel)}
                                </td>

                                {isAdmin && (
                                    <td className={td}>
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={a.doctor?.fullName ?? "?"}
                                                src={a.doctor?.imageUrl}
                                            />
                                            <span>
                                                Dr. {a.doctor?.fullName ?? "Unknown"}
                                            </span>
                                        </div>
                                    </td>
                                )}

                                <td className={td}>
                                    {formatMoney(a.consultationFee)}
                                </td>

                                <td className={td}>
                                    <div className="flex items-center gap-2">
                                        {renderAction?.(a)}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}