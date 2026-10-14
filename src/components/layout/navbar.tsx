import { FunctionReference } from "convex/server";
import { Id } from "../../../convex/_generated/dataModel";
import { internal } from "../../../convex/_generated/api";

import {
    getConvexAdminClient,
    getCurrentSessionUser,
} from "@/lib/auth/session";

import { NavbarClient } from "@/components/layout/navbar-client";

const internalQuery = (ref: unknown) =>
    ref as FunctionReference<"query">;

export async function Navbar() {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
        return <NavbarClient user={null} />;
    }

    const convex = getConvexAdminClient();

    const profile = await convex.query(
        internalQuery(internal.users.getNavbarProfile),
        {
            userId: sessionUser.id as Id<"users">,
        },
    );

    if (!profile) {
        return <NavbarClient user={null} />;
    }

    return (
        <NavbarClient
            user={{
                fullName: profile.fullName,
                email: profile.email,
                role: profile.role,
                imageUrl: profile.imageUrl,
            }}
        />
    );
}