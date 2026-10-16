import type { LucideIcon } from "lucide-react";

export default function AdminStatCard({
    icon: Icon,
    value,
    label,
}: {
    icon: LucideIcon;
    value: number;
    label: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border bg-background p-4 shadow-xs">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden="true" />
            </span>
            <div>
                <p className="text-2xl font-semibold leading-none">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}