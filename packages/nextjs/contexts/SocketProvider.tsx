import React, { createContext, useContext, useEffect, useState } from "react";
import { connectWebSocket, joinWalletRoom, leaveWalletRoom } from "../services/utils/websocketUtils";
import { Socket } from "socket.io-client";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";

export const SocketContext = createContext<{
  socket: Socket | null;
  changeSocketUrl: (newUrl: string) => void;
} | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

const socketDefaultUrl = process.env.NEXT_PUBLIC_SERVER_URL
  ? process.env.NEXT_PUBLIC_SERVER_URL
  : "http://localhost:3001";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketUrl, setSocketUrl] = useState<string>(socketDefaultUrl);
  const { walletAddress } = useWalletConnect();

  // You would call this function when you need to change the URL
  const changeSocketUrl = (newUrl: string) => {
    setSocketUrl(newUrl);
  };

  useEffect(() => {
    const setupSocket = async () => {
      try {
        const newSocket = await connectWebSocket(socketUrl ?? socketDefaultUrl);
        setSocket(newSocket);
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socketUrl]);

  // Auto-connect to wallet room when socket and wallet address are available
  useEffect(() => {
    if (socket && walletAddress) {
      console.log("Auto-connecting to wallet room:", walletAddress);
      joinWalletRoom(socket, walletAddress);
    }
  }, [socket, walletAddress]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        changeSocketUrl,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
