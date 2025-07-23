"use client";
import { Account, AccountId, FungibleAsset } from "@demox-labs/miden-sdk";
import { useClient } from "../../../hooks/web3/useClient";
import { getFaucetMetadata } from "./faucet";
import { AssetWithMetadata, FaucetMetadata } from "@/types/faucet";

export async function deployAccount(isPublic: boolean) {
  const { getClient } = useClient();
  const client = await getClient();
  const { AccountStorageMode } = await import("@demox-labs/miden-sdk");

  const account = await client.newWallet(isPublic ? AccountStorageMode.public() : AccountStorageMode.private(), true);
  return account;
}

export async function getAccountById(accountId: string) {
  if (typeof window === "undefined") throw new Error("getAccountById can only be used in the browser");
  const { getClient } = useClient();

  try {
    const client = await getClient();
    const { AccountId } = await import("@demox-labs/miden-sdk");

    // Try to get account from client
    let id;
    if (accountId.startsWith("0x")) {
      id = AccountId.fromHex(accountId);
    } else {
      //@ts-ignore
      id = AccountId.fromBech32(accountId);
    }

    // This may need to be adjusted based on the actual Miden SDK API
    // for retrieving an existing account by ID
    const account = await client.getAccount(id);
    return account;
  } catch (error) {
    console.error("Failed to get account by ID:", error);
    throw new Error("Failed to retrieve account");
  }
}

export const getAccountAssets = async (address: string): Promise<AssetWithMetadata[]> => {
  let accountId;
  try {
    accountId = AccountId.fromBech32(address);
  } catch (error) {
    console.error("Invalid address format:", address, error);
    return [];
  }

  try {
    let account = await importAndGetAccount(accountId);

    const accountAssets: FungibleAsset[] = account.vault().fungibleAssets();

    // Process assets sequentially to avoid Rust memory aliasing issues
    const assetsWithMetadata = [];
    for (let index = 0; index < accountAssets.length; index++) {
      const asset = accountAssets[index];
      try {
        // get token metadata
        const faucet = asset.faucetId();

        const metadata = await getFaucetMetadata(faucet);
        assetsWithMetadata.push({
          tokenAddress: asset.faucetId().toBech32(),
          amount: asset.amount().toString(),
          metadata,
        });
      } catch (error) {
        console.error(`Error processing asset ${index + 1}:`, error);
        // Continue processing other assets instead of failing completely
        console.log(`Skipping asset ${index + 1} due to error`);
      }
    }

    return assetsWithMetadata;
  } catch (err) {
    console.error("Error in getAccountAssets:", err);
    return [];
  }
};

export const importAndGetAccount = async (accountId: AccountId): Promise<Account> => {
  // Create a promise for this account import
  const importPromise = (async () => {
    const { getClient } = useClient();
    const client = await getClient();

    let accountContract = await client.getAccount(accountId);
    if (!accountContract) {
      try {
        await client.importAccountById(accountId);
        await client.syncState();
        accountContract = await client.getAccount(accountId);
        if (!accountContract) {
          throw new Error(`Account not found after import: ${accountId}`);
        }
      } catch (error) {
        // Remove from cache if import failed
        throw error;
      }
    }
    return accountContract;
  })();

  return importPromise;
};
