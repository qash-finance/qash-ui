export interface Asset {
  faucetId: string;
  amount: string;
}

export interface FaucetMetadata {
  symbol: string;
  decimals: number;
  maxSupply: number;
}

export type AssetWithMetadata = Asset & { metadata: FaucetMetadata };

export type PartialConsumableNote = {
  id: string;
  sender: string;
  recipient: string;
  private: boolean;
  assets: AssetWithMetadata[];
  recallableHeight: number;
  recallableTime: string;
  serialNumber: string[];
  requestPaymentId?: number;
};

export const AnyToken: AssetWithMetadata = {
  faucetId: "",
  amount: "",
  metadata: {
    symbol: "Any Token",
    decimals: 0,
    maxSupply: 0,
  },
};
