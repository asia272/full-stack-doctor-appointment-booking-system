"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Menu } from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserMenu, type NavbarUser } from "./user-menu";
import Image from "next/image";

const NAV_LINKS = [
    { label: "HOME", href: "/" },
    { label: "ALL DOCTORS", href: "/doctors" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
] as const;

const CREATE_BTN =
    "h-12 rounded-full bg-[#5F6FFF] px-8 text-base font-normal text-white hover:bg-[#4f5ee6]";

function isActive(pathname: string, href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavbarClient({ user }: { user: NavbarUser | null }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    return (
        <header className="w-full bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="flex h-20 items-center justify-between border-b border-gray-400">
                    <Link href="/" aria-label="Home" className="shrink-0">
                        {/* Swap for your frontend logo if you have one */}
                        <Image
                            src="/assets/assets_frontend/logo.svg"
                            alt="Prescripto"
                            width={217}
                            height={46}
                            priority
                            className="h-[40px] w-auto object-contain sm:h-[46px]"
                        />
                    </Link>


                    {/* Desktop links */}
                    <ul className="hidden items-center gap-10 md:flex">
                        {NAV_LINKS.map((link) => {

                            const active = isActive(pathname, link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={active ? "page" : undefined}
                                        className="relative inline-block py-2 text-base font-medium tracking-wide text-gray-800 transition-colors hover:text-[#5F6FFF]"
                                    >
                                        {link.label}
                                        <span
                                            className={cn(
                                                "absolute -bottom-0.5 left-1/2 h-0.5 w-3/5 -translate-x-1/2 rounded-full bg-[#5F6FFF] transition-opacity",
                                                active ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <UserMenu user={user} />
                        ) : (
                            <Link
                                href="/register"
                                className={cn(
                                    buttonVariants(),
                                    CREATE_BTN,
                                    "hidden md:inline-flex",
                                )}
                            >
                                Create account
                            </Link>
                        )}

                        {/* Mobile menu */}
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
                                <Menu className="size-6" />
                            </SheetTrigger>

                            <SheetContent side="right" className="w-72">
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link href="/" aria-label="Home" className="shrink-0">
                                            {/* Swap for your frontend logo if you have one */}
                                            <Image
                                                src="/assets/assets_frontend/logo.svg"
                                                alt="Prescripto"
                                                width={217}
                                                height={46}
                                                priority
                                                className="h-[40px] w-auto object-contain sm:h-[46px]"
                                            />
                                        </Link>

                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex flex-col gap-1 px-4">
                                    {NAV_LINKS.map((link) => {
                                        const active = isActive(pathname, link.href);
                                        return (
                                            <SheetClose
                                                key={link.href}
                                                nativeButton={false}
                                                render={
                                                    <Link
                                                        href={link.href}
                                                        className={cn(
                                                            "rounded-md px-3 py-3 text-base font-medium",
                                                            active
                                                                ? "bg-[#5F6FFF]/10 text-[#5F6FFF]"
                                                                : "text-gray-800 hover:bg-gray-100",
                                                        )}
                                                    />
                                                }
                                            >
                                                {link.label}
                                            </SheetClose>
                                        );
                                    })}

                                    <div className="my-3 border-t" />

                                    {user ? (
                                        <>
                                            <SheetClose
                                                nativeButton={false}
                                                render={
                                                    <Link
                                                        href="/my-profile"
                                                        className="rounded-md px-3 py-3 hover:bg-gray-100"
                                                    />
                                                }
                                            >
                                                My Profile
                                            </SheetClose>

                                            <SheetClose
                                                nativeButton={false}
                                                render={
                                                    <Link
                                                        href="/my-appointments"
                                                        className="rounded-md px-3 py-3 hover:bg-gray-100"
                                                    />
                                                }
                                            >
                                                My Appointments
                                            </SheetClose>

                                            <Button
                                                variant="ghost"
                                                disabled={isPending}
                                                className="justify-start px-3 text-red-600 hover:text-red-600"
                                                onClick={() =>
                                                    startTransition(async () => {
                                                        await logoutAction();
                                                    })
                                                }
                                            >
                                                {isPending ? "Signing out..." : "Logout"}
                                            </Button>
                                        </>
                                    ) : (
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href="/register"
                                                    className={cn(
                                                        buttonVariants(),
                                                        CREATE_BTN,
                                                        "justify-center",
                                                    )}
                                                />
                                            }
                                        >
                                            Create account
                                        </SheetClose>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </nav>
            </div>
        </header>
    );
}