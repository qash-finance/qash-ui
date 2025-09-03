import { AssetWithMetadata } from "./faucet";

export interface CreateRequestPaymentDto {
  payer: string;
  payee: string;
  amount: string;
  tokens: AssetWithMetadata[];
  message: string;
}

export enum RequestPaymentStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DENIED = "DENIED",
}

export interface RequestPayment {
  id: number;
  payer: string;
  payee: string;
  amount: string;
  tokens: AssetWithMetadata[];
  message: string;
  status: RequestPaymentStatus;
  isGroupPayment: boolean;
  txid: string;
  groupPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}
