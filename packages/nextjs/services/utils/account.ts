"use client";
import { useClient } from "../../hooks/web3/useClient";

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
