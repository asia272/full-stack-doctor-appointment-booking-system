import type { LucideIcon } from "lucide-react";

export type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    /** Only highlight when the path matches exactly (e.g. dashboard). */
    exact?: boolean;
};