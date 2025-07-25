import { useClient } from "@/hooks/web3/useClient";
import {
  AccountId,
  NoteAndArgsArray,
  OutputNotesArray,
  TransactionRequestBuilder,
  TransactionResult,
} from "@demox-labs/miden-sdk";

export async function submitTransactionWithOwnOutputNotes(notes: OutputNotesArray, sender: AccountId): Promise<string> {
  const { getClient } = useClient();
  const client = await getClient();

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
  const { getClient } = useClient();
  const client = await getClient();

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
