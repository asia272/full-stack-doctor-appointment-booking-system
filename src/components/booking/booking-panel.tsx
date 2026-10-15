"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { bookAppointmentAction } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BookingPanelProps {
    doctorId: string;
    doctorName: string;
    isAvailable: boolean;
}

export function BookingPanel({
    doctorId,
    doctorName,
    isAvailable,
}: BookingPanelProps) {
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const days = useQuery(api.appointments.getBookingDays);
    const activeDate = selectedDate ?? days?.[0]?.date ?? null;
    const activeDay = days?.find((day) => day.date === activeDate);

    const slots = useQuery(
        api.appointments.getAvailableSlots,
        activeDate && isAvailable
            ? { doctorId: doctorId as Id<"doctors">, date: activeDate }
            : "skip",
    );

    // If the chosen slot was just taken by someone else, it drops out here.
    const activeSlot =
        slots?.find((slot) => slot.time === selectedTime && slot.available) ??
        null;

    function handleSelectDate(date: string) {
        setSelectedDate(date);
        setSelectedTime(null);
    }

    async function handleBook() {
        if (!activeDate || !activeSlot) {
            toast.error("Please select a date and a time slot.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await bookAppointmentAction({
                doctorId,
                appointmentDate: activeDate,
                appointmentTime: activeSlot.time,
            });

            if (result.ok) {
                toast.success("Appointment booked", {
                    description: `${doctorName} · ${activeDay?.weekday ?? ""} ${
                        activeDay?.dayOfMonth ?? ""
                    } at ${activeSlot.label}`,
                });
                setSelectedTime(null);
                return;
            }

            if (result.code === "UNAUTHENTICATED") {
                toast.error(result.message);
                router.push("/register");
                return;
            }

            toast.error(result.message);
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mt-6 font-medium text-gray-700 sm:ml-72 sm:pl-4">
            <p>Booking slots</p>

            {!isAvailable && (
                <p className="mt-4 text-sm font-normal text-gray-500">
                    This doctor is not accepting new appointments right now.
                </p>
            )}

            {/* Days */}
            <div className="mt-4 flex w-full items-center gap-3 overflow-x-auto pb-2">
                {days === undefined
                    ? Array.from({ length: 7 }, (_, index) => (
                          <Skeleton
                              key={index}
                              className="h-[88px] w-16 shrink-0 rounded-full"
                          />
                      ))
                    : days.map((day) => (
                          <button
                              key={day.date}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => handleSelectDate(day.date)}
                              className={cn(
                                  "min-w-16 shrink-0 cursor-pointer rounded-full py-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                                  day.date === activeDate
                                      ? "bg-[#5F6FFF] text-white"
                                      : "border border-gray-200 hover:border-[#5F6FFF]",
                              )}
                          >
                              <p>{day.weekday}</p>
                              <p>{day.dayOfMonth}</p>
                          </button>
                      ))}
            </div>

            {/* Time slots */}
            <div className="mt-4 flex w-full items-center gap-3 overflow-x-auto pb-2">
                {isAvailable && slots === undefined && activeDate !== null
                    ? Array.from({ length: 8 }, (_, index) => (
                          <Skeleton
                              key={index}
                              className="h-9 w-24 shrink-0 rounded-full"
                          />
                      ))
                    : slots?.map((slot) => (
                          <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                  "shrink-0 cursor-pointer rounded-full px-5 py-2 text-sm font-light transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40",
                                  slot.time === activeSlot?.time
                                      ? "bg-[#5F6FFF] text-white"
                                      : "border border-gray-300 text-gray-400 hover:border-[#5F6FFF]",
                              )}
                          >
                              {slot.label}
                          </button>
                      ))}
            </div>

            {isAvailable && slots !== undefined && slots.length === 0 && (
                <p className="mt-2 text-sm font-normal text-gray-500">
                    No slots are available on this day.
                </p>
            )}

            <Button
                type="button"
                onClick={handleBook}
                disabled={isSubmitting || !isAvailable}
                className="my-6 h-auto rounded-full bg-[#5F6FFF] px-14 py-3 text-sm font-light text-white shadow-lg shadow-[#5F6FFF]/30 hover:bg-[#4f5fe6]"
            >
                {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    "Book an appointment"
                )}
            </Button>
        </section>
    );
}
