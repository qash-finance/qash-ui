import { AssetWithMetadata } from "./faucet";
import { CustomNoteType } from "./note";

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
  assets: AssetDto[];
  private: boolean;
  recipient: string;
  recallable: boolean;
  recallableTime?: Date;
  serialNumber: number[];
  noteType: CustomNoteType;
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
