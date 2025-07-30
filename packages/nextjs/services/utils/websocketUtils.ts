import { io, Socket } from "socket.io-client";
import _ from "lodash";

interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: "SEND" | "CLAIM" | "REFUND" | "BATCH_SEND" | "WALLET_CREATE";
  status: "UNREAD" | "READ";
  metadata?: any;
  actionUrl?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

interface SocketEventData {
  type: string;
  data?: any;
  timestamp: string;
  count?: number;
  notificationId?: number;
}

export const connectWebSocket = (baseSocketUrl: string): Promise<Socket> => {
  return new Promise<Socket>((resolve, reject) => {
    let socket: Socket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000;

    const setupSocket = (socketUrl: string) => {
      // Connect to the /notifications namespace to match the gateway
      const socketServerUrl = `${_.trimEnd(socketUrl, "/")}/notifications`;

      socket = io(socketServerUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectDelay,
      });

      socket.on("connect", () => {
        console.log("WebSocket connected to notifications namespace");
        reconnectAttempts = 0;
        resolve(socket);
      });

      // Handle connection confirmation from server
      socket.on("connected", (data: { message: string; socketId: string }) => {
        console.log("Server connection confirmation:", data);
      });

      socket.on("connect_error", error => {
        console.error("WebSocket connection error:", error);
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log("Attempting to reconnect...");
          setTimeout(() => setupSocket(socketUrl), reconnectDelay);
        } else {
          console.log("WebSocket connection failed after maximum reconnect attempts.");
          reject(error);
        }
      });

      socket.on("error", error => {
        console.error("WebSocket error:", error);
      });

      socket.on("disconnect", reason => {
        console.log("WebSocket disconnected:", reason);
      });

      // Gateway event listeners - matching the server implementation
      socket.on("new_notification", (event: SocketEventData) => {
        console.log("New notification received:", event);
        if (event.data) {
          handleNewNotification(event.data);
        }
      });

      socket.on("unread_count_update", (event: SocketEventData) => {
        console.log("Unread count updated:", event.count);
        if (typeof event.count === "number") {
          updateUnreadCount(event.count);
        }
      });

      socket.on("notification_read", (event: SocketEventData) => {
        console.log("Notification marked as read:", event.notificationId);
        if (event.notificationId) {
          markNotificationAsRead(event.notificationId);
        }
      });

      socket.on("all_notifications_read", (event: SocketEventData) => {
        console.log("All notifications marked as read:", event);
        markAllNotificationsAsRead();
      });

      // Handle wallet room events
      socket.on("joined_wallet", (data: { message: string; walletAddress: string }) => {
        console.log("Successfully joined wallet room:", data);
      });

      socket.on("left_wallet", (data: { message: string; walletAddress: string }) => {
        console.log("Left wallet room:", data);
      });

      // Handle ping/pong for connection health
      socket.on("pong", (data: { timestamp: string; socketId: string; walletAddress?: string }) => {
        console.log("Received pong:", data);
      });
    };

    setupSocket(baseSocketUrl);
  });
};

// Gateway-compatible client methods
export const joinWalletRoom = (socket: Socket, walletAddress: string) => {
  if (!socket || !walletAddress) {
    console.error("Socket or wallet address is missing");
    return;
  }

  console.log("Joining wallet room:", walletAddress);
  socket.emit("join_wallet", { walletAddress });
};

export const leaveWalletRoom = (socket: Socket) => {
  if (!socket) {
    console.error("Socket is missing");
    return;
  }

  console.log("Leaving wallet room");
  socket.emit("leave_wallet");
};

export const pingServer = (socket: Socket) => {
  if (!socket) {
    console.error("Socket is missing");
    return;
  }

  socket.emit("ping");
};

// Event handler functions (implement these in your UI components)
const handleNewNotification = (notification: NotificationData) => {
  // Show toast notification
  // Add to notification list
  // Play notification sound
  console.log("Handling new notification:", notification);

  // You can dispatch to your state management here
  // Example: dispatch(addNotification(notification));
};

const updateUnreadCount = (count: number) => {
  // Update notification badge
  console.log("Updating unread count to:", count);

  // You can dispatch to your state management here
  // Example: dispatch(setUnreadCount(count));
};

const markNotificationAsRead = (notificationId: number) => {
  // Mark specific notification as read in UI
  console.log("Marking notification as read:", notificationId);

  // You can dispatch to your state management here
  // Example: dispatch(markNotificationRead(notificationId));
};

const markAllNotificationsAsRead = () => {
  // Mark all notifications as read in UI
  console.log("Marking all notifications as read");

  // You can dispatch to your state management here
  // Example: dispatch(markAllNotificationsRead());
};

// Utility function to create a notification client with automatic wallet joining
export const createNotificationClient = (baseUrl: string, walletAddress?: string) => {
  return connectWebSocket(baseUrl).then(socket => {
    // Join wallet room if wallet address is provided
    if (walletAddress) {
      joinWalletRoom(socket, walletAddress);
    }

    // Optional: Ping the server to test connection
    pingServer(socket);

    return socket;
  });
};

// Export types for use in components
export type { NotificationData, SocketEventData };
