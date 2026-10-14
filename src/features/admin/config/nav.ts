import {
    CalendarDays,
    LayoutDashboard,
    SquarePlus,
    Users,
    type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
};

export const adminNav: AdminNavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
    { label: "Add Doctor", href: "/admin/doctors/new", icon: SquarePlus },
    { label: "Doctors List", href: "/admin/doctors", icon: Users, exact: true },
];