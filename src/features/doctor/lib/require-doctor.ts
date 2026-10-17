import "server-only";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/dal";

export async function requireDoctor() {
    const user = await getCurrentUser();

    if (!user) redirect("/staff/login");
    if (user.role !== "DOCTOR") redirect("/");

    return user;
}