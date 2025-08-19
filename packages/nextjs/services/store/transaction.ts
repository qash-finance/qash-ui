/// the transaction store
import { QASH_TOKEN_ADDRESS as FAUCET_ID } from "../utils/constant";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface UITransaction {
  id: string;
  type: "Incoming" | "Outgoing" | "Faucet";
  amount: bigint;
  blockNumber: string;
  sender: string;
  recipient: string;
  status: "isCommited" | "isPending" | "isFailed";
}

export interface TransactionStore {
  loading: boolean;
  transactions: UITransaction[];
  loadTransactions: (record: { tr: any; inputNote: any | undefined }[]) => Promise<void>;
}

async function transactionRecordToUITransaction({
  tr,
  inputNote,
}: {
  tr: any;
  inputNote: any | undefined;
}): Promise<UITransaction> {
  const { AccountId } = await import("@demox-labs/miden-sdk");

  if (inputNote === undefined || inputNote.length === 0) {
    const outputNotes = tr
      .outputNotes()
      .notes()
      .map((note: any) => note.intoFull());
    const amount = outputNotes.reduce((acc: bigint, note: any) => {
      const fungibleAssets = note
        ?.assets()
        .fungibleAssets()
        .filter((asset: any) => asset.faucetId().toBech32() === FAUCET_ID);
      return acc + (fungibleAssets?.reduce((sum: bigint, asset: any) => sum + asset.amount(), BigInt(0)) || BigInt(0));
    }, BigInt(0));
    console.log("🚀 ~ transactionRecordToUITransaction ~ outputNotes:", outputNotes);

    const recipientNote: string[] = outputNotes.map((note: any) => {
      return note.id().toString();
    });

    const statusObject = tr.transactionStatus();
    const sender = tr.accountId().toBech32();

    const result: UITransaction = {
      id: tr.id().toHex(),
      type: "Outgoing",
      amount,
      sender,
      recipient: recipientNote[0],
      blockNumber: tr.blockNum().toString(),
      status: statusObject.isCommitted() ? "isCommited" : statusObject.isPending() ? "isPending" : "isFailed",
    };

    return result;
  } else {
    if (!inputNote) {
      throw new Error("Input notes do not match transaction input note nullifiers");
    }

    const amount = inputNote.reduce((acc: bigint, note: any) => {
      const fungibleAssets = note
        .details()
        .assets()
        .fungibleAssets()
        .filter((asset: any) => asset.faucetId().toBech32() === FAUCET_ID);
      return acc + fungibleAssets.reduce((sum: bigint, asset: any) => sum + asset.amount(), BigInt(0));
    }, BigInt(0));

    const statusObject = tr.transactionStatus();
    const consumer = tr.accountId().toBech32();

    let transactionType: "Incoming" | "Outgoing" | "Faucet" = "Incoming";
    let sender: string = "";

    if (inputNote[0].metadata()?.sender().toString() === AccountId.fromBech32(FAUCET_ID).toString()) {
      transactionType = "Faucet";
      sender = FAUCET_ID;
    } else {
      transactionType = "Incoming";
      sender = AccountId.fromHex(inputNote[0].metadata().sender().toString()).toBech32();
    }

    const result: UITransaction = {
      id: tr.id().toHex(),
      type: transactionType,
      amount: amount,
      sender: sender,
      recipient: consumer,
      blockNumber: tr.blockNum().toString(),
      status: statusObject.isCommitted() ? "isCommited" : statusObject.isPending() ? "isPending" : "isFailed",
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
    })),
  );
