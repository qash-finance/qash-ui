import { useClient } from "@/hooks/web3/useClient";
import { AccountId, OutputNotesArray, TransactionRequestBuilder, TransactionResult } from "@demox-labs/miden-sdk";

export async function submitTransaction(notes: OutputNotesArray, sender: AccountId): Promise<TransactionResult> {
  const { getClient } = useClient();
  const client = await getClient();

  const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(notes).build();
  const txResult = await client.newTransaction(sender, transactionRequest);
  await client.submitTransaction(txResult);

  return txResult;
}
