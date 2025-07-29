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
  userAddress: string;
  name: string;
  address: string;
  token?: string;
}

export interface AddressBookDto {
  category: string;
  name: string;
  address: string;
  token?: string;
}
