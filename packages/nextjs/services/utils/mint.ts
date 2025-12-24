import type React from "react";

export async function createFaucetMintAndConsume(
  // client from useMiden hook
  client: import("@demox-labs/miden-sdk").WebClient,
  address: string,
  faucet: string
): Promise<string> {
  const { WebClient, AccountStorageMode, NoteType, Address } = await import(
    "@demox-labs/miden-sdk"
  );
  const newClient = await WebClient.createClient(); // default endpoint is tesnet
  await newClient.syncState();

  const faucetId = Address.fromBech32(faucet);

  await client.syncState();
  const to = await client.getAccount(Address.fromBech32(address).accountId());
  if (!to) {
    throw new Error("Account not found");
  }

  const mintTxRequest = newClient.newMintTransactionRequest(
    to.id(),
    faucetId.accountId(),
    NoteType.Public,
    BigInt(100) * BigInt(1e8)
  );

  const txHash = await newClient.submitNewTransaction(
    faucetId.accountId(),
    mintTxRequest
  );
  console.log("Mint Tx Hash:", txHash.toString());

  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log("Proceeding to consume tokens...");

  await client.syncState();
  const mintedNotes = await client.getConsumableNotes(to.id());
  const mintedNoteIds = mintedNotes.map((n) =>
    n.inputNoteRecord().id().toString()
  );
  const consumeTxRequest = client.newConsumeTransactionRequest(mintedNoteIds);
  const consumeTxHash = await client.submitNewTransaction(
    to.id(),
    consumeTxRequest
  );
  await client.syncState();

  return consumeTxHash.toHex();
}
