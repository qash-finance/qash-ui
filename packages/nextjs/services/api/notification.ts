import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedApiClient } from "./index";
import { AuthStorage } from "../auth/storage";
import { AddressBook, AddressBookDto, Category } from "@/types/address-book";
import { UserInfo } from "@/types/user";
import { NotificationResponse } from "@/types/notification";

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

const useGetNotifications = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["notification", page, limit],
    queryFn: async () => {
      return apiClient.getData<NotificationResponse>(`/notifications?page=${page}&limit=${limit}`);
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

const useGetNotificationsInfinite = (walletAddress: string, limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ["notification-infinite"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return apiClient.getData<NotificationResponse>(`/notifications?page=${pageParam}&limit=${limit}`);
    },
    getNextPageParam: (lastPage: NotificationResponse) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: !!walletAddress,
  });
};

// *************************************************
// **************** MUTATION METHODS ***************
// *************************************************

const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      return apiClient.patchData(`/notifications/${notificationId}/mark-read`, {});
    },
    onSuccess: (_, notificationId) => {
      // Update cache directly instead of invalidating
      queryClient.setQueriesData({ queryKey: ["notification"] }, (oldData: NotificationResponse | undefined) => {
        if (!oldData?.notifications) return oldData;

        return {
          ...oldData,
          notifications: oldData.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, status: "READ" as const, readAt: new Date() }
              : notification,
          ),
        };
      });
    },
  });
};

const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.patchData(`/notifications/mark-all-read`, {});
    },
    onSuccess: () => {
      // Update cache directly instead of invalidating
      queryClient.setQueriesData({ queryKey: ["notification"] }, (oldData: NotificationResponse | undefined) => {
        if (!oldData?.notifications) return oldData;

        return {
          ...oldData,
          notifications: oldData.notifications.map(notification => ({
            ...notification,
            status: "READ" as const,
            readAt: new Date(),
          })),
        };
      });
    },
  });
};

export { useGetNotifications, useGetNotificationsInfinite, useMarkNotificationAsRead, useMarkAllNotificationsAsRead };
