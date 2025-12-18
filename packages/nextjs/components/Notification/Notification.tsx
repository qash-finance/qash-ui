"use client";

import React, { useState, useEffect } from "react";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { NotificationModalProps } from "@/types/modal";
import NotificationCard from "./NotificationCard";
import { NotificationType } from "@/types/notification";
import { useSocket } from "@/contexts/SocketProvider";
import {
  useGetNotificationsInfinite,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/services/api/notification";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { NotificationCardType, NotificationResponseDto } from "@/types/notification";
import { formatRelativeTime } from "@/services/utils/formatDate";
import { TabContainer } from "../Common/TabContainer";

const tabs = (unreadCount: number) => [
  {
    id: "unread",
    label: (
      <div className="flex justify-center items-center gap-2">
        <span>Unread</span>
        {unreadCount > 0 && (
          <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF4444]">
            <span className="text-white text-xs font-medium">{unreadCount}</span>
          </div>
        )}
      </div>
    ),
  },
  { id: "all", label: "All" },
];

const Notification = ({ isOpen, onClose }: ModalProp<NotificationModalProps>) => {
  const { walletAddress, isConnected } = useWalletConnect();
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const queryClient = useQueryClient();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotificationsInfinite(
    walletAddress,
    20,
  );
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

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

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Convert server notification to client format
  const convertNotification = (notification: NotificationResponseDto): NotificationCardType => {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      subtitle: notification.message,
      time: formatRelativeTime(new Date(notification.createdAt)),
      amount: notification.metadata?.amount,
      tokenAddress: notification.metadata?.tokenId,
      tokenName: notification.metadata?.tokenName,
      address: notification.metadata?.recipient,
      payee: notification.metadata?.payee,
      recipientCount: notification.metadata?.recipientCount,
      isRead: notification.status === "READ",
      transactionId: notification.metadata?.transactionId,
      giftOpener: notification.metadata?.caller,
    };
  };

  // Convert API notifications to client format
  const clientNotifications = data?.pages
    ? data.pages.flatMap(page => page.notifications).map(convertNotification)
    : [];

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "unread"
      ? clientNotifications?.filter((notification: any) => !notification.isRead)
      : clientNotifications;

  if (!isOpen) return null;

  return (
    <div
      data-tour="portfolio-section"
      className="relativportfolio fixed inset-0 flex items-center justify-end z-[150] pointer-events-auto"
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
        className={`relative flex gap-1 justify-center items-start p-2 rounded-3xl bg-app-background h-full w-[470px] transition-transform duration-300 ease-out z-[2] ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Back Navigation */}
        {/* <nav
          className="flex flex-col shrink-0 justify-center items-center self-stretch px-2 py-0 rounded-2xl w-[42px] cursor-pointer relative"
          onClick={handleClose}
        >
          <button className="flex absolute justify-center items-center w-7 h-7 top-1/2" aria-label="Close">
            <img src="/misc/close-icon.svg" alt="close-icon" className="w-7 h-7" />
          </button>
        </nav> */}

        {/* Main Content */}
        <div className="flex flex-col gap-2 items-start justify-start p-0 size-full relative">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 w-full">
            <h1 className=" text-text-primary text-2xl leading-none">Notifications</h1>

            <div className="flex items-center justify-center gap-1 cursor-pointer" onClick={handleMarkAllAsRead}>
              <img src="/misc/double-check-icon.svg" alt="double-check-icon" className="w-5 h-5" />
              <span className="leading-none text-primary-blue">Mark all as read</span>
            </div>
          </div>

          {/* Main Container */}
          <div className=" flex flex-col items-center justify-between p-3 rounded-2xl w-full h-full overflow-hidden">
            {/* Filter Tabs */}
            <TabContainer
              tabs={tabs(unreadCount)}
              activeTab={activeTab}
              setActiveTab={(tab: string) => handleTabClick(tab as "unread" | "all")}
            />

            {/* Notification List */}
            <div className="flex flex-col gap-1 w-full overflow-y-auto h-full my-2">
              {!isConnected ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-text-secondary text-sm">Coming soon</span>
                </div>
              ) : isLoading || error ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-text-secondary text-sm">Loading notifications...</span>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification: NotificationCardType) => (
                  <NotificationCard
                    key={notification.id}
                    type={notification.type}
                    title={notification.title}
                    subtitle={notification.subtitle}
                    time={notification.time}
                    amount={notification.amount}
                    tokenAddress={notification.tokenAddress}
                    tokenName={notification.tokenName}
                    address={notification.address}
                    payee={notification.payee}
                    recipientCount={notification.recipientCount}
                    isRead={notification.isRead}
                    txId={notification.transactionId}
                    giftOpener={notification.giftOpener}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full flex-col gap-4">
                  <img src="/notification/hexagon-bell-icon.svg" alt="No notifications" className="w-30 h-30" />
                  <span className="text-text-secondary">You don’t have any notifications yet</span>
                </div>
              )}
            </div>
            {/* Load More Button */}
            {hasNextPage && (
              <div
                className="bg-[#292929] flex items-center justify-center gap-1.5 pb-3.5 pt-3 px-[15px] rounded-[10px] w-full overflow-hidden relative cursor-pointer hover:bg-[#3d3d3d] transition-colors duration-200"
                onClick={handleLoadMore}
              >
                <span className=" text-[#989898] text-base tracking-[-0.084px] leading-none">
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
