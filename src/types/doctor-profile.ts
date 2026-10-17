export type DoctorProfile = {
    fullName: string;
    email: string;
    imageUrl: string | null;
    specialty: string;
    degree: string;
    experienceYears: number | null;
    about: string;
    consultationFee: number;
    address: string;
    isActive: boolean;
};

export type UpdateDoctorProfileInput = {
    about: string;
    address: string;
    consultationFee: number;
    experienceYears?: number;
    isActive: boolean;
    /** Storage id returned after uploading a new photo. */
    imageStorageId?: string;
};