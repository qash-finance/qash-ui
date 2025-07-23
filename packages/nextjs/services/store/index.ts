import { create, createStore } from "zustand";
import { persist } from "zustand/middleware";

type GlobalState = {
  counter: number;
  setCounter: (newCounter: number) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  counter: 0,
  setCounter: (newValue: number): void => set(() => ({ counter: newValue })),
}));

type WalletState = {
  walletAddress: string;
  setWalletAddress: (walletAddress: string) => void;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  firstTimeConnected: boolean;
  setFirstTimeConnected: (firstTimeConnected: boolean) => void;
  disconnect: () => void;
};

export const useWalletState = create<WalletState>()(
  persist(
    set => ({
      isConnected: false,
      walletAddress: "",
      setWalletAddress: (walletAddress: string) => set({ walletAddress }),
      setIsConnected: (isConnected: boolean) => set({ isConnected }),
      firstTimeConnected: false,
      setFirstTimeConnected: (firstTimeConnected: boolean) => set({ firstTimeConnected }),
      disconnect: () => set({ isConnected: false }),
    }),
    { name: "wallet-storage" },
  ),
);
