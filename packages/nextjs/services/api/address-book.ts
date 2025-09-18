import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth, AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import { AddressBook, AddressBookDto, Category } from "@/types/address-book";

// *************************************************
// **************** GET METHODS *******************
// *************************************************

const useGetAddressBooks = () => {
  return useQuery({
    queryKey: ["address-book"],
    queryFn: async () => {
      // API returns AddressBook items with `categories` field; normalize to Category[]
      type AddressBookApi = AddressBook & {
        categories?: { id?: number; name?: string } | null;
        categoryId?: number | null;
      };

      const list = await apiServerWithAuth.getData<AddressBookApi[]>(`/address-book`);

      const categoryNameToBooks: Record<string, AddressBook[]> = {};
      for (const item of list) {
        const categoryName: string = item?.categories?.name || "Uncategorized";
        if (!categoryNameToBooks[categoryName]) categoryNameToBooks[categoryName] = [];

        categoryNameToBooks[categoryName].push({
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          userAddress: item.userAddress,
          name: item.name,
          address: item.address,
          token: item.token ?? undefined,
        });
      }

      const categories: Category[] = Object.keys(categoryNameToBooks)
        .sort()
        .map((name, idx) => ({ id: idx + 1, name, addressBooks: categoryNameToBooks[name] }));

      return categories;
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
      return apiServerWithAuth.getData(`/address-book/check-name-duplicate?name=${name}&category=${category}`);
    },
    enabled: !!name && !!category,
  });
};

const useCheckCategoryExists = (category: string) => {
  return useQuery({
    queryKey: ["address-book", "check-category-exists", category],
    queryFn: async () => {
      return apiServerWithAuth.getData<boolean>(`/address-book/check-category-exists?category=${category}`);
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
      return apiServerWithAuth.postData<AddressBook>("/address-book", data);
    },
    onSuccess: (newAddressBook: AddressBook, variables: AddressBookDto): AddressBook => {
      queryClient.setQueryData(["address-book"], (oldData: Category[] | undefined) => {
        if (!oldData) return [{ id: 1, name: variables.category, addressBooks: [newAddressBook] }];

        // Find if category already exists
        const existingCategoryIndex = oldData.findIndex(cat => cat.name === variables.category);

        if (existingCategoryIndex !== -1) {
          // Add to existing category
          const updatedData = [...oldData];
          updatedData[existingCategoryIndex] = {
            ...updatedData[existingCategoryIndex],
            addressBooks: [...(updatedData[existingCategoryIndex].addressBooks || []), newAddressBook],
          };
          return updatedData;
        } else {
          // Create new category
          return [...oldData, { id: oldData.length + 1, name: variables.category, addressBooks: [newAddressBook] }];
        }
      });

      return newAddressBook;
    },
  });
};

export { useGetAddressBooks, useCreateAddressBook, useCheckNameDuplicate, useCheckCategoryExists };
