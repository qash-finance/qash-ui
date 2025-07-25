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

export const AnyToken: AssetWithMetadata = {
  tokenAddress: "",
  amount: "",
  metadata: {
    symbol: "Any Token",
    decimals: 0,
    maxSupply: 0,
  },
};
