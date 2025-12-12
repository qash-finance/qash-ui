import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import {
  CompanyGroupResponseDto,
  CompanyContactResponseDto,
  CreateCompanyGroupDto,
  CreateContactDto,
  UpdateAddressBookDto,
  AddressBookOrderDto,
  PaginatedContactsResponseDto,
  EmployeeStatisticsDto,
} from "@/types/employee";

// *************************************************
// **************** GET METHODS *******************
// *************************************************

const useGetAllEmployees = (page: number = 1, limit: number = 10, options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? false;
  return useQuery({
    queryKey: ["employees", "all", page, limit],
    queryFn: async () => {
      return apiServerWithAuth.getData<PaginatedContactsResponseDto>(
        `/employees?page=${page}&limit=${limit}`
      );
    },
    enabled,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetAllEmployeeGroups = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? false;
  return useQuery({
    queryKey: ["employees", "groups"],
    queryFn: async () => {
      return apiServerWithAuth.getData<CompanyGroupResponseDto[]>(
        `/employees/groups`
      );
    },
    enabled,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useSearchEmployees = (
  searchTerm: string,
  groupId?: number,
  page: number = 1,
  limit: number = 20
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("search", searchTerm);
  if (groupId) queryParams.append("groupId", groupId.toString());
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  return useQuery({
    queryKey: ["employees", "search", searchTerm, groupId, page, limit],
    queryFn: async () => {
      return apiServerWithAuth.getData<PaginatedContactsResponseDto>(
        `/employees/search?${queryParams.toString()}`
      );
    },
    enabled: searchTerm.length >= 2,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetEmployeesByGroup = (
  groupId: number,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ["employees", "group", groupId, page, limit],
    queryFn: async () => {
      return apiServerWithAuth.getData<PaginatedContactsResponseDto>(
        `/employees/group/${groupId}?page=${page}&limit=${limit}`
      );
    },
    enabled: !!groupId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetEmployeeStatistics = () => {
  return useQuery({
    queryKey: ["employees", "stats"],
    queryFn: async () => {
      return apiServerWithAuth.getData<EmployeeStatisticsDto>(
        `/employees/stats`
      );
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetEmployeeById = (id: number) => {
  return useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      return apiServerWithAuth.getData<CompanyContactResponseDto>(
        `/employees/${id}`
      );
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useCheckEmployeeNameDuplicate = (name: string, groupId: number) => {
  return useQuery({
    queryKey: ["employees", "validate", "name", name, groupId],
    queryFn: async () => {
      return apiServerWithAuth.getData<{ isDuplicate: boolean }>(
        `/employees/validate/name-duplicate?name=${encodeURIComponent(name)}&groupId=${groupId}`
      );
    },
    enabled: !!name && !!groupId,
  });
};

const useCheckEmployeeAddressDuplicate = (address: string, groupId: number) => {
  return useQuery({
    queryKey: ["employees", "validate", "address", address, groupId],
    queryFn: async () => {
      return apiServerWithAuth.getData<{ isDuplicate: boolean }>(
        `/employees/validate/address-duplicate?address=${encodeURIComponent(address)}&groupId=${groupId}`
      );
    },
    enabled: !!address && !!groupId,
  });
};

const useCheckEmployeeGroupExists = (groupName: string) => {
  return useQuery({
    queryKey: ["employees", "validate", "group", groupName],
    queryFn: async () => {
      return apiServerWithAuth.getData<{ exists: boolean }>(
        `/employees/validate/group-exists?groupName=${encodeURIComponent(groupName)}`
      );
    },
    enabled: !!groupName,
  });
};

// *************************************************
// *************** MUTATION METHODS ****************
// *************************************************

const useCreateEmployeeGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateCompanyGroupDto) => {
      return apiServerWithAuth.postData<CompanyGroupResponseDto>(
        `/employees/group`,
        dto
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "groups"] });
    },
  });
};

const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateContactDto) => {
      return apiServerWithAuth.postData<CompanyContactResponseDto>(
        `/employees/employee`,
        dto
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

const useUpdateEmployee = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateAddressBookDto) => {
      return apiServerWithAuth.putData<CompanyContactResponseDto>(
        `/employees/${id}`,
        dto
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

const useUpdateEmployeesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderUpdates: AddressBookOrderDto[]) => {
      return apiServerWithAuth.putData<{
        message: string;
        updatedCount: number;
      }>(`/employees/order/bulk`, orderUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

const useDeleteEmployee = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiServerWithAuth.deleteData<{ message: string }>(
        `/employees/${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

const useBulkDeleteEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      return apiServerWithAuth.deleteData<{
        message: string;
        deletedCount: number;
      }>(`/employees/bulk`, { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

// *************************************************
// ************** EXPORT ALL HOOKS *****************
// *************************************************

export {
  useGetAllEmployees,
  useGetAllEmployeeGroups,
  useSearchEmployees,
  useGetEmployeesByGroup,
  useGetEmployeeStatistics,
  useGetEmployeeById,
  useCheckEmployeeNameDuplicate,
  useCheckEmployeeAddressDuplicate,
  useCheckEmployeeGroupExists,
  useCreateEmployeeGroup,
  useCreateEmployee,
  useUpdateEmployee,
  useUpdateEmployeesOrder,
  useDeleteEmployee,
  useBulkDeleteEmployees,
};
