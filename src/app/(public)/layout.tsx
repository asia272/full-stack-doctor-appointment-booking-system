import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth/dal";

import PublicFooter from "@/components/layout/PublicFooter";
import { Navbar } from "@/components/layout/navbar";

export default async function PublicLayout({
    children,
}: {
    children: ReactNode;
}) {


    return (
        <div className="flex min-h-svh flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            <PublicFooter />
        </div>
    );
}