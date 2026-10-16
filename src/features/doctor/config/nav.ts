import { CalendarCheck, LayoutDashboard, UserRound } from "lucide-react";
import type { NavItem } from "@/types/nav";

export const doctorNav: NavItem[] = [
    {
        label: "Dashboard",
        href: "/doctor/dashboard",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: "Profile",
        href: "/doctor/profile",
        icon: UserRound,
    },
    {
        label: "Appointments",
        href: "/doctor/appointments",
        icon: CalendarCheck,
    },
];