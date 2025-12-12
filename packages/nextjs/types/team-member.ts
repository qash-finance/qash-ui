import { CompanyInfo } from "./company";

export interface TeamMembership {
    id: number;
    uuid: string;
    firstName: string;
    lastName: string;
    position?: string | null;
    profilePicture?: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    companyId: number;
    joinedAt?: Date | null;
    company?: CompanyInfo;
  }