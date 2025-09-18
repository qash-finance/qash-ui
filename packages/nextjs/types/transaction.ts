import { AssetWithMetadata, FaucetMetadata } from "./faucet";
import { CustomNoteType, NoteStatus } from "./note";

export enum RecallableNoteType {
  TRANSACTION = "TRANSACTION",
  GIFT = "GIFT",
  SCHEDULE_PAYMENT = "SCHEDULE_PAYMENT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  RECALLED = "RECALLED",
  CONSUMED = "CONSUMED",
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
  transactionId: string;
  requestPaymentId?: number;
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
  requestPaymentId?: number;
  timelockHeight?: number;
}

export interface RecallRequestDto {
  items: RecallItem[];
  txId: string;
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
  secretHash?: string;
}

export interface ConsumePublicTransactionDto {
  sender: string;
  recipient: string;
  amount: number;
  tokenId: string;
  tokenName: string;
  txId: string;
  requestPaymentId?: number;
  noteId: string;
}
