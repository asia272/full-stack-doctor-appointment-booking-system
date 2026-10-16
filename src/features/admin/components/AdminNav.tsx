"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { adminNav } from "@/features/admin/config/nav";

export default function AdminNav({
    onNavigate,
}: {
    onNavigate?: () => void;
}) {
    const pathname = usePathname();

    return (
        <nav aria-label="Admin navigation" className="flex flex-col py-4">
            {adminNav.map(({ label, href, icon: Icon, exact }) => {
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