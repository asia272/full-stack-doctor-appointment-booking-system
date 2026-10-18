import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    return (
        <section
            aria-labelledby="hero-heading"
            className="relative flex flex-col overflow-hidden rounded-lg bg-primary px-6 md:flex-row md:px-10 lg:px-20 mt-5"
        >
            {/* Left: text */}
            <div className="flex flex-col items-start justify-center gap-5 py-10 md:w-1/2 md:gap-6 md:py-[8vw] lg:py-[7vw]">
                <h1
                    id="hero-heading"
                    className="text-3xl font-semibold leading-tight text-white md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight"
                >
                    Book Appointment <br className="hidden sm:block" />
                    With Trusted Doctors
                </h1>

                <div className="flex flex-col items-start gap-3 text-sm font-light text-white sm:flex-row sm:items-center">
                    <Image
                        src="/assets/assets_frontend/group_profiles.png"
                        alt=""
                        width={112}
                        height={40}
                        className="h-auto w-28 shrink-0"
                    />
                    <p>
                        Simply browse through our extensive list of trusted
                        doctors, <br className="hidden sm:block" />
                        schedule your appointment hassle-free.
                    </p>
                </div>

                <Link
                    href="/doctors"
                    className="group mt-1 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm text-[#595959] transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                    Book appointment
                    <Image
                        src="/assets/assets_frontend/arrow_icon.svg"
                        alt=""
                        width={14}
                        height={14}
                        className="w-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>

            {/* Right: image */}
            <div className="relative md:w-1/2">
                <Image
                    src="/assets/assets_frontend/header_img.png"
                    alt="Three smiling doctors"
                    width={900}
                    height={700}
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-auto w-full md:absolute md:bottom-0 md:left-0"
                />
            </div>
        </section>
    );
}