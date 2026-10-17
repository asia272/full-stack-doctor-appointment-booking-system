"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
    type ChangeEvent,
} from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, LoaderCircle, User } from "lucide-react";

import {
    getDoctorPhotoUploadUrlAction,
    updateDoctorProfileAction,
} from "@/app/actions/doctor-profile";
import type { DoctorProfile } from "@/types/doctor-profile";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type FormState = {
    about: string;
    address: string;
    fee: string;
    experience: string;
    isActive: boolean;
};

function toForm(profile: DoctorProfile): FormState {
    return {
        about: profile.about,
        address: profile.address,
        fee: String(profile.consultationFee),
        experience:
            profile.experienceYears === null
                ? ""
                : String(profile.experienceYears),
        isActive: profile.isActive,
    };
}

// Same look as your global input style (the global rule doesn't cover textarea).
const textareaClass =
    "min-h-32 w-full rounded-[5px] border border-[#dadada] bg-white px-4 py-2.5 text-base text-[#4B5563] outline-none focus:border-black disabled:opacity-50";

export default function DoctorProfileView({
    profile,
}: {
    profile: DoctorProfile;
}) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<FormState>(() => toForm(profile));
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local preview of the newly chosen photo (not uploaded until Save).
    const previewUrl = useMemo(
        () => (photoFile ? URL.createObjectURL(photoFile) : null),
        [photoFile],
    );

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    function startEdit() {
        setForm(toForm(profile));
        setPhotoFile(null);
        setEditing(true);
    }

    function cancelEdit() {
        setForm(toForm(profile));
        setPhotoFile(null);
        setEditing(false);
    }

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // Lets the same file be picked again later.
        event.target.value = "";

        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Photo must be a JPG, PNG or WebP image.");
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            toast.error("Photo must be 5 MB or smaller.");
            return;
        }

        setPhotoFile(file);
    }

    function handleSave() {
        const fee = Number(form.fee);
        const experience =
            form.experience.trim() === "" ? undefined : Number(form.experience);

        if (form.fee.trim() === "" || !Number.isFinite(fee) || fee < 0) {
            toast.error("Enter a valid appointment fee.");
            return;
        }

        if (
            experience !== undefined &&
            (!Number.isInteger(experience) || experience < 0 || experience > 80)
        ) {
            toast.error("Experience must be a whole number from 0 to 80.");
            return;
        }

        startTransition(async () => {
            try {
                let imageStorageId: string | undefined;

                if (photoFile) {
                    const urlResult = await getDoctorPhotoUploadUrlAction();

                    if (!urlResult.success) {
                        toast.error(urlResult.message);
                        return;
                    }

                    const upload = await fetch(urlResult.url, {
                        method: "POST",
                        headers: { "Content-Type": photoFile.type },
                        body: photoFile,
                    });

                    if (!upload.ok) {
                        throw new Error("Photo upload failed. Please try again.");
                    }

                    const uploaded = (await upload.json()) as {
                        storageId?: string;
                    };

                    if (!uploaded.storageId) {
                        throw new Error("Photo upload failed. Please try again.");
                    }

                    imageStorageId = uploaded.storageId;
                }

                const result = await updateDoctorProfileAction({
                    about: form.about,
                    address: form.address,
                    consultationFee: fee,
                    experienceYears: experience,
                    isActive: form.isActive,
                    imageStorageId,
                });

                if (result.success) {
                    toast.success(result.message);
                    setPhotoFile(null);
                    setEditing(false);
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again.",
                );
            }
        });
    }

    const shownActive = editing ? form.isActive : profile.isActive;

    return (
        <div className="max-w-5xl space-y-6">
            {/* Photo */}
            <div className="space-y-3">
                <div className="relative aspect-square w-full max-w-[226px] overflow-hidden rounded-xl bg-[#EAEFFF] sm:max-w-[260px] lg:max-w-[300px]">
                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={previewUrl}
                            alt="New profile photo preview"
                            className="size-full object-cover object-top"
                        />
                    ) : profile.imageUrl ? (
                        <Image
                            src={profile.imageUrl}
                            alt={profile.fullName}
                            fill
                            priority
                            sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 226px"
                            className="object-cover object-top"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <User
                                className="size-16 text-muted-foreground/50"
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>

                {editing && (
                    <div className="space-y-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoChange}
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden="true"
                        />

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => fileInputRef.current?.click()}
                                className="h-10 rounded-full px-5"
                            >
                                <Camera className="mr-2 size-4" />
                                Change photo
                            </Button>

                            {photoFile && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={isPending}
                                    onClick={() => setPhotoFile(null)}
                                    className="h-10 rounded-full px-5"
                                >
                                    Undo
                                </Button>
                            )}
                        </div>

                        <p className="text-xs text-[#6B7280]">
                            JPG, PNG or WebP, up to 5 MB. The photo is saved when
                            you click Save.
                        </p>
                    </div>
                )}
            </div>

            {/* Details card */}
            <section className="rounded-xl border border-[#C9D8FF] bg-background p-5 font-['Outfit',sans-serif] sm:p-8">
                <h1 className="text-2xl font-medium leading-tight text-[#1F2937] sm:text-3xl">
                    Dr. {profile.fullName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-base text-[#4B5563] sm:text-lg">
                    <span>
                        {profile.degree} - {profile.specialty}
                    </span>

                    {editing ? (
                        <span className="flex items-center gap-2 text-sm">
                            <span className="w-24">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    max={80}
                                    step={1}
                                    value={form.experience}
                                    disabled={isPending}
                                    onChange={(e) =>
                                        update("experience", e.target.value)
                                    }
                                    aria-label="Years of experience"
                                />
                            </span>
                            Years
                        </span>
                    ) : (
                        profile.experienceYears !== null && (
                            <span className="rounded-full border px-3 py-0.5 text-sm">
                                {profile.experienceYears}{" "}
                                {profile.experienceYears === 1 ? "Year" : "Years"}
                            </span>
                        )
                    )}
                </div>

                {/* About */}
                <div className="mt-6">
                    <h2 className="text-base font-medium text-[#1F2937]">
                        About :
                    </h2>

                    {editing ? (
                        <textarea
                            value={form.about}
                            disabled={isPending}
                            maxLength={3000}
                            onChange={(e) => update("about", e.target.value)}
                            aria-label="About"
                            className={`${textareaClass} mt-2`}
                        />
                    ) : (
                        <p className="mt-1 max-w-4xl whitespace-pre-line text-sm leading-6 text-[#4B5563] sm:text-base sm:leading-7">
                            {profile.about}
                        </p>
                    )}
                </div>

                {/* Fee */}
                <div className="mt-6 flex flex-wrap items-center gap-2 text-base text-[#4B5563] sm:text-lg">
                    <span>Appointment fee:</span>
                    {editing ? (
                        <span className="flex items-center gap-2">
                            <span className="font-medium text-[#1F2937]">$</span>
                            <span className="w-32">
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    value={form.fee}
                                    disabled={isPending}
                                    onChange={(e) => update("fee", e.target.value)}
                                    aria-label="Appointment fee"
                                />
                            </span>
                        </span>
                    ) : (
                        <span className="font-medium text-[#1F2937]">
                            $ {profile.consultationFee}
                        </span>
                    )}
                </div>

                {/* Address */}
                <div className="mt-4 flex flex-col gap-2 text-base text-[#4B5563] sm:flex-row sm:items-start sm:gap-4 sm:text-lg">
                    <span className="shrink-0 sm:pt-2">Address:</span>
                    {editing ? (
                        <div className="w-full max-w-md">
                            <input
                                type="text"
                                value={form.address}
                                disabled={isPending}
                                maxLength={300}
                                onChange={(e) => update("address", e.target.value)}
                                aria-label="Address"
                            />
                        </div>
                    ) : (
                        <span className="whitespace-pre-line text-[#1F2937]">
                            {profile.address}
                        </span>
                    )}
                </div>

                {/* Availability */}
                <div className="mt-6 flex items-center gap-2">
                    <Checkbox
                        id="doctor-available"
                        checked={shownActive}
                        disabled={!editing || isPending}
                        onCheckedChange={(value) =>
                            update("isActive", value === true)
                        }
                    />
                    <Label
                        htmlFor="doctor-available"
                        className="cursor-pointer text-base font-normal text-[#1F2937] sm:text-lg"
                    >
                        Available
                    </Label>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-wrap gap-3">
                    {editing ? (
                        <>
                            <Button
                                type="button"
                                disabled={isPending}
                                onClick={handleSave}
                                className="h-10 rounded-full px-8"
                            >
                                {isPending && (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={cancelEdit}
                                className="h-10 rounded-full px-8"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={startEdit}
                            className="h-10 rounded-full px-8"
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </section>
        </div>
    );
}