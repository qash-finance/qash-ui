import { AssetWithMetadata, FaucetMetadata } from "./faucet";
import { CustomNoteType, NoteStatus } from "./note";

export enum NoteType {
  P2ID = "p2id",
  P2IDR = "p2idr",
  GIFT = "gift",
}

export enum RecallableNoteType {
  TRANSACTION = "transaction",
  GIFT = "gift",
}

export interface AssetDto {
  faucetId: string;
  amount: string;
  metadata: FaucetMetadata;
}

export interface SendTransactionDto {
  recipient: string;
  assets: AssetDto[];
  private: boolean;
  recallable: boolean;
  recallableTime: Date;
  recallableHeight: number;
  serialNumber: string[];
  noteType: CustomNoteType;
  noteId: string;
}

export interface ConsumableNote {
  id: string;
  noteId: string;
  noteType: string;
  private: boolean;
  recallable: boolean;
  recallableHeight: number;
  recallableTime: string;
  recipient: string;
  sender: string;
  serialNumber: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  assets: AssetWithMetadata[];
}

export interface RecallRequestDto {
  items: RecallItem[];
}

export interface RecallItem {
  type: RecallableNoteType;
  id: number;
}

export interface RecallableDashboard {
  nextRecallTime: Date;
  recalledCount: number;
  recallableItems: RecallableNote[];
  waitingToRecallItems: RecallableNote[];
}

export interface RecallableNote {
  id: number;
  assets: AssetDto[];
  createdAt: string;
  updatedAt: string;
  isGift: boolean;
  noteId: string;
  noteType: string;
  private: boolean;
  recallable: boolean;
  recallableHeight: number;
  recallableTime: string;
  recipient: string;
  sender: string;
  serialNumber: string[];
  status: NoteStatus;
}
