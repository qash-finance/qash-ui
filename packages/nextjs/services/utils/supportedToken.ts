import {QASH_TOKEN_ADDRESS, QASH_TOKEN_DECIMALS, QASH_TOKEN_MAX_SUPPLY, QASH_TOKEN_SYMBOL} from "./constant";

export const supportedTokens = [
    {
        faucetId: QASH_TOKEN_ADDRESS,
        symbol: QASH_TOKEN_SYMBOL,
        decimals: QASH_TOKEN_DECIMALS,
        maxSupply: QASH_TOKEN_MAX_SUPPLY,
    },
    {
        faucetId: "mtst1ar622a5ugydszgqzl7x430zdysp95h8j",
        symbol: "PARA",
        decimals: 8,
        maxSupply: 10000000000,
    },
{
        faucetId: "mtst1ap2t7nsjausqsgrswk9syfzkcu328yna",
        symbol: "MID",
        decimals: 8,
        maxSupply: 10000000000,
    }
]