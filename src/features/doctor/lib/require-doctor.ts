import { redirect } from "next/navigation";
// import the same helpers you use in require-admin.ts

export async function requireDoctor() {
    // 1. get the current user exactly like requireAdmin does
    // const user = await getCurrentUser();

    // 2. not logged in -> login page
    // if (!user) redirect("/login");

    // 3. wrong role -> send them away
    // if (user.role !== "doctor") redirect("/");

    // return user;
}