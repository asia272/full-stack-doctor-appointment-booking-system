"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LoaderCircle, X } from "lucide-react";



import { cancelAppointmentByAdminAction } from "@/actions/admin-appointment";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function CancelAppointmentButton({
    appointmentId,
    summary,
}: {
    appointmentId: string;
    summary: string;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    function confirmCancel() {
        startTransition(async () => {
            const result = await cancelAppointmentByAdminAction({
                appointmentId,
            });

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cancel appointment"
                title="Cancel appointment"
                onClick={() => setOpen(true)}
                className="size-9 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
            >
                <X className="size-4" />
            </Button>

            <AlertDialog
                open={open}
                onOpenChange={(next) => {
                    if (!isPending) setOpen(next);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {summary} The time slot becomes available again for
                            other patients.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setOpen(false)}
                        >
                            Keep appointment
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isPending}
                            onClick={confirmCancel}
                        >
                            {isPending && (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                            )}
                            Yes, cancel it
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}