"use client";

import React, { useState, useEffect } from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { NotificationModalProps } from "@/types/modal";
import NotificationCard, { NotificationType } from "./NotificationCard";
import { useSocket } from "@/contexts/SocketProvider";
import { useGetNotificationsInfinite, useMarkNotificationAsRead } from "@/services/api/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";

const Notification = ({ isOpen, onClose }: ModalProp<NotificationModalProps>) => {
  const { walletAddress } = useWalletConnect();
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const queryClient = useQueryClient();

  // API integration
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotificationsInfinite(
    walletAddress,
    20,
  );
  const markAsReadMutation = useMarkNotificationAsRead();

  // Calculate unread count from API data
  useEffect(() => {
    if (data?.pages) {
      const allNotifications = data.pages.flatMap(page => page.notifications);
      const unread = allNotifications.filter((item: any) => item.status === "UNREAD").length;
      setUnreadCount(unread);
    }
  }, [data]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  // Set up WebSocket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (event: any) => {
      if (event.data) {
        console.log("New notification received:", event.data);
        // Update cache with new notification
        queryClient.setQueriesData({ queryKey: ["notification-infinite"] }, (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) =>
              index === 0 ? { ...page, notifications: [event.data, ...page.notifications] } : page,
            ),
          };
        });

        // Update unread count
        if (event.data.status === "UNREAD") {
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    const handleUnreadCountUpdate = (event: any) => {
      if (typeof event.count === "number") {
        console.log("Unread count updated:", event.count);
        setUnreadCount(event.count);
      }
    };

    const handleNotificationRead = (event: any) => {
      if (event.notificationId) {
        console.log("Notification marked as read:", event.notificationId);
        // Update cache to mark notification as read
        queryClient.setQueriesData({ queryKey: ["notification-infinite"] }, (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              notifications: page.notifications.map((notification: any) =>
                notification.id === event.notificationId
                  ? { ...notification, status: "READ" as const, readAt: new Date() }
                  : notification,
              ),
            })),
          };
        });

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    const handleAllNotificationsRead = () => {
      console.log("All notifications marked as read");
      // Update cache to mark all notifications as read
      queryClient.setQueriesData({ queryKey: ["notification-infinite"] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((notification: any) => ({
              ...notification,
              status: "READ" as const,
              readAt: new Date(),
            })),
          })),
        };
      });

      // Update unread count
      setUnreadCount(0);
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("unread_count_update", handleUnreadCountUpdate);
    socket.on("notification_read", handleNotificationRead);
    socket.on("all_notifications_read", handleAllNotificationsRead);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("unread_count_update", handleUnreadCountUpdate);
      socket.off("notification_read", handleNotificationRead);
      socket.off("all_notifications_read", handleAllNotificationsRead);
    };
  }, [socket]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleTabClick = (tab: "unread" | "all") => {
    setActiveTab(tab);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Convert server notification type to client type
  const convertNotificationType = (serverType: string): NotificationType => {
    switch (serverType) {
      case "SEND":
        return NotificationType.SEND;
      case "CLAIM":
        return NotificationType.CLAIM;
      case "REFUND":
        return NotificationType.REFUNDED;
      case "BATCH_SEND":
        return NotificationType.BATCH_SEND;
      case "WALLET_CREATE":
        return NotificationType.WALLET_CREATE;
      default:
        return NotificationType.SEND;
    }
  };

  // Convert server notification to client format
  const convertNotification = (notification: any) => {
    return {
      id: notification.id,
      type: convertNotificationType(notification.type),
      title: notification.title,
      subtitle: notification.message,
      time: new Date(notification.createdAt).toLocaleString(),
      amount: notification.metadata?.amount,
      token: notification.metadata?.token,
      address: notification.metadata?.address,
      recipientCount: notification.metadata?.recipientCount,
      isRead: notification.status === "READ",
    };
  };

  if (!isOpen) return null;

  // Convert API notifications to client format
  const clientNotifications = data?.pages
    ? data.pages.flatMap(page => page.notifications).map(convertNotification)
    : [];

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "unread"
      ? clientNotifications?.filter((notification: any) => !notification.isRead)
      : clientNotifications;

  return (
    <div
      data-tour="portfolio-section"
      className="portfolio fixed inset-0 flex items-center justify-end z-[100] pointer-events-auto"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out z-[1] ${
          isAnimating ? "bg-black/60 backdrop-blur-sm opacity-100" : "bg-black/0 backdrop-blur-none opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <main
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-[#1E1E1E] h-full w-[470px] max-md:mx-auto max-md:my-0 max-md:w-full max-md:max-w-[425px] max-sm:p-1 max-sm:w-full max-sm:h-screen transition-transform duration-300 ease-out z-[2] ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Back Navigation */}
        <nav
          className="flex flex-col shrink-0 justify-center items-center self-stretch px-2 py-0 rounded-2xl bg-[#292929] w-[42px] cursor-pointer relative"
          onClick={handleClose}
        >
          <button
            className="flex absolute justify-center items-center w-7 h-7 left-[7px] top-[398px]"
            aria-label="Close"
          >
            <img src="/close-icon.svg" alt="close-icon" className="w-7 h-7" />
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col gap-2 items-start justify-start p-0 size-full relative">
          {/* Header */}
          <div className="flex items-center justify-center px-3 py-2 w-full shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <h1 className="font-['Barlow:Medium',_sans-serif] text-white text-2xl uppercase leading-[1.1]">
                notification
              </h1>
              <div className="bg-[#ff4444] flex items-center justify-center px-4 py-1 rounded-[51px] shrink-0">
                <span className="font-['Barlow:SemiBold',_sans-serif] text-white text-[15px] tracking-[-0.45px] leading-[1.2]">
                  {unreadCount}+
                </span>
              </div>
            </div>
          </div>

          {/* Main Container */}
          <div className="bg-[#0c0c0c] flex flex-col items-center justify-between p-3 rounded-2xl w-full h-full overflow-hidden">
            {/* Filter Tabs */}
            <div className="bg-[#1e1e1e] flex gap-[5px] h-[34px] items-center justify-center p-[3px] rounded-xl w-full">
              <div
                className={`flex items-center justify-center h-full px-4 py-1.5 rounded-lg grow cursor-pointer transition-all duration-200 ${
                  activeTab === "unread" ? "bg-[#292929]" : ""
                }`}
                onClick={() => handleTabClick("unread")}
              >
                <span
                  className={`font-['Barlow:Regular',_sans-serif] text-white text-base tracking-[-0.48px] leading-[1.2] transition-all duration-200 ${
                    activeTab === "unread" ? "font-['Barlow:Medium',_sans-serif] opacity-100" : "opacity-50"
                  }`}
                >
                  Unread
                </span>
              </div>
              <div
                className={`flex items-center justify-center h-full px-4 py-1.5 rounded-lg grow cursor-pointer transition-all duration-200 ${
                  activeTab === "all" ? "bg-[#292929]" : ""
                }`}
                onClick={() => handleTabClick("all")}
              >
                <span
                  className={`font-['Barlow:Regular',_sans-serif] text-white text-base tracking-[-0.48px] leading-[1.2] transition-all duration-200 ${
                    activeTab === "all" ? "font-['Barlow:Medium',_sans-serif] opacity-100" : "opacity-50"
                  }`}
                >
                  All
                </span>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex flex-col gap-1 w-full overflow-y-auto h-full my-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[#989898] text-sm">Loading notifications...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[#ff4444] text-sm">Failed to load notifications</span>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification: any) => (
                  <NotificationCard
                    key={notification.id}
                    type={notification.type}
                    title={notification.title}
                    subtitle={notification.subtitle}
                    time={notification.time}
                    amount={notification.amount}
                    token={notification.token}
                    address={notification.address}
                    recipientCount={notification.recipientCount}
                    isRead={notification.isRead}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <span className="text-[#989898] text-sm">No notifications</span>
                </div>
              )}
            </div>
            {/* Load More Button */}
            {hasNextPage && (
              <div
                className="bg-[#292929] flex items-center justify-center gap-1.5 pb-3.5 pt-3 px-[15px] rounded-[10px] w-full overflow-hidden relative cursor-pointer hover:bg-[#3d3d3d] transition-colors duration-200"
                onClick={handleLoadMore}
              >
                <span className="font-['Barlow:Medium',_sans-serif] text-[#989898] text-base tracking-[-0.084px] leading-none">
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </span>
                <div className="absolute inset-0 pointer-events-none shadow-[0px_-2.4px_0px_0px_inset_#3d3d3d]" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notification;
