import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import {
  CreateGroupDto,
  CreateGroupPaymentDto,
  CreateDefaultGroupDto,
  Group,
  GroupPayment,
  GroupPaymentsResponse,
  PaymentByLinkResponse,
} from "@/types/group-payment";

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

const useGetAllGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      return apiClient.getData<Group[]>("/group-payment/groups");
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetGroupPayments = (groupId: number) => {
  return useQuery({
    queryKey: ["group-payments", groupId],
    queryFn: async () => {
      const data = await apiClient.getData<GroupPaymentsResponse>(`/group-payment/group/${groupId}/payments`);

      // Transform the data to group by minute instead of date
      const transformedData: GroupPaymentsResponse = {};

      Object.entries(data).forEach(([date, payments]) => {
        payments.forEach(payment => {
          // Use the payment's createdAt timestamp for minute-level grouping
          const paymentDate = new Date(payment.createdAt);
          const minuteKey = paymentDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format

          if (!transformedData[minuteKey]) {
            transformedData[minuteKey] = [];
          }
          transformedData[minuteKey].push(payment);
        });
      });

      return transformedData;
    },
    enabled: !!groupId,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetPaymentByLink = (linkCode: string) => {
  return useQuery({
    queryKey: ["payment-by-link", linkCode],
    queryFn: async () => {
      return apiClient.getData<PaymentByLinkResponse>(`/group-payment/link/${linkCode}`);
    },
    enabled: !!linkCode,
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// *************************************************
// **************** POST METHODS *******************
// *************************************************

const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupDto) => {
      return apiClient.postData<Group>("/group-payment/group", data);
    },
    onSuccess: (newGroup: Group) => {
      // Update the groups list cache
      queryClient.setQueryData(["groups"], (oldData: Group[] | undefined) => {
        if (!oldData) return [newGroup];
        return [...oldData, newGroup];
      });
    },
  });
};

const useCreateDefaultGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDefaultGroupDto) => {
      return apiClient.postData<Group>("/group-payment/default-group", data);
    },
    onSuccess: (newGroup: Group) => {
      // Update the groups list cache
      queryClient.setQueryData(["groups"], (oldData: Group[] | undefined) => {
        if (!oldData) return [newGroup];
        return [...oldData, newGroup];
      });
    },
  });
};

const useCreateGroupPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupPaymentDto) => {
      return apiClient.postData<GroupPayment>("/group-payment/create-payment", data);
    },
    onSuccess: (newPayment: GroupPayment) => {
      const groupId = newPayment.groupId || newPayment.group?.id;
      queryClient.invalidateQueries({ queryKey: ["group-payments", groupId] });
      queryClient.setQueryData(["group-payments", groupId], (oldData: GroupPaymentsResponse | undefined) => {
        if (!oldData) {
          const paymentDate = new Date(newPayment.createdAt);
          const minuteKey = paymentDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
          return { [minuteKey]: [newPayment] };
        }
        const paymentDate = new Date(newPayment.createdAt);
        const minuteKey = paymentDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format

        return {
          ...oldData,
          [minuteKey]: oldData[minuteKey] ? [...oldData[minuteKey], newPayment] : [newPayment],
        };
      });
    },
  });
};

export {
  useGetAllGroups,
  useGetGroupPayments,
  useGetPaymentByLink,
  useCreateGroup,
  useCreateDefaultGroup,
  useCreateGroupPayment,
};
