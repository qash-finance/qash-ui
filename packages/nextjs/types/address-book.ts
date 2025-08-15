export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  addressBooks?: AddressBook[];
}

export interface AddressBook {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  userAddress: string;
  name: string;
  address: string;
  token?: string;
  category?: Category;
}

export interface AddressBookDto {
  category: string;
  name: string;
  address: string;
  token?: string;
}
