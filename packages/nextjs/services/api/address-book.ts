import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import { AddressBook, AddressBookDto } from "@/types/address-book";

// *************************************************
// **************** API CLIENT SETUP ***************
// *************************************************

const apiClient = new AuthenticatedApiClient(
  process.env.NEXT_PUBLIC_SERVER_URL || "",
  () => {
    const auth = AuthStorage.getAuth();
    return auth?.sessionToken || null;
  },
  async () => {
    // TODO: Implement token refresh logic
    // For now, just clear auth and redirect to login
  },
  () => {},
);

// *************************************************
// **************** GET METHODS *******************
// *************************************************

const useGetAddressBooks = () => {
  return useQuery({
    queryKey: ["address-book"],
    queryFn: async () => {
      return apiClient.getData<AddressBook[]>(`/address-book`);
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useCheckNameDuplicate = (name: string, category: string) => {
  return useQuery({
    queryKey: ["address-book", "check-name-duplicate", name, category],
    queryFn: async () => {
      return apiClient.getData(`/address-book/check-name-duplicate?name=${name}&category=${category}`);
    },
    enabled: !!name && !!category,
  });
};

const useCheckCategoryExists = (category: string) => {
  return useQuery({
    queryKey: ["address-book", "check-category-exists", category],
    queryFn: async () => {
      return apiClient.getData<boolean>(`/address-book/check-category-exists?category=${category}`);
    },
    enabled: !!category,
  });
};

// *************************************************
// **************** POST METHODS *******************
// *************************************************

const useCreateAddressBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddressBookDto) => {
      return apiClient.postData<AddressBook>("/address-book", data);
    },
    onSuccess: (newAddressBook: AddressBook): AddressBook => {
      queryClient.setQueryData(["address-book"], (oldData: AddressBook[] | undefined) => {
        if (!oldData) return [newAddressBook];
        return [...oldData, newAddressBook];
      });

      return newAddressBook;
    },
  });
};

export { useGetAddressBooks, useCreateAddressBook, useCheckNameDuplicate, useCheckCategoryExists };
