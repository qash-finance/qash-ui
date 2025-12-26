import { importAndGetAccount } from "./miden/account";

export async function getBalance(client: import("@demox-labs/miden-sdk").WebClient, address: string) {
  const { Address, BasicFungibleFaucetComponent, NetworkId } = await import("@demox-labs/miden-sdk");

  await client.syncState();

  const account = await client.getAccount(Address.fromBech32(address).accountId());
  if (!account) {
    throw new Error("Account not found");
  }

  const assets = account.vault().fungibleAssets();

  // Fetch metadata for each asset independently
  const assetsWithMetadata = await Promise.all(
    assets.map(async asset => {
      const faucetId = Address.fromAccountId(asset.faucetId()).toBech32(NetworkId.Testnet);

      // get account by id
      const faucetAccount = await importAndGetAccount(client, faucetId);

      if (!faucetAccount) {
        throw new Error("Faucet account not found");
      }

      const metadata = await BasicFungibleFaucetComponent.fromAccount(faucetAccount);

      return {
        assetId: faucetId,
        balance: (Number(asset.amount()) / Math.pow(10, metadata.decimals())).toString(),
        decimals: metadata.decimals(),
        maxSupply: metadata.maxSupply(),
        symbol: metadata.symbol(),
      };
    }),
  );

  console.log("assetsWithMetadata", assetsWithMetadata);

  return assetsWithMetadata;
}
