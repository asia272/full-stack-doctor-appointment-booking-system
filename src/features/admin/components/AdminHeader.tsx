"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, Stethoscope } from "lucide-react";

// ⚠️ Replace with YOUR existing logout server action.
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
import Image from "next/image";

export default function AdminHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex h-22 items-center justify-between border-b border-[#BEBEBE] bg-background px-2 sm:px-4">
            <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                aria-label="Open menu"
                            />
                        }
                    >
                        <Menu className="size-5" />
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

                    <Image
                        src="/assets/assets_admin/admin_logo.svg"
                        alt="Admin Logo"
                        width={217}
                        height={46}
                        priority
                        className="h-[46px] w-[217px] object-contain"
                    />

                    <Badge variant="outline" className="rounded-full border border-[#4B5563] !px-2.5">
                        Admin
                    </Badge>


                </Link>

            </div>

            <form action={logoutAction}>
                <Button
                    type="submit"
                    className="h-12 w-full rounded-full px-6 text-base font-medium sm:h-[54px] sm:px-14 sm:text-[18px]"
                >
                    Logout
                </Button>
            </form>
        </header>
    );
}