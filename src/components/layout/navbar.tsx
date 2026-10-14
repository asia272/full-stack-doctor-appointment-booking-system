import { getCurrentSessionUser } from "@/lib/auth/session"; // <- your session helper

import { NavbarClient } from "@/app/actions/navbar-client";

export async function Navbar() {
    const user = await getCurrentSessionUser();

    // Pass only the safe fields to the client, never the password hash.
    return (
        <NavbarClient
            user={
                user
                    ? {
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role,
                    }
                    : null
            }
        />
    );
}