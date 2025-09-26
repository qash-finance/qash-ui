import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CustomNoteType } from "@/types/note";
import { FaucetMetadata } from "@/types/faucet";

export interface BatchTransaction {
  id: string;
  tokenMetadata: FaucetMetadata;
  tokenAddress: string;
  amount: string;
  recipient: string;
  recipientName?: string;
  isPrivate: boolean;
  recallableHeight: number;
  recallableTime: number;
  noteType: CustomNoteType;
  message?: string;
  pendingRequestId?: number;
  createdAt: string; // Store as ISO string
  timelockHeight?: number;
}

interface BatchTransactionStorage {
  [walletAddress: string]: BatchTransaction[];
}

interface BatchTransactionState {
  transactions: BatchTransactionStorage;
  addTransaction: (walletAddress: string, transaction: Omit<BatchTransaction, "id" | "createdAt">) => void;
  removeTransaction: (walletAddress: string, transactionId: string) => void;
  duplicateTransaction: (walletAddress: string, transactionId: string) => void;
  editTransaction: (
    walletAddress: string,
    transactionId: string,
    updates: Partial<Omit<BatchTransaction, "id" | "createdAt">>,
  ) => void;
  clearBatch: (walletAddress: string) => void;
  getBatchTransactions: (walletAddress: string) => (Omit<BatchTransaction, "createdAt"> & { createdAt: Date })[];
  getBatchCount: (walletAddress: string) => number;
}

export const useBatchTransactions = create<BatchTransactionState>()(
  persist(
    (set, get) => ({
      transactions: {},

      addTransaction: (walletAddress, transaction) => {
        const newTransaction: BatchTransaction = {
          ...transaction,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          transactions: {
            ...state.transactions,
            [walletAddress]: [...(state.transactions[walletAddress] || []), newTransaction],
          },
        }));
      },

      removeTransaction: (walletAddress, transactionId) => {
        set(state => ({
          transactions: {
            ...state.transactions,
            [walletAddress]: (state.transactions[walletAddress] || []).filter(tx => tx.id !== transactionId),
          },
        }));
      },

      duplicateTransaction: (walletAddress, transactionId) => {
        const transactions = get().transactions[walletAddress] || [];
        const transactionToDuplicate = transactions.find(tx => tx.id === transactionId);

        if (transactionToDuplicate) {
          const duplicatedTransaction: BatchTransaction = {
            ...transactionToDuplicate,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };

          set(state => ({
            transactions: {
              ...state.transactions,
              [walletAddress]: [...(state.transactions[walletAddress] || []), duplicatedTransaction],
            },
          }));
        }
      },

      editTransaction: (walletAddress, transactionId, updates) => {
        set(state => ({
          transactions: {
            ...state.transactions,
            [walletAddress]: (state.transactions[walletAddress] || []).map(tx =>
              tx.id === transactionId ? { ...tx, ...updates } : tx,
            ),
          },
        }));
      },

      clearBatch: walletAddress => {
        set(state => {
          const { [walletAddress]: _, ...rest } = state.transactions;
          return { transactions: rest };
        });
      },

      getBatchTransactions: walletAddress => {
        const transactions = get().transactions[walletAddress] || [];
        return transactions.map(tx => ({
          ...tx,
          createdAt: new Date(tx.createdAt),
        }));
      },

      getBatchCount: walletAddress => {
        return get().transactions[walletAddress]?.length || 0;
      },
    }),
    {
      name: "miden-batch-transactions",
    },
  ),
);
