import { importAndGetAccount } from "./miden/account";

export async function createFaucetMintAndConsume(
  // client from useMiden hook
  client: import("@demox-labs/miden-sdk").WebClient,
  address: string,
  faucet: string,
): Promise<string> {
  const { WebClient, AccountStorageMode, NoteType, Address, NetworkId, AccountInterface } = await import(
    "@demox-labs/miden-sdk"
  );

  const faucetId = Address.fromBech32(faucet);

  await client.syncState();
  const to = await client.getAccount(Address.fromBech32(address).accountId());
  if (!to) {
    throw new Error("Account not found");
  }

  await importAndGetAccount(client, faucetId.toBech32(NetworkId.Testnet));

  const mintTxRequest = client.newMintTransactionRequest(
    to.id(),
    faucetId.accountId(),
    NoteType.Public,
    BigInt(100) * BigInt(1e8),
  );

  await client.submitNewTransaction(faucetId.accountId(), mintTxRequest);

  // loop until there's `getConsumableNotes`.length > 0
  while (true) {
    await client.syncState();
    const consumableNotes = await client.getConsumableNotes(to.id());
    if (consumableNotes.length > 0) {
      const mintedNotes = await client.getConsumableNotes(to.id());
      const mintedNoteIds = mintedNotes.map(n => n.inputNoteRecord().id().toString());
      const consumeTxRequest = client.newConsumeTransactionRequest(mintedNoteIds);
      const consumeTxHash = await client.submitNewTransaction(to.id(), consumeTxRequest);

      return consumeTxHash.toHex();
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
