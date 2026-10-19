import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FunctionReference } from "convex/server";

import { Id } from "../../../../../convex/_generated/dataModel";
import {
    internal

} from "../../../../../convex/_generated/api";
import {
    getConvexAdminClient,
    getCurrentSessionUser,
} from "@/lib/auth/session";

import { Button } from "@/components/ui/button";
import PatientProfileForm from "../patient-profile-form";

const internalQuery = (ref: unknown) =>
    ref as FunctionReference<"query">;

export default async function EditProfilePage() {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) redirect("/login");
    if (sessionUser.role !== "USER") redirect("/");

    const convex = getConvexAdminClient();

    const profile = await convex.query(
        internalQuery(internal.patients.getProfile),
        {
            userId: sessionUser.id as Id<"users">,
        },
    );

    return (
        <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-16">
            <div className="mx-auto max-w-3xl space-y-6">
                <Button variant="ghost">
                    <Link href="/my-profile" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-[#5F6FFF] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4c5ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Profile
                    </Link>
                </Button>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Update Profile
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Update your personal information and profile photo.
                    </p>
                </div>

                <PatientProfileForm profile={profile} />
            </div>
        </main>
    );
}