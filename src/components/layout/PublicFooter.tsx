import Link from "next/link";
import Image from "next/image";

const company = [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "Contact us", href: "/contact" },
];

export default function PublicFooter() {
    return (
        <footer className="mt-20  bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr] lg:gap-14">
                    <div>
                        <Image
                            src="/assets/assets_frontend/logo.svg"
                            alt="Prescripto"
                            width={217}
                            height={46}
                            className="h-[40px] w-auto object-contain"
                        />
                        <p className="mt-6 max-w-md text-sm leading-6 text-[#4B5563]">
                            Book appointments with trusted doctors quickly and
                            easily. Browse specialists, pick a time that suits
                            you and manage your visits in one place.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium text-[#4B5563] uppercase">
                            Company
                        </h2>
                        <ul className="mt-4 space-y-2 text-sm text-[#4B5563]">
                            {company.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="transition-colors hover:text-primary"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium text-[#4B5563] uppercase">
                            Get in touch
                        </h2>
                        <ul className="mt-4 space-y-2 text-sm text-[#4B5563]">

                            <li>+92-300-0000000</li>
                            <li>example@gmail.com</li>
                        </ul>
                    </div>
                </div>

                <p className="border-t py-5 text-center border-[#BDBDBD] text-sm text-[#4B5563]">

                    Copyright  © {new Date().getFullYear()} Prescripto - All Right Reserved.
                </p>
            </div>
        </footer>
    );
}