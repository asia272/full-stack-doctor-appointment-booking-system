
import type { Metadata } from "next";

import StaffLoginForm from "@/features/auth/components/StaffLoginForm";

export const metadata: Metadata = {
    title: "Staff Login",
    description: "Sign in to the doctor appointment system staff portal.",
};

export default function StaffLoginPage() {
    return <StaffLoginForm />;
}
