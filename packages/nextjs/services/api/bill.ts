import { apiServerWithAuth } from "./index";
import {
	BillQueryDto,
	BillStatsDto,
	PayBillsDto,
	BatchPaymentResultDto,
	BillModel,
} from "@/types/bill";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// React Query hooks
export const useGetBills = (query?: BillQueryDto) => {
	return useQuery({
		queryKey: ["bills", query],
		queryFn: async () => {
			if (!query) {
				return apiServerWithAuth.getData<{ bills: BillModel[]; pagination: any }>(`/api/v1/bill`);
			}
			// Filter out undefined values before building query string
			const filteredQuery = Object.fromEntries(
				Object.entries(query).filter(([_, value]) => value !== undefined)
			);
			const queryString = new URLSearchParams(
				Object.entries(filteredQuery).map(([key, value]) => [key, String(value)])
			).toString();
			return apiServerWithAuth.getData<{ bills: BillModel[]; pagination: any }>(
				`/api/v1/bill${queryString ? `?${queryString}` : ""}`
			);
		},
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});
};

export const useGetBillStats = () => {
	return useQuery({
		queryKey: ["bill-stats"],
		queryFn: async () => apiServerWithAuth.getData<BillStatsDto>(`/api/v1/bill/stats`),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});
};

export const usePayBills = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: PayBillsDto) => apiServerWithAuth.postData<BatchPaymentResultDto>(`/api/v1/bill/pay`, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bills"] });
			queryClient.invalidateQueries({ queryKey: ["bill-stats"] });
		},
	});
};

export const useUpdateBillStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status }: { id: number; status: string }) =>
			apiServerWithAuth.patchData<BillModel>(`/api/v1/bill/${id}/status/${status}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bills"] });
		},
	});
};

export const useDeleteBill = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (uuid: string) => apiServerWithAuth.deleteData<void>(`/api/v1/bill/${uuid}`),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bills"] }),
	});
};

export default {
	useGetBills,
	useGetBillStats,
	usePayBills,
	useUpdateBillStatus,
	useDeleteBill,
};

