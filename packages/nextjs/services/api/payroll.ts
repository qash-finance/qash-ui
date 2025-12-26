import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import {
  CreatePayrollDto,
  UpdatePayrollDto,
  PayrollQueryDto,
  PayrollStatsDto,
  PayrollModel,
  PaginatedPayrollsResponseDto,
  PendingInvoiceReviewsDto,
  CreatePayroll,
} from "@/types/payroll";

// *************************************************
// **************** GET METHODS ********************
// *************************************************

/**
 * Hook to fetch all payrolls with pagination and filters
 */
const useGetPayrolls = (query?: PayrollQueryDto) => {
  const queryParams = new URLSearchParams();
  if (query?.page) queryParams.append("page", query.page.toString());
  if (query?.limit) queryParams.append("limit", query.limit.toString());
  if (query?.employeeId) queryParams.append("employeeId", query.employeeId.toString());
  if (query?.contractTerm) queryParams.append("contractTerm", query.contractTerm);
  if (query?.search) queryParams.append("search", query.search);

  return useQuery({
    queryKey: ["payrolls", "all", query],
    queryFn: async () => {
      return apiServerWithAuth.getData<PaginatedPayrollsResponseDto>(`/api/v1/payroll?${queryParams.toString()}`);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to fetch payroll statistics
 */
const useGetPayrollStats = () => {
  return useQuery({
    queryKey: ["payrolls", "stats"],
    queryFn: async () => {
      return apiServerWithAuth.getData<PayrollStatsDto>(`/api/v1/payroll/stats`);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to fetch payroll details by ID
 */
const useGetPayrollDetails = (id: number) => {
  return useQuery({
    queryKey: ["payrolls", "detail", id],
    queryFn: async () => {
      return apiServerWithAuth.getData<PayrollModel>(`/api/v1/payroll/${id}`);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

/**
 * Hook to check if payroll has pending invoice reviews from employee
 */
const useGetPayrollPendingReviews = (id: number) => {
  return useQuery({
    queryKey: ["payrolls", "pending-reviews", id],
    queryFn: async () => {
      return apiServerWithAuth.getData<PendingInvoiceReviewsDto>(`/api/v1/payroll/${id}/pending-reviews`);
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

/**
 * Hook to create a sandbox payroll (for scheduler test)
 */
const useCreateSandboxPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { employeeId: number; amount?: number }) => {
      return apiServerWithAuth.postData<PayrollModel>("/api/v1/payroll/sandbox", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
};

/**
 * Hook to create a new payroll
 */
const useCreatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePayroll) => {
      return apiServerWithAuth.postData<PayrollModel>("/api/v1/payroll", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
};

// *************************************************
// **************** PUT METHODS ********************
// *************************************************

/**
 * Hook to update an existing payroll
 */
const useUpdatePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePayrollDto }) => {
      return apiServerWithAuth.putData<PayrollModel>(`/api/v1/payroll/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payrolls", "detail", variables.id],
      });
    },
  });
};

// *************************************************
// **************** PATCH METHODS ******************
// *************************************************

/**
 * Hook to pause a payroll
 */
const usePausePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiServerWithAuth.patchData<PayrollModel>(`/api/v1/payroll/${id}/pause`, {});
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "detail", id] });
    },
  });
};

/**
 * Hook to resume a payroll
 */
const useResumePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiServerWithAuth.patchData<PayrollModel>(`/api/v1/payroll/${id}/resume`, {});
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payrolls", "detail", id] });
    },
  });
};

// *************************************************
// **************** DELETE METHODS *****************
// *************************************************

/**
 * Hook to delete a payroll
 */
const useDeletePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiServerWithAuth.deleteData<void>(`/api/v1/payroll/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
};

// *************************************************
// **************** EXPORTS ************************
// *************************************************

export {
  // GET
  useGetPayrolls,
  useGetPayrollStats,
  useGetPayrollDetails,
  useGetPayrollPendingReviews,
  // POST
  useCreatePayroll,
  useCreateSandboxPayroll,
  // PUT
  useUpdatePayroll,
  // PATCH
  usePausePayroll,
  useResumePayroll,
  // DELETE
  useDeletePayroll,
};
