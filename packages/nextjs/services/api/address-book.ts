import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth, AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import {
  AddressBook,
  CreateAddressBookDto,
  UpdateAddressBookDto,
  DeleteAddressBookDto,
  AddressBookOrderDto,
  Category,
  CategoryDto,
  CategoryShape,
} from "@/types/address-book";

// *************************************************
// **************** GET METHODS *******************
// *************************************************
const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return apiServerWithAuth.getData<Category[]>("/address-book/category");
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetAllAddressBooks = () => {
  return useQuery({
    queryKey: ["address-book", "all"],
    queryFn: async () => {
      return apiServerWithAuth.getData<AddressBook[]>(`/address-book`);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

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
        .map((name, idx) => ({
          id: idx + 1,
          name,
          addressBooks: categoryNameToBooks[name],
          shape: CategoryShape.CIRCLE, // Default shape since API doesn't provide it
          color: "#000000", // Default color since API doesn't provide it
        }));

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

// const useCheckCategoryExists = (category: string) => {
//   return useQuery({
//     queryKey: ["address-book", "check-category-exists", category],
//     queryFn: async () => {
//       return apiServerWithAuth.getData<boolean>(`/address-book/check-category-exists?category=${category}`);
//     },
//     enabled: !!category,
//   });
// };

const useGetAddressBooksByCategory = (categoryId: number | null) => {
  return useQuery({
    queryKey: ["address-book", "by-category", categoryId],
    queryFn: async () => {
      return apiServerWithAuth.getData<AddressBook[]>(`/address-book/by-category?categoryId=${categoryId}`);
    },
    enabled: categoryId !== null,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// *************************************************
// **************** POST METHODS *******************
// *************************************************

const useCreateAddressBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAddressBookDto) => {
      return apiServerWithAuth.postData<AddressBook>("/address-book", data);
    },
    onSuccess: (newAddressBook: AddressBook, variables: CreateAddressBookDto): AddressBook => {
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

      // Also invalidate categories query to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      return newAddressBook;
    },
  });
};

const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryDto) => {
      return apiServerWithAuth.postData<Category>("/address-book/category", data);
    },
    onSuccess: (newCategory: Category) => {
      queryClient.setQueryData(["categories"], (oldData: Category[] | undefined) => {
        if (!oldData) return [newCategory];
        return [...oldData, newCategory];
      });
    },
  });
};

const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryIds: number[]) => {
      return apiServerWithAuth.patchData<Category[]>("/address-book/category/update-order", {
        categoryIds,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch with updated order
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["address-book"] });
    },
  });
};

const useUpdateAddressBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAddressBookDto }) => {
      return apiServerWithAuth.patchData<AddressBook>(`/address-book/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["address-book"] });
      queryClient.invalidateQueries({ queryKey: ["address-book-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

const useDeleteAddressBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeleteAddressBookDto) => {
      return apiServerWithAuth.deleteData("/address-book", data);
    },
    onSuccess: () => {
      // Invalidate queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["address-book"] });
      queryClient.invalidateQueries({ queryKey: ["address-book-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

const useUpdateAddressBookOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddressBookOrderDto) => {
      return apiServerWithAuth.patchData("/address-book/update-order", data);
    },
    onSuccess: () => {
      // Invalidate queries to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["address-book"] });
      queryClient.invalidateQueries({ queryKey: ["address-book-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export {
  useGetAddressBooks,
  useGetAllAddressBooks,
  useCreateAddressBook,
  useUpdateAddressBook,
  useDeleteAddressBook,
  useUpdateAddressBookOrder,
  useCheckNameDuplicate,
  useCreateCategory,
  useGetCategories,
  useUpdateCategoryOrder,
  useGetAddressBooksByCategory,
};
