import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Pencil, Phone, UserRound } from "lucide-react";

import { Id } from "../../../../convex/_generated/dataModel";
import { internal } from "../../../../convex/_generated/api";

import { FunctionReference } from "convex/server";

import {
    getConvexAdminClient,
    getCurrentSessionUser,
} from "@/lib/auth/session";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const internalQuery = (ref: unknown) =>
    ref as FunctionReference<"query">;

function getInitials(name: string) {
    return (
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U"
    );
}

function formatDate(value?: string) {
    if (!value) return "Not provided";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-PK", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function ProfileItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserRound;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 size-5 text-muted-foreground" />

            <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 break-words text-sm font-medium">
                    {value?.trim() || "Not provided"}
                </p>
            </div>
        </div>
    );
}

export default async function MyProfilePage() {
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
            <div className="mx-auto max-w-3xl space-y-8">
                <div>
                    <p className="text-sm font-medium text-[#5F6FFF]">
                        Account
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight">
                        My Profile
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        View your personal information and manage your account details.
                    </p>
                </div>

                <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <Avatar className="size-20">
                            {profile.imageUrl && (
                                <AvatarImage
                                    src={profile.imageUrl}
                                    alt={`${profile.fullName}'s profile photo`}
                                    className="object-cover"
                                />
                            )}

                            <AvatarFallback className="bg-[#5F6FFF]/10 text-xl font-semibold text-[#5F6FFF]">
                                {getInitials(profile.fullName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-semibold">
                                {profile.fullName}
                            </h2>

                            <p className="mt-1 break-all text-sm text-muted-foreground">
                                {profile.email}
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                                Patient account
                            </p>
                        </div>

                        <Button className="shrink-0">
                            <Link href="/my-profile/edit">
                                <Pencil className="mr-2 size-4" />
                                Update Profile
                            </Link>
                        </Button>
                    </div>

                    <div className="my-8 border-t" />

                    <h3 className="text-lg font-semibold">
                        Personal Information
                    </h3>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <ProfileItem
                            icon={UserRound}
                            label="Full name"
                            value={profile.fullName}
                        />

                        <ProfileItem
                            icon={UserRound}
                            label="Gender"
                            value={profile.gender?.replaceAll("_", " ")}
                        />

                        <ProfileItem
                            icon={Phone}
                            label="Phone number"
                            value={profile.phoneNumber}
                        />

                        <ProfileItem
                            icon={CalendarDays}
                            label="Date of birth"
                            value={formatDate(profile.dateOfBirth)}
                        />

                        <div className="sm:col-span-2">
                            <ProfileItem
                                icon={MapPin}
                                label="Address"
                                value={profile.address}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}