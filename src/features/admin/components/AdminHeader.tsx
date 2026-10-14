"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Stethoscope } from "lucide-react";


import { logoutAction } from "@/app/actions/auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import AdminNav from "@/features/admin/components/AdminNav";

export default function AdminHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0">
                        <SheetHeader className="border-b p-4">
                            <SheetTitle>Admin menu</SheetTitle>
                            <SheetDescription className="sr-only">
                                Navigate the admin dashboard
                            </SheetDescription>
                        </SheetHeader>
                        <AdminNav onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>

                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2.5"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Stethoscope className="size-5" />
                    </span>
                    <span className="leading-none">
                        <span className="block text-xl font-bold tracking-tight">
                            Prescripto
                        </span>
                        <span className="block text-[10px] font-medium text-muted-foreground">
                            Dashboard Panel
                        </span>
                    </span>
                </Link>

                <Badge variant="outline" className="rounded-full">
                    Admin
                </Badge>
            </div>

            <form action={logoutAction}>
                <Button type="submit" className="rounded-full px-6">
                    <LogOut className="mr-2 size-4" />
                    Logout
                </Button>
            </form>
        </header>
    );
}