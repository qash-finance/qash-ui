"use client";

import { PartialConsumableNote } from "@/types/faucet";
import { GIFT_NOTE_SCRIPT, NODE_ENDPOINT } from "../constant";
import { BatchTransaction } from "@/services/store/batchTransactions";
import { WrappedNoteType } from "@/types/note";

// **************** GET METHODS ********************

export async function getConsumableNotes(accountId: string) {
  try {
    const { WebClient, Address } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);

    const notes = await client.getConsumableNotes(Address.fromBech32(accountId).accountId());

    return notes;
  } catch (error) {
    console.log("ERROR GETTING CONSUMABLE NOTES", error);
    throw new Error("Failed to fetch consumable notes");
  }
}

// **************** CREATE METHODS ********************

export async function createP2IDNote(
  sender: string,
  receiver: string,
  faucet: string,
  amount: number,
  noteType: WrappedNoteType,
) {
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt, AccountId, NoteType, Address } = await import(
    "@demox-labs/miden-sdk"
  );

  return OutputNote.full(
    Note.createP2IDNote(
      Address.fromBech32(sender).accountId(),
      Address.fromBech32(receiver).accountId(),
      new NoteAssets([new FungibleAsset(Address.fromBech32(faucet).accountId(), BigInt(amount))]),
      noteType == WrappedNoteType.PUBLIC ? NoteType.Public : NoteType.Private,
      new Felt(BigInt(0)),
    ),
  );
}

export async function createP2IDENote(
  sender: string,
  receiver: string,
  faucet: string,
  amount: number,
  noteType: WrappedNoteType,
  recallHeight: number,
): Promise<[any, string[], number]> {
  try {
    const { OutputNote, WebClient } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);
    const serialNumbers = await randomSerialNumbers();
    const serialNumbersCopy = serialNumbers.map(felt => felt.toString());

    // get current height
    const currentHeight = await client.getSyncHeight();
    recallHeight = currentHeight + recallHeight;

    const note = await customCreateP2IDENote(
      sender,
      receiver,
      amount,
      faucet,
      recallHeight,
      0,
      noteType,
      0,
      serialNumbers,
    );

    return [OutputNote.full(note), serialNumbersCopy, recallHeight];
  } catch (error) {
    throw new Error("Failed to create P2IDENote");
    console.log(error);
  }
}

export async function consumeAllUnauthenticatedNotes(
  account: string,
  notes: {
    isPrivate: boolean;
    noteId: string;
    partialNote?: PartialConsumableNote;
  }[],
) {
  try {
    const { WebClient, Address, Felt, NoteAndArgs, Note, TransactionRequestBuilder, NoteAndArgsArray } = await import(
      "@demox-labs/miden-sdk"
    );

    const client = await WebClient.createClient(NODE_ENDPOINT);

    const inputNotes = [];

    // loop through the notes
    for (const noteInfo of notes) {
      if (noteInfo.isPrivate) {
        // Create AccountId objects once and reuse them to avoid aliasing issues
        const senderAccountId = noteInfo?.partialNote?.sender!;
        const recipientAccountId = noteInfo?.partialNote?.recipient!;
        const faucetAccountId = noteInfo?.partialNote?.assets[0].faucetId!;

        const note = await customCreateP2IDENote(
          senderAccountId,
          recipientAccountId,
          Number(noteInfo?.partialNote?.assets[0].amount),
          faucetAccountId,
          noteInfo?.partialNote?.recallableHeight!,
          0,
          noteInfo?.partialNote?.private ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
          0,
          noteInfo?.partialNote?.serialNumber.map(felt => new Felt(BigInt(felt)))!,
        );
        inputNotes.push(new NoteAndArgs(note));
      } else {
        const inputNote = await client.getInputNote(noteInfo.noteId);
        const noteDetails = inputNote?.details();
        const noteAsset = noteDetails?.assets()!;
        const noteRecipient = noteDetails?.recipient()!;
        const noteMetadata = inputNote?.metadata()!;
        const note = new Note(noteAsset, noteMetadata, noteRecipient);
        inputNotes.push(new NoteAndArgs(note));
      }
    }

    const transactionRequest = new TransactionRequestBuilder()
      .withUnauthenticatedInputNotes(new NoteAndArgsArray(inputNotes))
      .build();

    const accountId = Address.fromBech32(account);

    const txResult = await client.submitNewTransaction(accountId.accountId(), transactionRequest);

    return txResult.toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumeUnauthenticatedNote(account: string, partialNote: PartialConsumableNote) {
  try {
    const { WebClient, AccountId, Felt, TransactionRequestBuilder, NoteAndArgsArray, NoteAndArgs, Address } =
      await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);

    // Create AccountId objects once and reuse them to avoid aliasing issues
    const senderAccountId = partialNote.sender;
    const recipientAccountId = partialNote.recipient;
    const faucetAccountId = partialNote.assets[0].faucetId;

    const note = await customCreateP2IDENote(
      senderAccountId,
      recipientAccountId,
      Number(partialNote.assets[0].amount),
      faucetAccountId,
      partialNote.recallableHeight,
      0,
      partialNote.private ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
      0,
      partialNote.serialNumber.map(felt => new Felt(BigInt(felt))),
    );

    const transactionRequest = new TransactionRequestBuilder()
      .withUnauthenticatedInputNotes(new NoteAndArgsArray([new NoteAndArgs(note)]))
      .build();

    const accountId = Address.fromBech32(account);


    const txResult = await client.submitNewTransaction(accountId.accountId(), transactionRequest);
    return txResult.toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumeUnauthenticatedGiftNote(
  account: string,
  note: any,
  secret: [number, number, number, number],
) {
  try {
    const { WebClient, Address, TransactionRequestBuilder, NoteAndArgsArray, NoteAndArgs, Word, Felt } = await import(
      "@demox-labs/miden-sdk"
    );

    const client = await WebClient.createClient(NODE_ENDPOINT);

    const transactionRequest = new TransactionRequestBuilder()
      .withUnauthenticatedInputNotes(
        new NoteAndArgsArray([new NoteAndArgs(note, Word.newFromFelts(secret.map(felt => new Felt(BigInt(felt)))))]),
      )
      .build();

    const accountId = Address.fromBech32(account).accountId();

    const txResult = await client.submitNewTransaction(accountId, transactionRequest);
    return txResult.toHex();
  } catch (err) {
    console.log(err);
    throw new Error("Failed to consume notes");
  }
}

export async function consumeUnauthenticatedGiftNotes(
  account: string,
  notes: any[],
  secrets: [number, number, number, number][],
) {
  try {
    const { WebClient, Address, TransactionRequestBuilder, NoteAndArgsArray, NoteAndArgs, Word, Felt } = await import(
      "@demox-labs/miden-sdk"
    );

    const client = await WebClient.createClient(NODE_ENDPOINT);

    // create notes
    let inputNotes = [];

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const secret = secrets[i];
      const noteAndArg = new NoteAndArgs(note, Word.newFromFelts(secret.map(felt => new Felt(BigInt(felt)))));
      inputNotes.push(noteAndArg);
    }

    const transactionRequest = new TransactionRequestBuilder()
      .withUnauthenticatedInputNotes(new NoteAndArgsArray(inputNotes))
      .build();

    const accountId = Address.fromBech32(account).accountId();

    const txResult = await client.submitNewTransaction(accountId, transactionRequest);
    return txResult.toHex();
  } catch (error) {
    console.log(error);
    throw new Error("Failed to consume notes");
  }
}

export async function consumeNoteByID(account: string, noteId: string) {
  try {
    const { WebClient, Address } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);
    const consumeTxRequest = client.newConsumeTransactionRequest([noteId]);

    const accountId = Address.fromBech32(account).accountId();

    const txResult = await client.submitNewTransaction(accountId, consumeTxRequest);
    return txResult.toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumeNoteByIDs(account: string, noteIds: string[]) {
  try {
    const { WebClient, Address } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);
    const consumeTxRequest = client.newConsumeTransactionRequest(noteIds);
    const accountId = Address.fromBech32(account).accountId();

    const txResult = await client.submitNewTransaction(accountId, consumeTxRequest);
    return txResult.toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function createGiftNote(
  creator: string,
  faucetId: string,
  amount: bigint,
  secret: [number, number, number, number],
  serialNumber?: [number, number, number, number],
): Promise<[any, any[]]> {
  const {
    WebClient,
    OutputNote,
    NoteType,
    NoteTag,
    AccountId,
    Address,
    Felt,
    FeltArray,
    NoteInputs,
    NoteMetadata,
    NoteExecutionHint,
    NoteRecipient,
    NoteAssets,
    Word,
    Note,
    FungibleAsset,
  } = await import("@demox-labs/miden-sdk");

  const { ScriptBuilder } = (await import("@demox-labs/miden-sdk")) as any;

  const giftNote = GIFT_NOTE_SCRIPT;

  const noteScript = ScriptBuilder.compileNoteScript(giftNote);
  const noteType = NoteType.Private;
  const giftTag = NoteTag.fromAccountId(Address.fromBech32(creator).accountId());

  // hash the secret
  const secretFelts = secret.map(felt => new Felt(BigInt(felt)));

  // prepare note
  const noteInput = new NoteInputs(new FeltArray(secretFelts));
  const noteMetadata = new NoteMetadata(
    Address.fromBech32(creator).accountId(),
    noteType,
    giftTag,
    NoteExecutionHint.always(),
    new Felt(BigInt(0)),
  );
  const generatedSerialNumber = serialNumber ? serialNumber : ((await randomSerialNumbers()) as any[]);
  const serialNumberString = generatedSerialNumber.map(felt => felt.toString());

  const noteRecipient = new NoteRecipient(
    Word.newFromFelts(serialNumberString.map(felt => new Felt(BigInt(felt)))),
    noteScript,
    noteInput,
  );
  const noteAssets = new NoteAssets([new FungibleAsset(Address.fromBech32(faucetId).accountId(), BigInt(amount))]);
  const note = new Note(noteAssets, noteMetadata, noteRecipient);

  return [serialNumber ? note : OutputNote.full(note), serialNumberString];
}

export async function createBatchNote(
  caller: string,
  transactions: (Omit<BatchTransaction, "createdAt"> & { createdAt: Date })[],
) {
  try {
    const batch = [];
    const noteIds: string[] = [];
    const serialNumbers: string[][] = [];
    const recallableHeights: number[] = [];
    // Process each transaction
    for (const transaction of transactions) {
      console.log(transaction);
      const amount = parseFloat(transaction.amount);
      const recallHeight = transaction.recallableHeight;
      // Create note for transaction
      const note = await createP2IDNote(
        caller,
        transaction.recipient,
        transaction.tokenAddress,
        Math.round(amount * Math.pow(10, transaction.tokenMetadata.decimals)),
        transaction.isPrivate ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
      );
      batch.push(note);
      noteIds.push(note.id().toString());
      // serialNumbers.push(noteSerialNumbers);
      // recallableHeights.push(calculatedRecallHeight);
    }

    return { batch, noteIds, serialNumbers, recallableHeights };
  } catch (error) {
    throw new Error("Failed to create batch note");
    console.log(error);
  }
}

export async function createSchedulePaymentNote(
  sender: string,
  receiver: string,
  faucet: string,
  amount: number,
  noteType: WrappedNoteType,
  recallHeight: number,
  timelockHeight: number,
) {
  try {
    const { OutputNote } = await import("@demox-labs/miden-sdk");

    const serialNumbers = await randomSerialNumbers();
    const serialNumbersCopy = serialNumbers.map(felt => felt.toString());

    const note = await customCreateP2IDENote(
      sender,
      receiver,
      amount,
      faucet,
      recallHeight,
      timelockHeight,
      noteType,
      0,
      serialNumbers,
    );

    return [OutputNote.full(note), serialNumbersCopy, recallHeight];
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create schedule payment note");
  }
}

export async function createBatchSchedulePaymentNote(
  caller: string,
  transactions: (Omit<BatchTransaction, "createdAt"> & { createdAt: Date })[],
) {
  try {
    const notes = [];
    const noteIds: string[] = [];
    const serialNumbers: string[][] = [];
    const recallableHeights: number[] = [];
    const timelockHeights: number[] = [];

    // Process each transaction
    for (const transaction of transactions) {
      console.log(transaction);
      const amount = parseFloat(transaction.amount);
      const recallHeight = transaction.recallableHeight;
      const timelockHeight = transaction.timelockHeight || 0;

      // Create schedule payment note for transaction
      const [note, noteSerialNumbers, calculatedRecallHeight] = await createSchedulePaymentNote(
        caller,
        transaction.recipient,
        transaction.tokenAddress,
        Math.round(amount * Math.pow(10, transaction.tokenMetadata.decimals)),
        transaction.isPrivate ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
        recallHeight,
        timelockHeight,
      );

      notes.push(note);
      noteIds.push((note as any).id().toString());
      serialNumbers.push(noteSerialNumbers as string[]);
      recallableHeights.push(calculatedRecallHeight as number);
      timelockHeights.push(timelockHeight);
    }

    return { notes, noteIds, serialNumbers, recallableHeights, timelockHeights };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create batch schedule payment note");
  }
}

// **************** HELPER METHODS ********************

async function randomSerialNumbers(): Promise<any[]> {
  const { Felt } = await import("@demox-labs/miden-sdk");

  const randomBytes = new Uint32Array(4);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes).map(value => new Felt(BigInt(value)));
}

export async function generateSecret(): Promise<[number, number, number, number]> {
  const randomBytes = new Uint32Array(4);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes) as [number, number, number, number];
}

export function secretArrayToString(secret: [number, number, number, number]): string {
  const uint32Array = new Uint32Array(secret);

  const base64 = btoa(String.fromCharCode(...new Uint8Array(uint32Array.buffer)));

  // Convert to URL-safe base64 by replacing + with - and / with _
  // This prevents issues when the secret is used in URLs where + gets converted to space
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function stringToSecretArray(secretString: string): [number, number, number, number] {
  // Convert from URL-safe base64 back to standard base64
  let base64 = secretString.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  while (base64.length % 4) {
    base64 += "=";
  }

  const uint8Array = new Uint8Array(
    atob(base64)
      .split("")
      .map(char => char.charCodeAt(0)),
  );

  // Convert to Uint32Array
  const uint32Array = new Uint32Array(uint8Array.buffer);

  // Convert to array of 4 numbers
  return Array.from(uint32Array) as [number, number, number, number];
}

export async function customCreateP2IDENote(
  sender: string,
  receiver: string,
  amount: number,
  faucet: string,
  recallHeight: number,
  timelockHeight: number,
  noteType: WrappedNoteType,
  aux: number,
  serialNumber: any[],
) {
  const {
    NoteScript,
    NoteType,
    NoteInputs,
    FeltArray,
    Felt,
    NoteRecipient,
    Word,
    NoteTag,
    NoteMetadata,
    NoteExecutionHint,
    NoteAssets,
    FungibleAsset,
    Note,
    Address,
  } = await import("@demox-labs/miden-sdk");

  const senderId = Address.fromBech32(sender).accountId();
  const receiverId = Address.fromBech32(receiver).accountId();
  const faucetId = Address.fromBech32(faucet).accountId();

  const p2ideNoteScript = NoteScript.p2ide();

  const p2ideInputs = new NoteInputs(
    new FeltArray([
      receiverId.suffix(),
      receiverId.prefix(),
      new Felt(BigInt(recallHeight)),
      new Felt(BigInt(timelockHeight)),
    ]),
  );

  const noteRecipient = new NoteRecipient(Word.newFromFelts(serialNumber), p2ideNoteScript, p2ideInputs);
  const noteTag = NoteTag.fromAccountId(receiverId);
  const noteMetadata = new NoteMetadata(
    senderId,
    noteType == WrappedNoteType.PUBLIC ? NoteType.Public : NoteType.Private,
    noteTag,
    NoteExecutionHint.always(),
    new Felt(BigInt(aux)),
  );
  const noteAssets = new NoteAssets([new FungibleAsset(faucetId, BigInt(amount))]);

  const note = new Note(noteAssets, noteMetadata, noteRecipient);
  return note;
}
