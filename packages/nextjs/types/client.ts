// *************************************************
// **************** TYPES **************************
// *************************************************

export interface CreateClientDto {
  email: string;
  companyName: string;
  companyType?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  taxId?: string;
  postalCode?: string;
  registrationNumber?: string;
}

export interface UpdateClientDto {
  email?: string;
  companyName?: string;
  companyType?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  taxId?: string;
  postalCode?: string;
  registrationNumber?: string;
}

export interface ClientResponseDto {
  id: number;
  uuid: string;
  email: string;
  companyName: string;
  companyType?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address1?: string | null;
  address2?: string | null;
  taxId?: string | null;
  postalCode?: string | null;
  registrationNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedClientsResponseDto {
  data: ClientResponseDto[];
  pagination: PaginationMetaDto;
}

export interface ClientQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}