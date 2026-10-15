import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { getMyAppointments } from "@/lib/appointments/appointment.service";
import { getCurrentSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
    title: "My Appointments",
};

// Always read fresh data: this page depends on the session cookie.
export const dynamic = "force-dynamic";

export default async function MyAppointmentsPage() {
    const user = await getCurrentSessionUser();

    if (!user) redirect("/register");
    // Admins and doctors have their own dashboards.
    if (user.role !== "USER") redirect("/");

    const appointments = await getMyAppointments(user.id);

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            <h1 className="border-b border-gray-200 pb-3 text-2xl font-medium text-gray-700">
                My Appointments
            </h1>

            {appointments.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p className="text-gray-600">
                        You haven&apos;t booked any appointments yet.
                    </p>
                    <Link
                        href="/"
                        className="rounded-full bg-[#5F6FFF] px-10 py-3 text-sm text-white transition-colors hover:bg-[#4f5fe6]"
                    >
                        Browse doctors
                    </Link>
                </div>
            ) : (
                <ul>
                    {appointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                        />
                    ))}
                </ul>
            )}
        </main>
    );
}
