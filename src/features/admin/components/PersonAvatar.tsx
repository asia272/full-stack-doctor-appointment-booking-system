import Image from "next/image";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

export default function PersonAvatar({
    imageUrl,
    className,
}: {
    imageUrl: string | null | undefined;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
                className,
            )}
        >
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="48px"
                    className="object-cover"
                />
            ) : (
                <User
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                />
            )}
        </span>
    );
}