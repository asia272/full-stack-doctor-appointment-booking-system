import { cn } from "@/lib/utils";

type Props = {
    method?: "CASH" | "ONLINE";
    status?: "UNPAID" | "PAID";
};

export default function PaymentBadge({ method = "CASH", status = "UNPAID" }: Props) {
    const paid = status === "PAID";

    return (
        <span className="inline-flex items-center gap-2">
            <span className="rounded-full border border-[#4B5563] px-2.5 py-0.5 text-xs uppercase text-[#4B5563]">
                {method === "ONLINE" ? "Online" : "Cash"}
            </span>
            <span
                className={cn(
                    "text-xs font-medium",
                    paid ? "text-green-600" : "text-amber-600",
                )}
            >
                {paid ? "Paid" : "Unpaid"}
            </span>
        </span>
    );
}