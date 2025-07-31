"use client";
import { getFaucetMetadata } from "./faucet";
import { AssetWithMetadata } from "@/types/faucet";
import { NODE_ENDPOINT } from "../constant";

export async function deployAccount(isPublic: boolean) {
  const { AccountStorageMode, WebClient } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(NODE_ENDPOINT);
  const account = await client.newWallet(isPublic ? AccountStorageMode.public() : AccountStorageMode.private(), true);
  return account;
}

export async function getAccountById(accountId: string) {
  if (typeof window === "undefined") throw new Error("getAccountById can only be used in the browser");

  try {
    const { AccountId, WebClient } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);

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
  try {
    let account = await importAndGetAccount(address);

    const accountAssets = account.vault().fungibleAssets();

    // Process assets sequentially to avoid Rust memory aliasing issues
    const assetsWithMetadata = [];
    for (let index = 0; index < accountAssets.length; index++) {
      const asset = accountAssets[index];
      try {
        // get token metadata
        const faucet = asset.faucetId();

        const metadata = await getFaucetMetadata(faucet.toBech32());
        assetsWithMetadata.push({
          faucetId: asset.faucetId().toBech32(),
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

export const importAndGetAccount = async (account: string): Promise<any> => {
  const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");

  // Create a promise for this account import
  const importPromise = (async () => {
    const client = await WebClient.createClient(NODE_ENDPOINT);

    const accountId = AccountId.fromBech32(account);

    let accountContract = await client.getAccount(accountId);

    if (!accountContract) {
      console.log("I THINK WE FAILED HERE", accountContract);

      try {
        await client.importAccountById(accountId);
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

export const getAccounts = async () => {
  const { WebClient } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(NODE_ENDPOINT);

  const accounts = await client.getAccounts();

  // for each account, we use getAccount, if fail, means we dont own the account
  const accountsWeOwn = await Promise.all(
    accounts.filter(async account => {
      try {
        const readAccount = await client.getAccount(account.id());
        if (!readAccount) {
          return false;
        }
        return true;
      } catch (error) {
        return false;
      }
    }),
  );

  return accountsWeOwn.map(account => account.id().toBech32());
};

export const exportAccounts = async () => {
  try {
    const { WebClient } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);

    const store = await client.exportStore();
    return store;
  } catch (error) {
    console.error("Failed to export account:", error);
    throw new Error("Failed to export account");
  }
};

export const importAccount = async (store: string) => {
  const { WebClient } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(NODE_ENDPOINT);
  await client.forceImportStore(store);
};
