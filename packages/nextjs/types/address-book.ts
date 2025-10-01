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
  token?: string;
  category?: Category;
}

export interface AddressBookDto {
  category: string;
  name: string;
  address: string;
  email?: string;
  token: AssetWithMetadata;
}

export interface CategoryDto {
  name: string;
  shape: CategoryShape;
  color: string;
}
