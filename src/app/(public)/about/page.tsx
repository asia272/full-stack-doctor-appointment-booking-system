import type { Metadata } from "next";
import Image from "next/image";

import SectionTitle from "@/components/layout/SectionTitle";

export const metadata: Metadata = {
    title: "About Us",
    description:
        "Learn about Prescripto, your trusted partner for booking doctor appointments.",
};

const reasons = [
    {
        title: "Efficiency:",
        text: "Streamlined appointment scheduling that fits into your busy lifestyle.",
    },
    {
        title: "Convenience:",
        text: "Access to a network of trusted healthcare professionals in your area.",
    },
    {
        title: "Personalization:",
        text: "Tailored recommendations and reminders to help you stay on top of your health.",
    },
] as const;

export default function AboutPage() {
    return (
        <div className="pb-4">
            <div className="pt-4 text-center sm:pt-8">
                <SectionTitle as="h1" lead="About" strong="Us" />
            </div>

            {/* Intro */}
            <section className="my-10 flex flex-col gap-8 md:flex-row md:gap-12 lg:gap-14">
                <Image
                    src="/assets/assets_frontend/about_image.png"
                    alt="Two smiling doctors in white coats"
                    width={720}
                    height={720}
                    priority
                    sizes="(min-width: 768px) 360px, 100vw"
                    className="h-auto w-full md:max-w-[360px]"
                />

                <div className="flex flex-col justify-center gap-6 text-sm leading-7 text-[#4B5563] md:w-2/4 [&>p]:capitalize">
                    <p>
                        Welcome to Prescripto, your trusted partner in managing
                        your healthcare needs conveniently and efficiently. At
                        Prescripto, we understand the challenges individuals
                        face when it comes to scheduling doctor appointments
                        and managing their health records.
                    </p>
                    <p>
                        Prescripto is committed to excellence in healthcare
                        technology. We continuously strive to enhance our
                        platform, integrating the latest advancements to
                        improve user experience and deliver superior service.
                        Whether you&apos;re booking your first appointment or
                        managing ongoing care, Prescripto is here to support
                        you every step of the way.
                    </p>
                    <h2 className="font-semibold text-[#1F2937]">Our Vision</h2>
                    <p>
                        Our vision at Prescripto is to create a seamless
                        healthcare experience for every user. We aim to bridge
                        the gap between patients and healthcare providers,
                        making it easier for you to access the care you need,
                        when you need it.
                    </p>
                </div>
            </section>

            {/* Why choose us */}
            <section aria-labelledby="why-heading" className="mb-10 mt-18">
                <SectionTitle
                    lead="Why"
                    strong="Choose Us"
                    className="text-lg sm:text-xl mb-6"
                />
                <h2 id="why-heading" className="sr-only">
                    Why choose us
                </h2>

                <ul className="mt-6 grid border border-[#ADADAD] md:grid-cols-3">
                    {reasons.map(({ title, text }) => (
                        <li
                            key={title}
                            className="flex flex-col gap-4 border-b border-[#ADADAD] px-8 py-8 text-[15px] text-[#4B5563] transition-colors duration-300 last:border-b-0 hover:bg-primary hover:text-white sm:px-12 md:border-b-0 md:border-r md:py-16 md:last:border-r-0 lg:px-14"
                        >
                            <h3 className="font-semibold uppercase text-[#1F2937]">{title}</h3>
                            <p className="leading-7 capitalize">{text}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}