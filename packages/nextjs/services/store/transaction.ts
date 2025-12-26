/// the transaction store
"use client";

import { QASH_TOKEN_ADDRESS as FAUCET_ID } from "../utils/constant";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface UITransaction {
  id: string;
  type: "Incoming" | "Outgoing" | "Faucet";
  assets: {
    assetId: string;
    amount: bigint;
  }[];
  blockNumber: string;
  sender: string;
  recipient: string;
  status: "isCommited" | "isPending" | "isFailed";
  amount: string;
}

export interface TransactionStore {
  loading: boolean;
  transactions: UITransaction[];
  loadTransactions: (record: { tr: any; inputNote: any | undefined }[]) => Promise<void>;
  clearTransactions: () => void;
}

async function transactionRecordToUITransaction({
  tr,
  inputNote,
}: {
  tr: any;
  inputNote: any | undefined;
}): Promise<UITransaction> {
  const { AccountId, NetworkId, AccountInterface, Address } = await import("@demox-labs/miden-sdk");

  const assets: {
    assetId: string;
    amount: bigint;
  }[] = [];

  if (inputNote === undefined || inputNote.length === 0) {
    const outputNotes = tr
      .outputNotes()
      .notes()
      .map((note: any) => note.intoFull());
    outputNotes.forEach((note: any) => {
      const fungibleAssets: any[] = note.assets().fungibleAssets();
      fungibleAssets.forEach((asset: any) => {
        assets.push({
          assetId: asset.faucetId().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet),
          amount: asset.amount(),
        });
      });
    });

    const recipientNote: string[] = outputNotes.map((note: any) => {
      return note.id().toString();
    });

    const statusObject = tr.transactionStatus();
    const sender = tr.accountId().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet);

    const result: UITransaction = {
      id: tr.id().toHex(),
      type: "Outgoing",
      assets,
      sender,
      recipient: recipientNote[0],
      blockNumber: tr.blockNum().toString(),
      status: statusObject.isCommitted() ? "isCommited" : statusObject.isPending() ? "isPending" : "isFailed",
      amount: assets[0].amount.toString(),
    };

    return result;
  } else {
    if (!inputNote) {
      throw new Error("Input notes do not match transaction input note nullifiers");
    }

    inputNote.forEach((note: any) => {
      const fungibleAssets = note.details().assets().fungibleAssets();
      fungibleAssets.forEach((asset: any) => {
        assets.push({
          assetId: asset.faucetId().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet),
          amount: asset.amount(),
        });
      });
    });

    const statusObject = tr.transactionStatus();
    const consumer = tr.accountId().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet);

    let transactionType: "Incoming" | "Outgoing" | "Faucet" = "Incoming";
    let sender: string = "";

    if (inputNote[0].metadata()?.sender().toString() === Address.fromBech32(FAUCET_ID).toString()) {
      transactionType = "Faucet";
      sender = FAUCET_ID;
    } else {
      transactionType = "Incoming";
      sender = AccountId.fromHex(inputNote[0].metadata().sender().toString()).toBech32(
        NetworkId.Testnet,
        AccountInterface.BasicWallet,
      );
    }

    const result: UITransaction = {
      id: tr.id().toHex(),
      type: transactionType,
      assets,
      sender: sender,
      recipient: consumer,
      blockNumber: tr.blockNum().toString(),
      status: statusObject.isCommitted() ? "isCommited" : statusObject.isPending() ? "isPending" : "isFailed",
      amount: assets[0].amount.toString(),
    };

    return result;
  }
}

export const createTransactionStore = () =>
  create<TransactionStore, [["zustand/immer", never]]>(
    immer(set => ({
      loading: false,
      transactions: [],
      loadTransactions: async record => {
        set({ loading: true });
        try {
          const transactions: UITransaction[] = await Promise.all(
            record.map(record => transactionRecordToUITransaction(record)),
          );
          transactions.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
          set({ transactions });
        } catch (error) {
          console.error("Error loading transactions:", error);
        } finally {
          set({ loading: false });
        }
      },
      clearTransactions: () => {
        set({ transactions: [], loading: false });
      },
    })),
  );
