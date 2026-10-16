import Image from "next/image";

type AdminStatCardProps = {
    icon: string;
    value: number;
    label: string;
};

export default function AdminStatCard({
    icon,
    value,
    label,
}: AdminStatCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border bg-background p-4 shadow-xs">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Image
                    src={icon}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                    aria-hidden="true"
                />
            </span>

            <div>
                <p className="text-2xl font-semibold leading-none">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}