import type { Metadata } from "next";
import Image from "next/image";

import SectionTitle from "@/components/layout/SectionTitle";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with the Prescripto team.",
};

// Replace these with your real details.
const CONTACT = {
    addressLines: ["54709 Willms Station", "Suite 350, Washington, USA"],
    phone: "(92) 000000000",
    email: "example@gmail.com",
} as const;

export default function ContactPage() {
    return (
        <div className="pb-4">
            <div className="pt-4 text-center sm:pt-8">
                <SectionTitle as="h1" lead="Contact" strong="Us" />
            </div>

            <section className="my-10 mb-20 flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-10">
                <Image
                    src="/assets/assets_frontend/contact_image.png"
                    alt="Doctor giving a vaccination to a child"
                    width={720}
                    height={720}
                    priority
                    sizes="(min-width: 768px) 360px, 100vw"
                    className="h-auto w-full md:max-w-[360px]"
                />

                <div className="flex flex-col items-start justify-center gap-6 text-sm text-[#4B5563]">
                    <h2 className="text-lg font-semibold uppercase">
                        Our Office
                    </h2>

                    <address className="space-y-1 not-italic leading-6">
                        {CONTACT.addressLines.map((line) => (
                            <p key={line}>{line}</p>
                        ))}
                        <p className="pt-4">Tel: {CONTACT.phone}</p>
                        <p>
                            Email:{" "}
                            <a
                                href={`mailto:${CONTACT.email}`}
                                className="transition-colors hover:text-primary"
                            >
                                {CONTACT.email}
                            </a>
                        </p>
                    </address>

                    <h2 className="mt-2 text-lg font-semibold uppercase">
                        Careers at Prescripto
                    </h2>
                    <p>Learn more about our teams and job openings.</p>

                    <a
                        href={`mailto:${CONTACT.email}?subject=Careers%20at%20Prescripto`}
                        className="border border-[#1F2937] px-8 py-4 text-sm text-[#1F2937] transition-colors duration-300 hover:bg-[#1F2937] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                        Explore Jobs
                    </a>
                </div>
            </section>
        </div>
    );
}