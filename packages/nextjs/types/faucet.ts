export interface Asset {
  tokenAddress: string;
  amount: string;
}

export interface FaucetMetadata {
  symbol: string;
  decimals: number;
  maxSupply: number;
}

export type AssetWithMetadata = Asset & { metadata: FaucetMetadata };
