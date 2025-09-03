"use client";

import { useEffect, useState } from "react";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { type TransactionStore, createTransactionStore } from "@/services/store/transaction";

export type TransactionStoreV = ReturnType<typeof createTransactionStore>;

export const MidenSdkStoreContext = createContext<TransactionStoreV | undefined>(undefined);

export interface Props {
  children: ReactNode;
}

export const TransactionProviderC = ({ children }: Props) => {
  const storeRef = useRef<TransactionStoreV | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createTransactionStore();
  }

  return <MidenSdkStoreContext.Provider value={storeRef.current}>{children}</MidenSdkStoreContext.Provider>;
};

export const useTransactionStore = <T,>(selector: (store: TransactionStore) => T): T => {
  const midenSdkStoreContext = useContext(MidenSdkStoreContext);

  if (!midenSdkStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`);
  }

  return useStore(midenSdkStoreContext, selector);
};
