"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/nav";

type DashboardNavProps = {
    items: NavItem[];
    ariaLabel: string;
    onNavigate?: () => void;
};

export default function DashboardNav({
    items,
    ariaLabel,
    onNavigate,
}: DashboardNavProps) {
    const pathname = usePathname();

    return (
        <nav aria-label={ariaLabel} className="flex flex-col py-4">
            {items.map(({ label, href, icon: Icon, exact }) => {
                const active = exact
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);

                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "flex items-center gap-3 border-r-4 border-transparent px-6 py-2.5 text-[18px] text-[#515151] transition-colors hover:bg-muted/60 hover:text-foreground",
                            active &&
                            "border-primary bg-primary/8 font-medium text-foreground",
                        )}
                    >
                        <Icon className="size-[24px] shrink-0 text-[#1C274C]" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}