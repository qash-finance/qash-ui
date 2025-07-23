import { AssetWithMetadata } from "./faucet";

export enum NoteType {
  P2ID = "p2id",
  P2IDR = "p2idr",
  GIFT = "gift",
}

export interface AssetDto {
  faucetId: string;
  amount: string;
}

export interface SendTransactionDto {
  recipient: string;
  assets: AssetDto[];
  private: boolean;
  recallable: boolean;
  recallableTime?: Date;
  serialNumber: number[];
  noteType: NoteType;
}

export interface ConsumableNote {
  id: string;
  sender: string;
  recipient: string;
  assets: AssetWithMetadata[];
}

export interface RecallItem {
  type: "transaction" | "gift";
  id: number;
}

export interface RecallRequestDto {
  items: RecallItem[];
}
