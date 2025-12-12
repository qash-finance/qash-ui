import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth, AuthenticatedApiClient } from "./index";

// *************************************************
// **************** TYPES **************************
// *************************************************

export enum CompanyTypeEnum {
  CORPORATION = "CORPORATION",
  LLC = "LLC",
  PARTNERSHIP = "PARTNERSHIP",
  SOLE_PROPRIETORSHIP = "SOLE_PROPRIETORSHIP",
  OTHER = "OTHER",
}

export enum CompanyVerificationStatusEnum {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface Company {
  uuid: string;
  id: number;
  companyName: string;
  registrationNumber: string;
  companyType: CompanyTypeEnum;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  verificationStatus: CompanyVerificationStatusEnum;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export interface CreateCompanyDto {
  companyOwnerFirstName: string;
  companyOwnerLastName: string;
  companyName: string;
  registrationNumber: string;
  companyType: CompanyTypeEnum;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  metadata?: any;
}

export interface UpdateCompanyDto {
  companyName?: string;
  companyType?: CompanyTypeEnum;
  notificationEmail?: string;
  country?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postalCode?: string;
  metadata?: any;
}

// *************************************************
// **************** API CLIENT SETUP ***************
// *************************************************

import { AuthStorage } from "../auth/storage";
// *************************************************
// **************** GET METHODS *******************
// *************************************************

export function useGetMyCompany(options?: { enabled?: boolean }) {
  return useQuery<Company>({
    queryKey: ["company", "my"],
    queryFn: async () => {
      return apiServerWithAuth.getData<Company>("/companies");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: options?.enabled !== false, // Default to true
  });
}

// *************************************************
// **************** POST METHODS ******************
// *************************************************

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, CreateCompanyDto>({
    mutationFn: async (data: CreateCompanyDto) => {
      return apiServerWithAuth.postData<Company>("/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

// *************************************************
// **************** PUT METHODS ********************
// *************************************************

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, UpdateCompanyDto>({
    mutationFn: async (data: UpdateCompanyDto) => {
      return apiServerWithAuth.putData<Company>("/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

