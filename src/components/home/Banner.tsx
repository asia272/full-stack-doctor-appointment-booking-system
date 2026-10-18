import Image from "next/image";
import Link from "next/link";

export default function Banner() {
    return (
        <section
            aria-labelledby="banner-heading"
            className="relative my-16 flex rounded-lg bg-primary px-6 sm:px-10 md:my-20 md:px-14 lg:px-20"
        >
            {/* Left: text */}
            <div className="flex-1 py-10 sm:py-12 md:py-16 lg:py-24">
                <h2
                    id="banner-heading"
                    className="text-2xl font-semibold leading-snug text-white sm:text-3xl sm:leading-snug md:text-4xl md:leading-snug lg:text-5xl lg:leading-[1.45]"
                >
                    <span className="block">Book Appointment</span>
                    <span className="block">With 100+ Trusted Doctors</span>
                </h2>

                <Link
                    href="/login"
                    className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-sm text-[#4B5563] transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:mt-8 sm:text-base"
                >
                    Create account
                </Link>
            </div>

            {/* Right: image, anchored to the bottom and rising above the box */}
            <div className="relative hidden md:block md:w-[40%] lg:w-[370px]">
                <Image
                    src="/assets/assets_frontend/appointment_img.png"
                    alt="Smiling doctor pointing towards the booking button"
                    width={500}
                    height={650}
                    sizes="(min-width: 1024px) 370px, 40vw"
                    className="absolute bottom-0 right-0 h-auto w-full max-w-md"
                />
            </div>
        </section>
    );
}