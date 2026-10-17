import Image from "next/image";

type StatCardProps = {
    iconSrc: string;
    value: string | number;
    label: string;
};

export default function StatCard({ iconSrc, value, label }: StatCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-md border bg-background p-5 shadow-xs">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-primary/8">
                <Image src={iconSrc} alt="" width={40} height={40} />
            </div>
            <div>
                <p className="text-2xl font-semibold leading-tight text-[#515151]">
                    {value}
                </p>
                <p className="text-base text-[#6B7280]">{label}</p>
            </div>
        </div>
    );
}