import type { AdminAppointment } from "@/lib/appointments/admin-appointment.service";
import {
    formatAppointmentDate,
    formatFee,
} from "@/features/admin/lib/format";
import PersonAvatar from "@/features/admin/components/PersonAvatar";
import AppointmentAction from "@/features/admin/components/AppointmentAction";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function AdminAppointmentsTable({
    appointments,
}: {
    appointments: AdminAppointment[];
}) {
    return (
        <div className="rounded-xl border bg-background">
            <Table className="min-w-[56rem]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 pl-6">#</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Date &amp; Time</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Fees</TableHead>
                        <TableHead className="w-24 pr-6">
                            <span className="sr-only">Action</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {appointments.map((appointment, index) => (
                        <TableRow key={appointment.id}>
                            <TableCell className="pl-6 text-muted-foreground">
                                {index + 1}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <PersonAvatar
                                        imageUrl={appointment.patient?.imageUrl}
                                    />
                                    <span className="text-muted-foreground">
                                        {appointment.patient?.fullName ?? "Unknown"}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="text-muted-foreground">
                                {appointment.doctor?.specialty ?? "-"}
                            </TableCell>

                            <TableCell className="text-muted-foreground">
                                {appointment.patient?.age ?? "-"}
                            </TableCell>

                            <TableCell className="whitespace-nowrap text-muted-foreground">
                                {formatAppointmentDate(appointment.appointmentDate)},{" "}
                                {appointment.timeLabel}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <PersonAvatar
                                        imageUrl={appointment.doctor?.imageUrl}
                                    />
                                    <span className="text-muted-foreground">
                                        {appointment.doctor?.fullName ?? "Unknown"}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="text-muted-foreground">
                                {formatFee(appointment.consultationFee)}
                            </TableCell>

                            <TableCell className="pr-6">
                                <AppointmentAction appointment={appointment} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}