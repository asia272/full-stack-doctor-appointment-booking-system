/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

type AvatarProps = {
    name: string;
    src?: string | null;
    className?: string;
};

export default function Avatar({ name, src, className }: AvatarProps) {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    return (
        <span
            className={cn(
                "relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-[#515151]",
                className,
            )}
        >
            {src ? (
                <img src={src} alt={name} className="size-full object-cover" />
            ) : (
                initials || "?"
            )}
        </span>
    );
}