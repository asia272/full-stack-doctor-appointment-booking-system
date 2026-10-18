import Image from "next/image";
import Link from "next/link";

const specialities = [
    {
        name: "General physician",
        icon: "/assets/assets_frontend/General_physician.svg",
    },
    {
        name: "Gynecologist",
        icon: "/assets/assets_frontend/Gynecologist.svg",
    },
    {
        name: "Dermatologist",
        icon: "/assets/assets_frontend/Dermatologist.svg",
    },
    {
        name: "Pediatricians",
        icon: "/assets/assets_frontend/Pediatricians.svg",
    },
    {
        name: "Neurologist",
        icon: "/assets/assets_frontend/Neurologist.svg",
    },
    {
        name: "Gastroenterologist",
        icon: "/assets/assets_frontend/Gastroenterologist.svg",
    },
] as const;

export default function SpecialityMenu() {
    return (
        <section
            id="speciality"
            aria-labelledby="speciality-heading"
            className="flex flex-col items-center gap-4 py-16 text-[#262626] md:py-20"
        >
            <h2
                id="speciality-heading"
                className="text-center text-3xl font-medium text-[#1F2937]"
            >
                Find by Speciality
            </h2>

            <p className="max-w-md text-center text-sm text-[#4B5563] sm:max-w-lg">
                Simply browse through our extensive list of trusted doctors,
                schedule your appointment hassle-free.
            </p>

            <ul className="mt-10 flex w-full max-w-5xl flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-6 md:flex-nowrap md:gap-x-4">
                {specialities.map(({ name, icon }) => (
                    <li key={name}>
                        <Link
                            href={`/doctors?specialty=${encodeURIComponent(name)}`}
                            className="group flex w-24 flex-col items-center gap-3 text-center text-xs text-[#4B5563] transition-transform duration-300 hover:-translate-y-2 focus-visible:outline-none sm:w-28 sm:text-sm md:w-[120px]"
                        >
                            <Image
                                src={icon}
                                alt=""
                                width={96}
                                height={96}
                                className="size-16 rounded-full ring-primary transition-shadow group-focus-visible:ring-2 sm:size-20 md:size-24"
                            />
                            <span className="group-hover:text-primary">
                                {name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}