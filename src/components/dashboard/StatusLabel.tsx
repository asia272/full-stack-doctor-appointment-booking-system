import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/appointment";

const STYLES: Record<AppointmentStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "text-amber-600" },
    CONFIRMED: { label: "Confirmed", className: "text-blue-600" },
    COMPLETED: { label: "Completed", className: "text-green-600" },
    CANCELLED: { label: "Cancelled", className: "text-red-500" },
    REJECTED: { label: "Rejected", className: "text-red-500" },
};

export default function StatusLabel({ status }: { status: AppointmentStatus }) {
    const { label, className } = STYLES[status];
    return <span className={cn("text-sm font-medium", className)}>{label}</span>;
}