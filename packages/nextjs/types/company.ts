export interface CompanyInfo {
    id: number;
    uuid?: string;
    companyName?: string;
    registrationNumber?: string;
    verificationStatus?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}  