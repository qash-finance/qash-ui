export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface AddressBook {
  userAddress: string;
  category: string;
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
