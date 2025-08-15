import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import { CreateRequestPaymentDto, RequestPayment } from "@/types/request-payment";

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

interface RequestPaymentResponse {
  pending: RequestPayment[];
  accepted: RequestPayment[];
}

const useGetRequests = () => {
  return useQuery({
    queryKey: ["request-payment"],
    queryFn: async () => {
      return apiClient.getData<RequestPaymentResponse>(`/request-payment`);
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// *************************************************
// **************** POST METHODS *******************
// *************************************************

const useCreatePendingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRequestPaymentDto) => {
      return apiClient.postData<RequestPayment>("/request-payment", data);
    },
    onSuccess: (newRequest: RequestPayment) => {},
  });
};

// *************************************************
// **************** PUT METHODS *******************
// *************************************************

const useAcceptRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, txid }: { id: number; txid: string }) => {
      return apiClient.putData<RequestPayment>(`/request-payment/${id}/accept`, { txid });
    },
    onSuccess: (updatedRequest: RequestPayment) => {
      queryClient.setQueryData(["request-payment"], (oldData: RequestPaymentResponse | undefined) => {
        if (!oldData) return { pending: [], accepted: [updatedRequest] };
        return {
          ...oldData,
          pending: oldData.pending.filter(request => request.id !== updatedRequest.id),
          accepted: [...oldData.accepted, updatedRequest],
        };
      });
    },
  });
};

const useDenyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.putData<RequestPayment>(`/request-payment/${id}/deny`);
    },
    onSuccess: (updatedRequest: RequestPayment) => {
      queryClient.setQueryData(["request-payment"], (oldData: RequestPaymentResponse | undefined) => {
        if (!oldData) return { pending: [], accepted: [] };
        return {
          ...oldData,
          pending: oldData.pending.filter(request => request.id !== updatedRequest.id),
        };
      });
    },
  });
};

export { useGetRequests, useCreatePendingRequest, useAcceptRequest, useDenyRequest };
