
"use client";

import { useActionState, useEffect, useState } from "react";
import {
    Camera,
    LoaderCircle,
    Save,
    UserRound,
} from "lucide-react";

import {
    updatePatientProfileAction,
    type PatientProfileActionState,
} from "@/app/actions/patient-profile";

type PatientProfile = {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    imageUrl: string | null;
};

const initialState: PatientProfileActionState = {
    success: false,
    message: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#5F6FFF] focus:ring-2 focus:ring-[#5F6FFF]/15";

export default function PatientProfileForm({
    profile,
}: {
    profile: PatientProfile;
}) {
    const [state, formAction, pending] = useActionState(
        updatePatientProfileAction,
        initialState,
    );

    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!photo) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(photo);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [photo]);

    const displayedPhoto = previewUrl ?? profile.imageUrl;

    return (
        <form action={formAction} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {displayedPhoto ? (
                            // Convex Storage provides the image URL.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={displayedPhoto}
                                alt="Patient profile"
                                className="size-full object-cover"
                            />
                        ) : (
                            <UserRound className="size-10 text-slate-400" />
                        )}
                    </div>

                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Profile photo
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            JPG, PNG, or WebP. Maximum 5 MB.
                        </p>

                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Camera className="size-4" />
                            Choose photo
                            <input
                                name="photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="sr-only"
                                onChange={(event) =>
                                    setPhoto(event.target.files?.[0] ?? null)
                                }
                            />
                        </label>

                        {photo && (
                            <p className="mt-2 break-all text-xs text-slate-500">
                                Selected: {photo.name}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-slate-900">
                    Personal information
                </h2>

                <p className="mt-1 mb-6 text-sm text-slate-500">
                    Your email is linked to your account and cannot be edited here.
                </p>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Full name *
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            required
                            minLength={2}
                            maxLength={100}
                            defaultValue={profile.fullName}
                            autoComplete="name"
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={profile.email}
                            readOnly
                            className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="text-sm font-medium">
                            Phone number
                        </label>
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            maxLength={30}
                            defaultValue={profile.phoneNumber}
                            autoComplete="tel"
                            placeholder="+92 300 1234567"
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="dateOfBirth" className="text-sm font-medium">
                            Date of birth
                        </label>
                        <input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            max={new Date().toISOString().slice(0, 10)}
                            defaultValue={profile.dateOfBirth}
                            className={inputClass}
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label htmlFor="gender" className="text-sm font-medium">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            defaultValue={profile.gender}
                            className={inputClass}
                        >
                            <option value="">Select gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                            <option value="PREFER_NOT_TO_SAY">
                                Prefer not to say
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <label htmlFor="address" className="text-sm font-medium">
                            Home address
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            maxLength={500}
                            defaultValue={profile.address}
                            autoComplete="street-address"
                            placeholder="Enter your area, city, and home address"
                            className={`${inputClass} resize-y`}
                        />
                    </div>
                </div>
            </section>

            {state.message && (
                <p
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl border p-4 text-sm ${state.success
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    {state.message}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#5F6FFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4c5ce8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {pending ? "Saving..." : "Save profile"}
                </button>
            </div>
        </form>
    );
}
