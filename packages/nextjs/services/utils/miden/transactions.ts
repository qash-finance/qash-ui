import {
  AccountId,
  NoteAndArgsArray,
  OutputNotesArray,
  TransactionRequestBuilder,
  WebClient,
} from "@demox-labs/miden-sdk";
import { NODE_ENDPOINT } from "../constant";

export async function submitTransactionWithOwnOutputNotes(notes: OutputNotesArray, sender: AccountId): Promise<string> {
  const client = await WebClient.createClient(NODE_ENDPOINT);

  const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(notes).build();
  const txResult = await client.newTransaction(sender, transactionRequest);
  const txResultId = txResult.executedTransaction().id().toHex();
  await client.submitTransaction(txResult);

  // wait 5 seconds then sync account state
  setTimeout(async () => {
    await client.syncState();
  }, 5000);

  return txResultId;
}

export async function submitTransactionWithOwnInputNotes(notes: NoteAndArgsArray, sender: AccountId): Promise<string> {
  const client = await WebClient.createClient(NODE_ENDPOINT);

  const transactionRequest = new TransactionRequestBuilder().withUnauthenticatedInputNotes(notes).build();
  const txResult = await client.newTransaction(sender, transactionRequest);
  const txResultId = txResult.executedTransaction().id().toHex();
  await client.submitTransaction(txResult);

  // wait 5 seconds then sync account state
  setTimeout(async () => {
    await client.syncState();
  }, 5000);

  return txResultId;
}
