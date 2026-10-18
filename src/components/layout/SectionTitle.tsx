import { cn } from "@/lib/utils";

type SectionTitleProps = {
    lead: string;
    strong: string;
    as?: "h1" | "h2";
    className?: string;
};

export default function SectionTitle({
    lead,
    strong,
    as: Tag = "h2",
    className,
}: SectionTitleProps) {
    return (
        <Tag
            className={cn(
                "text-xl uppercase text-[#4B5563] sm:text-2xl",
                className,
            )}
        >
            {lead} <span className="font-semibold text-[#171717]">{strong}</span>
        </Tag>
    );
}