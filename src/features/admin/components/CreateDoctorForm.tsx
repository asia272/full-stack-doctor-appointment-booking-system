
"use client";

import { useActionState } from "react";
import {
    createDoctorAction,
    type DoctorActionState,
} from "@/app/actions/doctor";

const initialState: DoctorActionState = {
    success: false,
    message: "",
};

const fields = [
    { name: "fullName", label: "Full name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Initial password", type: "password", required: true },
    { name: "specialty", label: "Specialty", type: "text", required: true },
    { name: "degree", label: "Degree", type: "text", required: true },
    { name: "consultationFee", label: "Consultation fee", type: "number", required: true },
    { name: "experienceYears", label: "Experience (years)", type: "number", required: false },
    { name: "address", label: "Clinic address", type: "text", required: true },
] as const;

export default function CreateDoctorForm() {
    const [state, formAction, pending] = useActionState(
        createDoctorAction,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map((field) => {
                    const errors = state.fieldErrors?.[field.name];

                    return (
                        <div key={field.name} className="space-y-2">
                            <label
                                htmlFor={field.name}
                                className="block text-sm font-medium"
                            >
                                {field.label}
                            </label>

                            <input
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                required={field.required}
                                min={
                                    field.name === "consultationFee" ||
                                        field.name === "experienceYears"
                                        ? 0
                                        : undefined
                                }
                                step={
                                    field.name === "consultationFee"
                                        ? "0.01"
                                        : field.name === "experienceYears"
                                            ? "1"
                                            : undefined
                                }
                                minLength={
                                    field.name === "password" ? 12 : undefined
                                }
                                maxLength={
                                    field.name === "password"
                                        ? 128
                                        : field.name === "fullName"
                                            ? 100
                                            : undefined
                                }
                                autoComplete={
                                    field.name === "email"
                                        ? "email"
                                        : field.name === "password"
                                            ? "new-password"
                                            : field.name === "fullName"
                                                ? "name"
                                                : undefined
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />

                            {errors?.map((error) => (
                                <p
                                    key={error}
                                    className="text-sm text-red-600"
                                >
                                    {error}
                                </p>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="space-y-2">
                <label htmlFor="about" className="block text-sm font-medium">
                    Professional biography
                </label>
                <textarea
                    id="about"
                    name="about"
                    rows={4}
                    minLength={10}
                    maxLength={3000}
                    required
                    className="w-full rounded-lg border px-3 py-2"
                />
                {state.fieldErrors?.about?.map((error) => (
                    <p key={error} className="text-sm text-red-600">
                        {error}
                    </p>
                ))}
            </div>

            {state.message && (
                <p
                    role="status"
                    aria-live="polite"
                    className={
                        state.success
                            ? "text-sm text-green-700"
                            : "text-sm text-red-600"
                    }
                >
                    {state.message}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="rounded-lg border px-5 py-3 font-medium disabled:opacity-50"
            >
                {pending ? "Creating doctor..." : "Create doctor account"}
            </button>
        </form>
    );
}
