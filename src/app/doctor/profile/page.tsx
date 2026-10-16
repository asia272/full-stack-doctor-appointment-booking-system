import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function DoctorProfilePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
    );
}