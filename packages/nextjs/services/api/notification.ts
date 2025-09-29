import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { apiServerWithAuth } from "./index";
import { NotificationResponse } from "@/types/notification";

// *************************************************
// **************** GET METHODS *******************
// *************************************************

const useGetNotifications = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["notification", page, limit],
    queryFn: async () => {
      return apiServerWithAuth.getData<NotificationResponse>(`/notifications?page=${page}&limit=${limit}`);
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
      return apiServerWithAuth.getData<NotificationResponse>(`/notifications?page=${pageParam}&limit=${limit}`);
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
      return apiServerWithAuth.patchData(`/notifications/${notificationId}/mark-read`, {});
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
      return apiServerWithAuth.patchData(`/notifications/mark-all-read`, {});
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

      // Also update the infinite query cache
      queryClient.setQueriesData({ queryKey: ["notification-infinite"] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: NotificationResponse) => ({
            ...page,
            notifications: page.notifications.map(notification => ({
              ...notification,
              status: "READ" as const,
              readAt: new Date(),
            })),
          })),
        };
      });
    },
  });
};

export { useGetNotifications, useGetNotificationsInfinite, useMarkNotificationAsRead, useMarkAllNotificationsAsRead };
