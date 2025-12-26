export async function getBalance(address: string) {
  const { WebClient, Address, NetworkId } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(); // default endpoint is tesnet
  await client.syncState();

  const account = await client.getAccount(
    Address.fromBech32(address).accountId()
  );
  if (!account) {
    throw new Error("Account not found");
  }
  await client.terminate();
  return account
    .vault()
    .fungibleAssets()
    .map((asset) => ({
      assetId: Address.fromAccountId(asset.faucetId()).toBech32(NetworkId.Testnet),
      balance: (Number(asset.amount()) / 1e8).toString(),
    }));
}
