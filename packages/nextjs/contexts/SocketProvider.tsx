import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  // You would call this function when you need to change the URL
  const changeSocketUrl = (newUrl: string) => {
    setSocketUrl(newUrl);
  };

  useEffect(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || socketRef.current?.connected) {
      return;
    }

    isConnectingRef.current = true;

    const setupSocket = async () => {
      try {
        // Disconnect existing socket if any
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        const newSocket = await connectWebSocket(socketUrl ?? socketDefaultUrl);
        socketRef.current = newSocket;
        setSocket(newSocket);
        isConnectingRef.current = false;
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        isConnectingRef.current = false;
      }
    };

    setupSocket();

    return () => {
      // Clean up on unmount or URL change
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
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
