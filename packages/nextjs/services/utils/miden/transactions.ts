import { NODE_ENDPOINT } from "../constant";

export async function submitTransactionWithOwnOutputNotes(sender: string, notes: any[]): Promise<string> {
  try {
    const { WebClient, AccountId, OutputNotesArray, TransactionRequestBuilder } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);

    const senderId = AccountId.fromBech32(sender);

    const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(new OutputNotesArray(notes)).build();
    const txResult = await client.newTransaction(senderId, transactionRequest);
    const txResultId = txResult.executedTransaction().id().toHex();
    await client.submitTransaction(txResult);

    // wait 5 seconds then sync account state
    setTimeout(async () => {
      await client.syncState();
    }, 5000);

    return txResultId;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to submit transaction with own output notes");
  }
}

export async function submitTransactionWithOwnInputNotes(notes: any[], sender: string): Promise<string> {
  const { WebClient, AccountId, NoteAndArgsArray, TransactionRequestBuilder } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(NODE_ENDPOINT);
  const senderId = AccountId.fromBech32(sender);

  const transactionRequest = new TransactionRequestBuilder()
    .withUnauthenticatedInputNotes(new NoteAndArgsArray(notes))
    .build();
  const txResult = await client.newTransaction(senderId, transactionRequest);
  const txResultId = txResult.executedTransaction().id().toHex();
  await client.submitTransaction(txResult);

  // wait 5 seconds then sync account state
  setTimeout(async () => {
    await client.syncState();
  }, 5000);

  return txResultId;
}
