
import { redirect } from "next/navigation";
import { FunctionReference } from "convex/server";

import { Id } from "../../../../convex/_generated/dataModel";
import { internal } from "../../../../convex/_generated/api";
import {
    getConvexAdminClient,
    getCurrentSessionUser,
} from "@/lib/auth/session";

import PatientProfileForm from "./patient-profile-form";

const internalQuery = (ref: unknown) =>
    ref as FunctionReference<"query">;

export default async function MyProfilePage() {
    const user = await getCurrentSessionUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "USER") {
        redirect("/");
    }

    const client = getConvexAdminClient();

    const profile = await client.query(
        internalQuery(internal.patients.getProfile),
        { userId: user.id as Id<"users"> },
    );

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:py-14">
            <div className="mx-auto max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5F6FFF]">
                    Patient account
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    My Profile
                </h1>

                <p className="mt-3 mb-8 text-sm leading-6 text-slate-600 sm:text-base">
                    Manage your personal details and profile photo.
                </p>

                <PatientProfileForm profile={profile} />
            </div>
        </main>
    );
}
