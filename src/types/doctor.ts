export type PublicDoctor = {
    id: string;
    fullName: string;
    specialty: string;
    degree: string;
    experienceYears: number | null;
    about: string;
    consultationFee: number;
    address: string;
    imageUrl: string | null;
    isAvailable: boolean;
};