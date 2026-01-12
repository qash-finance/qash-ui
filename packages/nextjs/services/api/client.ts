import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import { ClientQueryParams, ClientResponseDto, CreateClientDto, PaginatedClientsResponseDto, UpdateClientDto } from "@/types/client";

// *************************************************
// **************** GET METHODS ********************
// *************************************************

export function useGetClients(params?: ClientQueryParams, options?: { enabled?: boolean }) {
  return useQuery<PaginatedClientsResponseDto>({
    queryKey: ["clients", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append("search", params.search);
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `/clients?${queryString}` : "/clients";
      
      return apiServerWithAuth.getData<PaginatedClientsResponseDto>(endpoint);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: options?.enabled !== false,
  });
}

export function useGetClientById(uuid: string, options?: { enabled?: boolean }) {
  return useQuery<ClientResponseDto>({
    queryKey: ["clients", uuid],
    queryFn: async () => {
      return apiServerWithAuth.getData<ClientResponseDto>(`/clients/${uuid}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: options?.enabled !== false && !!uuid,
  });
}

// *************************************************
// **************** POST METHODS *******************
// *************************************************

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation<ClientResponseDto, Error, CreateClientDto>({
    mutationFn: async (data: CreateClientDto) => {
      return apiServerWithAuth.postData<ClientResponseDto>("/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

// *************************************************
// **************** PUT METHODS ********************
// *************************************************

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation<ClientResponseDto, Error, { uuid: string; data: UpdateClientDto }>({
    mutationFn: async ({ uuid, data }) => {
      return apiServerWithAuth.putData<ClientResponseDto>(`/clients/${uuid}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.uuid] });
    },
  });
}

// *************************************************
// **************** DELETE METHODS *****************
// *************************************************

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (uuid: string) => {
      return apiServerWithAuth.deleteData<void>(`/clients/${uuid}`);
    },
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.removeQueries({ queryKey: ["clients", uuid] });
    },
  });
}