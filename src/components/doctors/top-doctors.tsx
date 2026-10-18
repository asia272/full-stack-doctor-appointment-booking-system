import { DoctorsGrid } from "./doctors-grid";

/** Drop <TopDoctors /> into your home page. */
export function TopDoctors() {
    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-6 text-[#1F2937] sm:px-6">
            <h2 className="text-3xl font-medium">Top Doctors to Book</h2>
            <p className="mb-4 text-center text-sm">
                Simply browse through our extensive list of trusted doctors.
            </p>
            <DoctorsGrid />
        </section>
    );
}
