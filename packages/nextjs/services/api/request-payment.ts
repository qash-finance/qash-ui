import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import { AuthStorage } from "../auth/storage";
import { CreateRequestPaymentDto, RequestPayment } from "@/types/request-payment";

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
      return apiServerWithAuth.getData<RequestPaymentResponse>(`/request-payment`);
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
      return apiServerWithAuth.postData<RequestPayment>("/request-payment", data);
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
      return apiServerWithAuth.putData<RequestPayment>(`/request-payment/${id}/accept`, { txid });
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
      return apiServerWithAuth.putData<RequestPayment>(`/request-payment/${id}/deny`);
    },
    onSuccess: (updatedRequest: RequestPayment) => {
      // refetch requests
      queryClient.invalidateQueries({ queryKey: ["request-payment"] });
    },
  });
};

const useConfirmGroupPaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiServerWithAuth.putData<RequestPayment>(`/request-payment/${id}/confirm-group-payment`);
    },
    onSuccess: (updatedRequest: RequestPayment) => {
      queryClient.setQueryData(["request-payment"], (oldData: RequestPaymentResponse | undefined) => {
        if (!oldData) return { pending: [], accepted: [] };
        return {
          ...oldData,
          pending: oldData.pending.filter(request => request.id !== updatedRequest.id),
          accepted: [...oldData.accepted, updatedRequest],
        };
      });
    },
  });
};

export { useGetRequests, useCreatePendingRequest, useAcceptRequest, useDenyRequest, useConfirmGroupPaymentRequest };
