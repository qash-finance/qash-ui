// Employee and Group related DTOs and types

export enum CategoryShapeEnum {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  DIAMOND = 'DIAMOND',
  TRIANGLE = 'TRIANGLE',
}

export interface TokenDto {
  address: string;
  symbol: string;
  // optional metadata provided by some endpoints/modals
  name?: string;
  decimals?: number;
  maxSupply?: number;
}

export interface NetworkDto {
  name: string;
  chainId: number;
}

export interface CreateCompanyGroupDto {
  name: string;
  shape: CategoryShapeEnum;
  color: string;
}

export interface CreateContactDto {
  groupId: number;
  name: string;
  walletAddress: string;
  email?: string;
  token?: TokenDto;
  network: NetworkDto;
}

export interface UpdateAddressBookDto {
  groupId?: number;
  name?: string;
  walletAddress?: string;
  email?: string;
  token?: TokenDto;
  network?: NetworkDto;
}

export interface AddressBookOrderDto {
  id: number;
  order: number;
}

export interface CompanyGroupResponseDto {
  id: number;
  name: string;
  shape: CategoryShapeEnum;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyContactResponseDto {
  id: number;
  groupId: number;
  name: string;
  walletAddress: string;
  email?: string;
  token?: TokenDto;
  network: NetworkDto;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContactsResponseDto {
  data: CompanyContactResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeStatisticsDto {
  totalContacts: number;
  totalGroups: number;
  contactsByGroup: Record<string, number>;
}
