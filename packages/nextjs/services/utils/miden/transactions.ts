import { NODE_ENDPOINT } from "../constant";

export async function submitTransactionWithOwnOutputNotes(sender: string, notes: any[]): Promise<string> {
  try {
    const { WebClient, Address, OutputNotesArray, TransactionRequestBuilder } = await import("@demox-labs/miden-sdk");
    const { OutputNoteArray } = (await import("@demox-labs/miden-sdk")) as any;
    const client = await WebClient.createClient(NODE_ENDPOINT);

    const senderId = Address.fromBech32(sender);

    const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(new OutputNoteArray(notes)).build();
    const txResultId = await client.submitNewTransaction(senderId.accountId(), transactionRequest);

    // wait 5 seconds then sync account state
    setTimeout(async () => {
      await client.syncState();
    }, 5000);

    return txResultId.toHex();
  } catch (error) {
    console.log(error);
    throw new Error("Failed to submit transaction with own output notes");
  }
}

export async function submitTransactionWithOwnInputNotes(notes: any[], sender: string): Promise<string> {
  const { WebClient, Address, NoteAndArgsArray, TransactionRequestBuilder } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(NODE_ENDPOINT);
  const senderId = Address.fromBech32(sender);

  const transactionRequest = new TransactionRequestBuilder()
    .withUnauthenticatedInputNotes(new NoteAndArgsArray(notes))
    .build();

  const txResult = await client.submitNewTransaction(senderId.accountId(), transactionRequest);
  const txResultId = txResult.toHex();

  // wait 5 seconds then sync account state
  setTimeout(async () => {
    await client.syncState();
  }, 5000);

  return txResultId;
}
