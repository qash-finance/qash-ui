import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import {
  CreateSchedulePayment,
  UpdateSchedulePayment,
  SchedulePaymentQuery,
  SchedulePayment,
} from "@/types/schedule-payment";

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

const useGetSchedulePayments = (query?: SchedulePaymentQuery) => {
  return useQuery({
    queryKey: ["schedule-payments", query],
    queryFn: async () => {
      const queryParams = query ? new URLSearchParams() : undefined;
      if (query) {
        if (query.status) queryParams!.set("status", query.status);
        if (query.payer) queryParams!.set("payer", query.payer);
        if (query.payee) queryParams!.set("payee", query.payee);
      }

      const url = queryParams ? `/schedule-payment?${queryParams.toString()}` : "/schedule-payment";
      return apiClient.getData<SchedulePayment[]>(url);
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetSchedulePaymentById = (id: number) => {
  return useQuery({
    queryKey: ["schedule-payment", id],
    queryFn: async () => {
      return apiClient.getData<SchedulePayment>(`/schedule-payment/${id}`);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// *************************************************
// **************** POST METHODS *******************
// *************************************************

const useCreateSchedulePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSchedulePayment) => {
      return apiClient.postData<SchedulePayment>("/schedule-payment", data);
    },
    onSuccess: (newSchedulePayment: SchedulePayment) => {
      // Invalidate and refetch schedule payments list
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

// *************************************************
// **************** PUT METHODS *******************
// *************************************************

const useUpdateSchedulePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSchedulePayment }) => {
      return apiClient.putData<SchedulePayment>(`/schedule-payment/${id}`, data);
    },
    onSuccess: (updatedSchedulePayment: SchedulePayment) => {
      // Update the specific schedule payment in cache
      queryClient.setQueryData(["schedule-payment", updatedSchedulePayment.id], updatedSchedulePayment);
      // Invalidate and refetch schedule payments list
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

const usePauseSchedulePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.putData<SchedulePayment>(`/schedule-payment/${id}/pause`);
    },
    onSuccess: (updatedSchedulePayment: SchedulePayment) => {
      // Update the specific schedule payment in cache
      queryClient.setQueryData(["schedule-payment", updatedSchedulePayment.id], updatedSchedulePayment);
      // Invalidate and refetch schedule payments list
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

const useResumeSchedulePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.putData<SchedulePayment>(`/schedule-payment/${id}/resume`);
    },
    onSuccess: (updatedSchedulePayment: SchedulePayment) => {
      // Update the specific schedule payment in cache
      queryClient.setQueryData(["schedule-payment", updatedSchedulePayment.id], updatedSchedulePayment);
      // Invalidate and refetch schedule payments list
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

const useCancelSchedulePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.putData<SchedulePayment>(`/schedule-payment/${id}/cancel`);
    },
    onSuccess: (updatedSchedulePayment: SchedulePayment) => {
      // Update the specific schedule payment in cache
      queryClient.setQueryData(["schedule-payment", updatedSchedulePayment.id], updatedSchedulePayment);
      // Invalidate and refetch schedule payments list
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

// *************************************************
// **************** DELETE METHODS ****************
// *************************************************

const useDeleteSchedulePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.deleteData(`/schedule-payment/${id}`);
    },
    onSuccess: (_, deletedId: number) => {
      // Remove the specific schedule payment from cache
      queryClient.removeQueries({ queryKey: ["schedule-payment", deletedId] });
      // Invalidate and refetch schedule payments list
      queryClient.invalidateQueries({ queryKey: ["schedule-payments"] });
    },
  });
};

export {
  useGetSchedulePayments,
  useGetSchedulePaymentById,
  useCreateSchedulePayment,
  useUpdateSchedulePayment,
  usePauseSchedulePayment,
  useResumeSchedulePayment,
  useCancelSchedulePayment,
  useDeleteSchedulePayment,
};
