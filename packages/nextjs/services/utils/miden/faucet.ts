"use client";
import { importAndGetAccount } from "./account";
import { FaucetMetadata } from "@/types/faucet";
import { NODE_ENDPOINT } from "../constant";

/// @param symbol can't exceed 6 characters
/// @param decimals can't exceed 12
export async function deployFaucet(symbol: string, decimals: number, maxSupply: number): Promise<any> {
  try {
    const { AccountStorageMode, WebClient } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(NODE_ENDPOINT);
    const faucet = await client.newFaucet(AccountStorageMode.public(), false, symbol, decimals, BigInt(maxSupply), 1);
    return faucet;
  } catch (err) {
    throw new Error("Failed to deploy faucet");
  }
}

// export async function mintToken(account: string, faucet: string, amount: bigint): Promise<any> {
//   try {
//     const { NoteType, WebClient, AccountId, Address, NetworkId } = await import("@demox-labs/miden-sdk");

//     const client = await WebClient.createClient(NODE_ENDPOINT);

//     const accountId = Address.fromBech32(account);
//     const faucetId = Address.fromBech32(faucet);

//     // import faucet
//     const faucetAccount = await importAndGetAccount(faucetId.toBech32(NetworkId.Testnet));

//     const mintTxRequest = client.newMintTransactionRequest(
//       accountId.accountId(),
//       faucetId.accountId(),
//       NoteType.Public,
//       amount,
//     );
//     const txResult = await client.submitNewTransaction(faucetId.accountId(), mintTxRequest);
//     return txResult;
//   } catch (err) {
//     console.log(err);
//     throw new Error("Failed to mint token");
//   }
// }

function decodeFeltToSymbol(encodedFelt: number): string {
  const TokenSymbol = {
    MAX_ENCODED_VALUE: 0xffffffffffff, // Example max value
    ALPHABET_LENGTH: 26, // A-Z (26 letters)
    MAX_SYMBOL_LENGTH: 5, // Example maximum length for token symbols
  };

  // Check if the encoded value is within the valid range
  if (encodedFelt > TokenSymbol.MAX_ENCODED_VALUE) {
    return `Error: Value ${encodedFelt} is too large`;
  }

  let decodedString = "";
  let remainingValue = encodedFelt;

  // Get the token symbol length
  const tokenLen = remainingValue % TokenSymbol.ALPHABET_LENGTH;
  if (tokenLen === 0 || tokenLen > TokenSymbol.MAX_SYMBOL_LENGTH) {
    return `Error: Invalid token length: ${tokenLen}`;
  }
  remainingValue = Math.floor(remainingValue / TokenSymbol.ALPHABET_LENGTH);

  for (let i = 0; i < tokenLen; i++) {
    const digit = remainingValue % TokenSymbol.ALPHABET_LENGTH;
    const char = String.fromCharCode(digit + 65); // 'A' is 65 in ASCII
    decodedString = char + decodedString; // Insert at the start to reverse the order
    remainingValue = Math.floor(remainingValue / TokenSymbol.ALPHABET_LENGTH);
  }

  // Return an error if some data still remains after specified number of characters
  if (remainingValue !== 0) {
    return "Error: Data not fully decoded";
  }

  return decodedString;
}

const faucetMetadataCache = new Map<string, Promise<FaucetMetadata>>();

export const getFaucetMetadata = async (
  client: import("@demox-labs/miden-sdk").WebClient,
  faucetId: string,
): Promise<FaucetMetadata> => {
  const faucetIdStr = faucetId.toString();

  // Check if we already have this metadata cached or being fetched
  if (faucetMetadataCache.has(faucetIdStr)) {
    return faucetMetadataCache.get(faucetIdStr)!;
  }

  // Create a promise for this metadata fetch
  const metadataPromise = (async () => {
    const faucet = await importAndGetAccount(client, faucetId);

    // read slot 0

    // first we check if storage 2 have things, if have, then we read storage 2
    let storageItem = faucet.storage().getItem(2);

    if (!storageItem) {
      storageItem = faucet.storage().getItem(1);
    }

    if (!storageItem) {
      throw new Error("No storage item at key 0");
    }

    const valueWord = storageItem.toHex();

    const hex = valueWord.slice(2); // Remove '0x' prefix
    const reversed = hex.match(/.{2}/g)!.reverse(); // Split into pairs and reverse them

    // Create an array of 4 elements, each 32 bits (4 bytes) in size
    const array = [];
    for (let i = 0; i < 4; i++) {
      const startIndex = i * 8; // Each element is 8 hex digits (4 bytes)
      const slice = reversed.slice(startIndex, startIndex + 8).join(""); // Join pairs for each element
      array.push(parseInt(slice, 16)); // Convert the slice from hex to a number
    }

    let val = array[1];

    let symbol = decodeFeltToSymbol(val);

    let maxSupply = array[3];
    let decimals = array[2];

    return {
      symbol: typeof symbol === "string" ? symbol : "ERROR",
      decimals,
      maxSupply,
    };
  })();

  // Cache the promise to prevent duplicate calls
  faucetMetadataCache.set(faucetIdStr, metadataPromise);

  return metadataPromise;
};
