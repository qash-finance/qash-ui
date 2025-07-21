import { AccountId, NoteType } from "@demox-labs/miden-sdk";
import { useClient } from "../../hooks/web3/useClient";

async function randomSerialNumbers() {
  const { Felt } = await import("@demox-labs/miden-sdk");
  const serialNumber1 = Math.floor(Math.random() * 1000000);
  const serialNumber2 = Math.floor(Math.random() * 1000000);
  const serialNumber3 = Math.floor(Math.random() * 1000000);
  const serialNumber4 = Math.floor(Math.random() * 1000000);
  return [
    new Felt(BigInt(serialNumber1)),
    new Felt(BigInt(serialNumber2)),
    new Felt(BigInt(serialNumber3)),
    new Felt(BigInt(serialNumber4)),
  ];
}

export async function createP2IDNote(
  sender: AccountId,
  receiver: AccountId,
  faucet: AccountId,
  amount: number,
  noteType: NoteType,
) {
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt } = await import("@demox-labs/miden-sdk");

  const serialNumbers = await randomSerialNumbers();

  return OutputNote.full(
    Note.createP2IDNote(
      sender,
      receiver,
      new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]),
      noteType,
      Word.newFromFelts(serialNumbers),
      new Felt(BigInt(0)),
    ),
  );
}

export async function createP2IDRNote(
  sender: AccountId,
  receiver: AccountId,
  faucet: AccountId,
  amount: number,
  noteType: NoteType,
  recallHeight: number,
) {
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt } = await import("@demox-labs/miden-sdk");

  const serialNumbers = await randomSerialNumbers();

  return OutputNote.full(
    Note.createP2IDRNote(
      sender,
      receiver,
      new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]),
      noteType,
      Word.newFromFelts(serialNumbers),
      recallHeight,
      new Felt(BigInt(0)),
    ),
  );
}

export async function consumeAllNotes(accountId: string, noteIds: string[]) {
  const { getClient } = useClient();
  try {
    const client = await getClient();
    const { AccountId } = await import("@demox-labs/miden-sdk");
    const consumeTxRequest = client.newConsumeTransactionRequest(noteIds);
    const txResult = await client.newTransaction(AccountId.fromHex(accountId), consumeTxRequest);
    await client.submitTransaction(txResult);
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function getConsumableNotes(accountId: string) {
  const { getClient } = useClient();

  try {
    const client = await getClient();

    const notes = await client.getConsumableNotes(AccountId.fromHex(accountId));
    return notes;
  } catch (error) {
    throw new Error("Failed to fetch consumable notes");
  }
}
