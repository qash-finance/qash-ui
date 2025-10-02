import { AssetWithMetadata } from "./faucet";

export enum CategoryShape {
  CIRCLE = "CIRCLE",
  SQUARE = "SQUARE",
  DIAMOND = "DIAMOND",
  TRIANGLE = "TRIANGLE",
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  addressBooks?: AddressBook[];
  shape: CategoryShape;
  color: string;
}

export interface AddressBook {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  userAddress: string;
  name: string;
  address: string;
  email?: string;
  token?: AssetWithMetadata;
  category?: Category;
  categories?: {
    id: number;
    createdAt: string;
    updatedAt: string;
    name: string;
    shape: string;
    color: string;
    order: number;
    ownerAddress: string;
  };
  categoryId?: number;
  order?: number;
}

export interface CreateAddressBookDto {
  category: string;
  name: string;
  address: string;
  email?: string;
  token: AssetWithMetadata;
}

export interface UpdateAddressBookDto {
  categoryId: number;
  name?: string;
  address?: string;
  email?: string;
  token?: AssetWithMetadata;
}

export interface DeleteAddressBookDto {
  ids: number[];
}

export interface AddressBookOrderDto {
  categoryId: number;
  entryIds: number[];
}

export interface CategoryDto {
  name: string;
  shape: CategoryShape;
  color: string;
}
