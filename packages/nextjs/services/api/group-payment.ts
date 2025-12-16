import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import { AuthStorage } from "../auth/storage";
import {
  CreateGroupDto,
  CreateGroupPaymentDto,
  CreateDefaultGroupDto,
  CreateQuickSharePaymentDto,
  Group,
  GroupPayment,
  GroupPaymentsResponse,
  PaymentByLinkResponse,
} from "@/types/group-payment";

// *************************************************
// **************** API CLIENT SETUP ***************
// *************************************************

// *************************************************
// **************** GET METHODS *******************
// *************************************************

const useGetAllGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      return apiServerWithAuth.getData<Group[]>("/group-payment/groups");
    },
    staleTime: 0, // Always consider data stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetGroupPayments = (groupId?: number) => {
  return useQuery({
    queryKey: ["group-payments", groupId],
    queryFn: async () => {
      const data = await apiServerWithAuth.getData<GroupPaymentsResponse>(`/group-payment/group/${groupId}/payments`);

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
      return apiServerWithAuth.getData<PaymentByLinkResponse>(`/group-payment/link/${linkCode}`);
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
      return apiServerWithAuth.postData<Group>("/group-payment/group", data);
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
      return apiServerWithAuth.postData<Group>("/group-payment/default-group", data);
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
      return apiServerWithAuth.postData<GroupPayment>("/group-payment/create-payment", data);
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

const useCreateQuickSharePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuickSharePaymentDto) => {
      return apiServerWithAuth.postData<{ code: string }>("/group-payment/quick-share/create-payment", data);
    },
    onSuccess: (response: { code: string }) => {
      // Find the "Quick Share" group and update its payments cache
      const groups = queryClient.getQueryData<Group[]>(["groups"]);
      if (groups) {
        const quickShareGroup = groups.find(group => group.name === "Quick Share");
        if (quickShareGroup) {
          // Invalidate the quick share group's payments to refetch latest data
          queryClient.invalidateQueries({ queryKey: ["group-payments", quickShareGroup.id] });
        }
      }
    },
  });
};

// *************************************************
// ******************* PATCH ***********************
// *************************************************

const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: number; data: CreateGroupDto }) => {
      return apiServerWithAuth.patchData<Group>(`/group-payment/group/${groupId}`, data);
    },
    onSuccess: (updatedGroup: Group) => {
      // Update groups cache
      queryClient.setQueryData(["groups"], (oldData: Group[] | undefined) => {
        if (!oldData) return [updatedGroup];
        return oldData.map(g => (g.id === updatedGroup.id ? updatedGroup : g));
      });
      // Invalidate related payments
      queryClient.invalidateQueries({ queryKey: ["group-payments", updatedGroup.id] });
    },
  });
};

// *************************************************
// ******************* DELETE **********************
// *************************************************

const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: number) => {
      return apiServerWithAuth.deleteData(`/group-payment/group/${groupId}`);
    },
    onSuccess: (_resp, groupId) => {
      // Remove from groups cache
      queryClient.setQueryData(["groups"], (oldData: Group[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(g => g.id !== groupId);
      });
      // Invalidate related payments
      queryClient.invalidateQueries({ queryKey: ["group-payments", groupId] });
    },
  });
};

const useAddMemberToQuickShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, userAddress }: { code: string; userAddress: string }) => {
      return apiServerWithAuth.patchData(`/group-payment/quick-share/${code}/add-member`, { userAddress });
    },
    onSuccess: () => {
      // Invalidate relevant queries when a member is added
      queryClient.invalidateQueries({ queryKey: ["payment-by-link"] });
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
  useCreateQuickSharePayment,
  useAddMemberToQuickShare,
  useUpdateGroup,
  useDeleteGroup,
};
