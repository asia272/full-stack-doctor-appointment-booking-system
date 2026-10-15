"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cancelAppointmentAction } from "@/actions/my-appointments";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface CancelAppointmentButtonProps {
    appointmentId: string;
    doctorName: string;
    whenLabel: string;
}

export function CancelAppointmentButton({
    appointmentId,
    doctorName,
    whenLabel,
}: CancelAppointmentButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    async function handleCancel() {
        setIsCancelling(true);

        try {
            const result = await cancelAppointmentAction(appointmentId);

            if (result.ok) {
                toast.success("Appointment cancelled");
                setOpen(false);
                router.refresh();
                return;
            }

            toast.error(result.message);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
                className="h-auto w-full rounded-sm border-gray-300 bg-white py-2.5 text-sm font-normal text-gray-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
                Cancel appointment
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your appointment with {doctorName} on {whenLabel} will be
                            cancelled and the time slot will become available to other
                            patients.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            Keep appointment
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isCancelling}
                            onClick={(event) => {
                                // Keep the dialog open until the request finishes.
                                event.preventDefault();
                                void handleCancel();
                            }}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isCancelling ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Yes, cancel"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
