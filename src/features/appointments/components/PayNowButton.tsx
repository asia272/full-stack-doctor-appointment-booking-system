"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CreditCard, LoaderCircle } from "lucide-react";

import { createCheckoutSessionAction } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";

export default function PayNowButton({
    appointmentId,
}: {
    appointmentId: string;
}) {
    const [isPending, startTransition] = useTransition();

    function pay() {
        startTransition(async () => {
            const result = await createCheckoutSessionAction(appointmentId);

            if (result.ok) {
                window.location.assign(result.url);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Button
            type="button"
            disabled={isPending}
            onClick={pay}
            className="h-10 w-full rounded-sm px-4 text-sm font-normal"
        >
            {isPending ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
                <CreditCard className="mr-2 size-4" />
            )}
            Pay online
        </Button>
    );
}