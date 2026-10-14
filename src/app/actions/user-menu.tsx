"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CalendarDays, ChevronDown, LogOut, User } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NavbarUser = {
    fullName: string;
    email: string;
    role: "ADMIN" | "DOCTOR" | "USER";
};

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export function UserMenu({ user }: { user: NavbarUser }) {
    const [isPending, startTransition] = useTransition();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#5F6FFF]/50"
                aria-label="Open account menu"
            >
                <Avatar className="size-11">
                    <AvatarFallback className="bg-[#5F6FFF]/10 font-medium text-[#5F6FFF]">
                        {getInitials(user.fullName)}
                    </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-4 text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <p className="truncate text-sm font-medium">{user.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        className="cursor-pointer"
                        render={<Link href="/my-profile" />}
                    >
                        <User className="mr-2 size-4" /> My Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer"
                        render={<Link href="/my-appointments" />}
                    >
                        <CalendarDays className="mr-2 size-4" /> My Appointments
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={isPending}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() =>
                            startTransition(async () => {
                                await logoutAction();
                            })
                        }
                    >
                        <LogOut className="mr-2 size-4" />
                        {isPending ? "Signing out..." : "Logout"}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}