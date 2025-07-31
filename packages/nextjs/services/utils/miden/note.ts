"use client";

import { PartialConsumableNote } from "@/types/faucet";
import { NODE_ENDPOINT } from "../constant";
import { BatchTransaction } from "@/services/store/batchTransactions";
import { WrappedNoteType } from "@/types/note";

// **************** GET METHODS ********************

export async function getConsumableNotes(accountId: string) {
  try {
    const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);

    const notes = await client.getConsumableNotes(AccountId.fromBech32(accountId));

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
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt, AccountId, NoteType } = await import(
    "@demox-labs/miden-sdk"
  );

  const serialNumbers = await randomSerialNumbers();

  return OutputNote.full(
    Note.createP2IDNote(
      AccountId.fromBech32(sender),
      AccountId.fromBech32(receiver),
      new NoteAssets([new FungibleAsset(AccountId.fromBech32(faucet), BigInt(amount))]),
      noteType == WrappedNoteType.PUBLIC ? NoteType.Public : NoteType.Private,
      Word.newFromFelts(serialNumbers),
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
    const { WebClient, AccountId, Felt, NoteAndArgs, Note, TransactionRequestBuilder, NoteAndArgsArray } = await import(
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

    const accountId = AccountId.fromBech32(account);

    const txResult = await client.newTransaction(accountId, transactionRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumeUnauthenticatedNote(account: string, partialNote: PartialConsumableNote) {
  try {
    const { WebClient, AccountId, Felt, TransactionRequestBuilder, NoteAndArgsArray, NoteAndArgs } = await import(
      "@demox-labs/miden-sdk"
    );

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

    const accountId = AccountId.fromBech32(account);

    const txResult = await client.newTransaction(accountId, transactionRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumeNoteByID(account: string, noteId: string) {
  try {
    const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);
    const consumeTxRequest = client.newConsumeTransactionRequest([noteId]);

    const accountId = AccountId.fromBech32(account);

    const txResult = await client.newTransaction(accountId, consumeTxRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumeNoteByIDs(account: string, noteIds: string[]) {
  try {
    const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");

    const client = await WebClient.createClient(NODE_ENDPOINT);
    const consumeTxRequest = client.newConsumeTransactionRequest(noteIds);
    const accountId = AccountId.fromBech32(account);

    const txResult = await client.newTransaction(accountId, consumeTxRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function createGiftNote(
  creator: string,
  offeredAsset: any,
  secret: [number, number, number, number],
  serialNumber: [number, number, number, number],
) {
  const {
    WebClient,
    OutputNote,
    NoteType,
    NoteTag,
    AccountId,
    Rpo256,
    Felt,
    FeltArray,
    NoteInputs,
    NoteMetadata,
    NoteExecutionHint,
    NoteRecipient,
    NoteAssets,
    Word,
    Note,
  } = await import("@demox-labs/miden-sdk");

  const client = await WebClient.createClient(NODE_ENDPOINT);

  const giftNote = `
      use.miden::note
      use.miden::contracts::wallets::basic->wallet
      use.miden::account
      use.miden::account_id
      use.std::sys

      # ERRORS
      # =================================================================================================

      const.ERR_P2IDE_RECLAIM_ACCT_IS_NOT_SENDER="failed to reclaim Gift note because the reclaiming account is not the sender"

      const.ERR_P2IDE_RECLAIM_HEIGHT_NOT_REACHED="failed to reclaim Gift note because the reclaim block height is not reached yet"


      #! Helper procedure to add all assets of a note to an account.
      #!
      #! Inputs:  []
      #! Outputs: []
      proc.add_note_assets_to_account
          push.0 exec.note::get_assets
          # => [num_of_assets, 0 = ptr, ...]

          # compute the pointer at which we should stop iterating
          mul.4 dup.1 add
          # => [end_ptr, ptr, ...]

          # pad the stack and move the pointer to the top
          padw movup.5
          # => [ptr, 0, 0, 0, 0, end_ptr, ...]

          # compute the loop latch
          dup dup.6 neq
          # => [latch, ptr, 0, 0, 0, 0, end_ptr, ...]

          while.true
              # => [ptr, 0, 0, 0, 0, end_ptr, ...]

              # save the pointer so that we can use it later
              dup movdn.5
              # => [ptr, 0, 0, 0, 0, ptr, end_ptr, ...]

              # load the asset
              mem_loadw
              # => [ASSET, ptr, end_ptr, ...]

              # pad the stack before call
              padw swapw padw padw swapdw
              # => [ASSET, pad(12), ptr, end_ptr, ...]

              # add asset to the account
              call.wallet::receive_asset
              # => [pad(16), ptr, end_ptr, ...]

              # clean the stack after call
              dropw dropw dropw
              # => [0, 0, 0, 0, ptr, end_ptr, ...]

              # increment the pointer and compare it to the end_ptr
              movup.4 add.4 dup dup.6 neq
              # => [latch, ptr+4, ASSET, end_ptr, ...]
          end

          # clear the stack
          drop dropw drop
      end

      # => [SECRET]
      begin
          hperm

          dropw swapw dropw
          # => [DIGEST]

          # Writing the note inputs to memory
          push.0 exec.note::get_inputs drop drop
          # => [DIGEST]

          # Pad stack and load note inputs from memory
          padw push.0 mem_loadw
          # => [INPUTS, DIGEST]

          # Assert that the note input matches the digest
          # Will fail if the two hashes do not match
          assert_eqw
          # => []

          exec.add_note_assets_to_account

          exec.sys::truncate_stack
      end
  `;

  const noteScript = client.compileNoteScript(giftNote);
  const noteType = NoteType.Private;
  const giftTag = NoteTag.fromAccountId(AccountId.fromBech32(creator));
  // hash the secret
  const secretHash = Rpo256.hashElements(new FeltArray(secret.map(felt => new Felt(BigInt(felt)))));

  // prepare note
  const noteInput = new NoteInputs(new FeltArray(secretHash.toWord() as any));
  const noteMetadata = new NoteMetadata(
    AccountId.fromBech32(creator),
    noteType,
    giftTag,
    NoteExecutionHint.always(),
    new Felt(BigInt(0)),
  );
  const noteRecipient = new NoteRecipient(
    Word.newFromFelts(serialNumber.map(felt => new Felt(BigInt(felt)))),
    noteScript,
    noteInput,
  );
  const noteAssets = new NoteAssets([offeredAsset]);
  const note = new Note(noteAssets, noteMetadata, noteRecipient);

  return OutputNote.full(note);
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
      const [note, noteSerialNumbers, calculatedRecallHeight] = await createP2IDENote(
        caller,
        transaction.recipient,
        transaction.tokenAddress,
        Math.round(amount * Math.pow(10, transaction.tokenMetadata.decimals)),
        transaction.isPrivate ? WrappedNoteType.PRIVATE : WrappedNoteType.PUBLIC,
        recallHeight,
      );
      batch.push(note);
      noteIds.push(note.id().toString());
      serialNumbers.push(noteSerialNumbers);
      recallableHeights.push(calculatedRecallHeight);
    }

    return { batch, noteIds, serialNumbers, recallableHeights };
  } catch (error) {
    throw new Error("Failed to create batch note");
    console.log(error);
  }
}

// **************** HELPER METHODS ********************

async function randomSerialNumbers(): Promise<any[]> {
  const { Felt } = await import("@demox-labs/miden-sdk");

  const randomBytes = new Uint32Array(4);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes).map(value => new Felt(BigInt(value)));
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
    AccountId,
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
  } = await import("@demox-labs/miden-sdk");

  const senderId = AccountId.fromBech32(sender);
  const receiverId = AccountId.fromBech32(receiver);
  const faucetId = AccountId.fromBech32(faucet);

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
