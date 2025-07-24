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
