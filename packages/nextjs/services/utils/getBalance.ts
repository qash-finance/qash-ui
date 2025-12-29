import { importAndGetAccount } from "./miden/account";
import { QASH_TOKEN_ADDRESS, QASH_TOKEN_SYMBOL, QASH_TOKEN_DECIMALS, QASH_TOKEN_MAX_SUPPLY } from "./constant";

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ]);
}

export async function getBalance(client: import("@demox-labs/miden-sdk").WebClient, address: string) {
  const { Address, BasicFungibleFaucetComponent, NetworkId } = await import("@demox-labs/miden-sdk");

  // Add timeout to syncState to prevent hanging
  await withTimeout(client.syncState(), 30000, "Timeout: syncState took longer than 30 seconds");

  const account = await client.getAccount(Address.fromBech32(address).accountId());
  if (!account) {
    throw new Error("Account not found");
  }

  const assets = account.vault().fungibleAssets();

  // Fetch metadata for each asset independently with error handling
  // Use allSettled so one failure doesn't block others
  const assetsWithMetadata = await Promise.allSettled(
    assets.map(async asset => {
      const faucetId = Address.fromAccountId(asset.faucetId()).toBech32(NetworkId.Testnet);

      try {
        // Add timeout to prevent hanging (30 seconds per asset)
        const faucetAccount = await withTimeout(
          importAndGetAccount(client, faucetId),
          30000,
          `Timeout: Failed to import/get faucet account ${faucetId} within 30 seconds`,
        );

        if (!faucetAccount) {
          throw new Error(`Faucet account not found: ${faucetId}`);
        }

        const metadata = await BasicFungibleFaucetComponent.fromAccount(faucetAccount);

        return {
          assetId: faucetId,
          balance: (Number(asset.amount()) / Math.pow(10, metadata.decimals())).toString(),
          decimals: metadata.decimals(),
          maxSupply: metadata.maxSupply().toString(),
          symbol: metadata.symbol().toString(),
        };
      } catch (error) {
        console.error(`Failed to fetch metadata for asset ${faucetId}:`, error);
        // If this is the QASH token, use known constants instead of UNKNOWN
        if (faucetId === QASH_TOKEN_ADDRESS) {
          return {
            assetId: faucetId,
            balance: (Number(asset.amount()) / Math.pow(10, QASH_TOKEN_DECIMALS)).toString(),
            decimals: QASH_TOKEN_DECIMALS,
            maxSupply: QASH_TOKEN_MAX_SUPPLY.toString(),
            symbol: QASH_TOKEN_SYMBOL,
          };
        }
        // Return a fallback object so we still show the asset with basic info
        return {
          assetId: faucetId,
          balance: (Number(asset.amount()) / Math.pow(10, 8)).toString(), // Default to 8 decimals
          decimals: 8,
          maxSupply: "0",
          symbol: "UNKNOWN",
        };
      }
    }),
  );

  // Filter out failed promises and extract values
  const balances = assetsWithMetadata
    .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
    .map(result => result.value);

  // Ensure QASH token is always present
  const qashTokenIndex = balances.findIndex(asset => asset.assetId === QASH_TOKEN_ADDRESS);

  if (qashTokenIndex >= 0) {
    // QASH token exists, always ensure it has correct metadata (even if it was set to "UNKNOWN" due to fetch failure)
    const qashToken = balances[qashTokenIndex];
    balances[qashTokenIndex] = {
      ...qashToken,
      symbol: QASH_TOKEN_SYMBOL,
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY.toString(),
    };
  } else {
    // QASH token doesn't exist, add it with balance 0
    balances.push({
      assetId: QASH_TOKEN_ADDRESS,
      balance: "0",
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY.toString(),
      symbol: QASH_TOKEN_SYMBOL,
    });
  }

  return balances;
}
