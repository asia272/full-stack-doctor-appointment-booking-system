import type { ReactNode } from "react";

type DashboardShellProps = {
    header: ReactNode;
    sidebar: ReactNode;
    children: ReactNode;
};

export default function DashboardShell({
    header,
    sidebar,
    children,
}: DashboardShellProps) {
    return (
        <div className="flex min-h-svh flex-col bg-muted/30">
            {header}

            <div className="flex flex-1">
                <aside className="sticky top-22 hidden h-[calc(100svh-5.5rem)] w-[340px] shrink-0 overflow-y-auto border-r border-[#BEBEBE] bg-background md:block">
                    {sidebar}
                </aside>

                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}