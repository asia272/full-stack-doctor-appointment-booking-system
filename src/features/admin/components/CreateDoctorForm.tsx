
"use client";

import {
    useActionState,
    useEffect,
    useRef,
    useState,
    useTransition,
    type ChangeEvent,
    type FormEvent,
    type ReactNode,
} from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { LoaderCircle, User, X } from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import {
    createDoctorAction,
    type DoctorActionState,
} from "@/app/actions/doctor";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: DoctorActionState = { success: false, message: "" };

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SPECIALTIES = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist",
] as const;

const EXPERIENCE_OPTIONS = [
    ...Array.from({ length: 10 }, (_, i) => i + 1),
    15,
    20,
    25,
    30,
];

export default function CreateDoctorForm() {
    const [state, formAction, pending] = useActionState(
        createDoctorAction,
        initialState,
    );
    const [, startTransition] = useTransition();

    const generateUploadUrl = useMutation(api.staff.generateUploadUrl);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formKey, setFormKey] = useState(0);

    const busy = pending || isUploading;

    // Revoke object URLs when they change or on unmount.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Reset the whole form after a successful creation.
    useEffect(() => {
        if (state.success) {
            toast.success(state.message || "Doctor created successfully.");
            setSelectedImage(null);
            setPreviewUrl(null);
            setImageError(null);
            setFormKey((key) => key + 1);
        }
    }, [state]);

    function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setImageError(null);

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setImageError("Choose a JPG, PNG, or WebP image.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setImageError("The image must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    function removeImage() {
        setSelectedImage(null);
        setPreviewUrl(null);
        setImageError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function uploadImage(file: File): Promise<string> {
        const uploadUrl = await generateUploadUrl();

        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!response.ok) throw new Error("Image upload failed.");

        const result: unknown = await response.json();

        if (
            typeof result !== "object" ||
            result === null ||
            !("storageId" in result) ||
            typeof result.storageId !== "string"
        ) {
            throw new Error("Convex did not return a valid image storage ID.");
        }

        return result.storageId;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        if (imageError) {
            toast.error("Please fix the image upload field.");
            return;
        }

        const formData = new FormData(event.currentTarget);

        // Never send the raw file through the server action (body size limit).
        formData.delete("doctorImage");

        // Merge the two address lines into the single `address` field
        // that your existing server action expects.
        const line1 = String(formData.get("addressLine1") ?? "").trim();
        const line2 = String(formData.get("addressLine2") ?? "").trim();
        formData.delete("addressLine1");
        formData.delete("addressLine2");
        formData.set("address", [line1, line2].filter(Boolean).join(", "));

        try {
            if (selectedImage) {
                setIsUploading(true);
                formData.set("imageStorageId", await uploadImage(selectedImage));
            } else {
                formData.delete("imageStorageId");
            }

            startTransition(() => {
                formAction(formData);
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to upload the doctor image.",
            );
        } finally {
            setIsUploading(false);
        }
    }

    const errors = state.fieldErrors;

    return (
        <Card className="w-full max-w-5xl rounded-[5px] border-[#D8D8D8]">
            <CardContent className="p-6 sm:p-8">
                <form
                    key={formKey}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    {/* Photo */}
                    <div className="flex items-center gap-4">
                        <input
                            ref={fileInputRef}
                            id="doctorImage"
                            name="doctorImage"
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            onChange={handleImageChange}
                            disabled={busy}
                            className="sr-only"
                        />

                        <label
                            htmlFor="doctorImage"
                            className="relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-muted transition-colors hover:bg-muted/70"
                        >
                            {previewUrl ? (
                                <Image
                                    src={previewUrl}
                                    alt="Doctor profile preview"
                                    fill
                                    unoptimized
                                    sizes="80px"
                                    className="object-cover"
                                />
                            ) : (
                                <User className="size-7 text-muted-foreground" />
                            )}
                        </label>

                        <div className="space-y-1">
                            <label
                                htmlFor="doctorImage"
                                className="cursor-pointer"
                            >
                                Upload doctor picture
                            </label>

                            <p className="text-xs text-muted-foreground">
                                JPG, PNG or WebP · max 5 MB
                            </p>

                            {selectedImage && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-2 h-7 px-2 text-xs"
                                    onClick={removeImage}
                                    disabled={busy}
                                >
                                    <X className="mr-1 size-3" />
                                    Remove
                                </Button>
                            )}

                            {imageError && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {imageError}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Two columns */}
                    <div className="grid gap-x-10 gap-y-5 lg:grid-cols-2">
                        <div className="space-y-5">
                            <Field
                                name="fullName"
                                label="Your name"
                                placeholder="Name"
                                autoComplete="name"
                                maxLength={100}
                                errors={errors?.fullName}
                                disabled={busy}
                            />

                            <Field
                                name="email"
                                label="Doctor email"
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
                                errors={errors?.email}
                                disabled={busy}
                            />

                            <Field
                                name="password"
                                label="Set password"
                                type="password"
                                placeholder="At least 12 characters"
                                autoComplete="new-password"
                                minLength={12}
                                maxLength={128}
                                errors={errors?.password}
                                disabled={busy}
                            />

                            <FieldShell
                                id="doctor-experienceYears"
                                label="Experience"
                                errors={errors?.experienceYears}
                            >
                                <Select
                                    name="experienceYears"
                                    defaultValue="1"
                                    disabled={busy}
                                >
                                    <SelectTrigger
                                        id="doctor-experienceYears"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {EXPERIENCE_OPTIONS.map((years) => (
                                            <SelectItem
                                                key={years}
                                                value={String(years)}
                                            >
                                                {years}{" "}
                                                {years === 1 ? "Year" : "Years"}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldShell>

                            <Field
                                name="consultationFee"
                                label="Fees (PKR)"
                                type="number"
                                placeholder="Doctor fees"
                                min="0.01"
                                step="0.01"
                                errors={errors?.consultationFee}
                                disabled={busy}
                            />
                        </div>

                        <div className="space-y-5">
                            <FieldShell
                                id="doctor-specialty"
                                label="Speciality"
                                errors={errors?.specialty}
                            >
                                <Select
                                    name="specialty"
                                    defaultValue={SPECIALTIES[0]}
                                    disabled={busy}
                                >
                                    <SelectTrigger
                                        id="doctor-specialty"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {SPECIALTIES.map((specialty) => (
                                            <SelectItem
                                                key={specialty}
                                                value={specialty}
                                            >
                                                {specialty}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldShell>

                            <Field
                                name="degree"
                                label="Degree"
                                placeholder="MBBS, FCPS"
                                errors={errors?.degree}
                                disabled={busy}
                            />

                            <div className="space-y-2">
                                <Field
                                    name="addressLine1"
                                    label="Address"
                                    placeholder="Address 1"
                                    errors={errors?.address}
                                    disabled={busy}
                                />

                                <input
                                    id="addressLine2"
                                    name="addressLine2"
                                    placeholder="Address 2"
                                    aria-label="Address line 2"
                                    disabled={busy}
                                />
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="space-y-2">
                        <Label htmlFor="about">About doctor</Label>

                        <Textarea
                            id="about"
                            name="about"
                            placeholder="Write about the doctor's expertise, qualifications, and approach to patient care."
                            rows={5}
                            minLength={10}
                            maxLength={3000}
                            required
                            disabled={busy}
                            aria-invalid={Boolean(errors?.about?.length)}
                            className="doctor-form-textarea"
                        />
                        {errors?.about?.map((error) => (
                            <p
                                key={error}
                                className="text-sm text-destructive"
                            >
                                {error}
                            </p>
                        ))}
                    </div>

                    {state.message && !state.success && (
                        <p
                            role="alert"
                            className="text-sm text-destructive"
                        >
                            {state.message}
                        </p>
                    )}
                    <Button
                        type="submit"
                        disabled={busy}
                        className="min-w-40 h-[54px] rounded-[47px] text-[18px]"
                    >
                        {busy ? (
                            <>
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                                {isUploading ? "Uploading..." : "Saving..."}
                            </>
                        ) : (
                            "Add doctor"
                        )}
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}

/* ---------- helpers ---------- */

function FieldShell({
    id,
    label,
    errors,
    children,
}: {
    id: string;
    label: string;
    errors?: string[];
    children: ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-2">
            <Label htmlFor={id}>{label}</Label>

            {children}

            {errors?.length ? (
                <ul id={`${id}-errors`} className="space-y-1">
                    {errors.map((error) => (
                        <li
                            key={error}
                            className="text-sm text-destructive"
                        >
                            {error}
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

type FieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
    name: string;
    label: string;
    errors?: string[];
};

function Field({ name, label, errors, ...inputProps }: FieldProps) {
    const id = `doctor-${name}`;

    return (
        <FieldShell id={id} label={label} errors={errors}>
            <Input
                id={id}
                name={name}
                required
                aria-invalid={Boolean(errors?.length)}
                aria-describedby={errors?.length ? `${id}-errors` : undefined}
                {...inputProps}
            />
        </FieldShell>
    );
}
