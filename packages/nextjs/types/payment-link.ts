export enum PaymentLinkStatus {
  ACTIVE = "ACTIVE",
  DEACTIVATED = "DEACTIVATED",
}

export interface TokenMetadata {
  symbol: string;
  decimals: number;
  address: string;
  name: string;
}

export interface ChainMetadata {
  chainId: string;
  name: string;
}

export interface CreatePaymentLink {
  title: string;
  description: string;
  amount: string;
  paymentWalletAddress: string;
  acceptedTokens?: TokenMetadata[];
  acceptedChains?: ChainMetadata[];
}

export interface UpdatePaymentLink {
  title?: string;
  description?: string;
  amount?: string;
  status?: PaymentLinkStatus;
  acceptedTokens?: TokenMetadata[];
  acceptedChains?: ChainMetadata[];
}

export interface PaymentRecordDTO {
  payer: string;
  txid?: string;
  token?: TokenMetadata;
  chain?: ChainMetadata;
}

export interface PaymentLinkRecord {
  id: number;
  payer: string;
  txid?: string;
  token?: TokenMetadata;
  chain?: ChainMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLink {
  id: number;
  code: string;
  title: string;
  description: string;
  amount: string;
  paymentWalletAddress: string;
  status: PaymentLinkStatus;
  order: number;
  acceptedTokens?: TokenMetadata[];
  acceptedChains?: ChainMetadata[];
  records?: PaymentLinkRecord[];
  company: {
    companyName: string;
    metadata?: Record<string, any>;
  }
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLinkOrder {
  linkIds: number[];
}
