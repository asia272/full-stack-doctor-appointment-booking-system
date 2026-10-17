import Image from "next/image";

type StatCardProps = {
    iconSrc: string;
    value: string | number;
    label: string;
};

export default function StatCard({
    iconSrc,
    value,
    label,
}: StatCardProps) {
    return (
        <div className="flex min-w-0 items-center gap-4 rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-none">
            {/* Icon container */}
            <div className="flex size-[66px] shrink-0 items-center justify-center rounded-[10px] bg-[#F6F8FF]">
                <Image
                    src={iconSrc}
                    alt=""
                    width={35}
                    height={39}
                    className="h-[39px] w-auto max-w-[40px] object-contain"
                    aria-hidden="true"
                />
            </div>

            {/* Value and label */}
            <div className="min-w-0 flex-1">
                <p className="font-sans text-[23px] font-medium leading-[30px] tracking-normal text-[#515151]">
                    {value}
                </p>

                <p className="font-sans text-[14px] font-normal leading-[20px] tracking-normal text-[#6B7280]">
                    {label}
                </p>
            </div>
        </div>
    );
}