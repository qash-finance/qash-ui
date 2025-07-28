"use client";
import {
  AccountId,
  Felt,
  NoteRecipient,
  NoteMetadata,
  Note,
  NoteInputs,
  NoteTag,
  NoteType,
  Rpo256,
  FeltArray,
  Word,
  NoteExecutionHint,
  OutputNote,
  NoteAssets,
  FungibleAsset,
  TransactionRequestBuilder,
  NoteScript,
  NoteAndArgsArray,
  NoteAndArgs,
} from "@demox-labs/miden-sdk";
import { useClient } from "../../../hooks/web3/useClient";
import { PartialConsumableNote } from "@/types/faucet";

// **************** GET METHODS ********************

export async function getConsumableNotes(accountId: string) {
  const { getClient } = useClient();
  try {
    const client = await getClient();

    const notes = await client.getConsumableNotes(AccountId.fromBech32(accountId));
    return notes;
  } catch (error) {
    console.log("ERROR GETTING CONSUMABLE NOTES", error);
    throw new Error("Failed to fetch consumable notes");
  }
}

// **************** CREATE METHODS ********************

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

export async function createP2IDENote(
  sender: AccountId,
  receiver: AccountId,
  faucet: AccountId,
  amount: number,
  noteType: NoteType,
  recallHeight: number,
): Promise<[OutputNote, string[], number]> {
  const { getClient } = useClient();
  const client = await getClient();
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
}

export async function consumeAllNotes(
  accountId: AccountId,
  notes: {
    isPrivate: boolean;
    noteId: string;
    partialNote?: PartialConsumableNote;
  }[],
) {
  const { getClient } = useClient();
  try {
    const client = await getClient();

    const inputNotes: NoteAndArgs[] = [];

    // loop through the notes
    for (const noteInfo of notes) {
      if (noteInfo.isPrivate) {
        // Create AccountId objects once and reuse them to avoid aliasing issues
        const senderAccountId = AccountId.fromBech32(noteInfo?.partialNote?.sender!);
        const recipientAccountId = AccountId.fromBech32(noteInfo?.partialNote?.recipient!);
        const faucetAccountId = AccountId.fromBech32(noteInfo?.partialNote?.assets[0].faucetId!);

        const note = await customCreateP2IDENote(
          senderAccountId,
          recipientAccountId,
          Number(noteInfo?.partialNote?.assets[0].amount),
          faucetAccountId,
          noteInfo?.partialNote?.recallableHeight!,
          0,
          noteInfo?.partialNote?.private ? NoteType.Private : NoteType.Public,
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

    const txResult = await client.newTransaction(accountId, transactionRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumePrivateNote(accountId: AccountId, partialNote: PartialConsumableNote) {
  const { getClient } = useClient();

  try {
    const client = await getClient();

    // Create AccountId objects once and reuse them to avoid aliasing issues
    const senderAccountId = AccountId.fromBech32(partialNote.sender);
    const recipientAccountId = AccountId.fromBech32(partialNote.recipient);
    const faucetAccountId = AccountId.fromBech32(partialNote.assets[0].faucetId);

    const note = await customCreateP2IDENote(
      senderAccountId,
      recipientAccountId,
      Number(partialNote.assets[0].amount),
      faucetAccountId,
      partialNote.recallableHeight,
      0,
      partialNote.private ? NoteType.Private : NoteType.Public,
      0,
      partialNote.serialNumber.map(felt => new Felt(BigInt(felt))),
    );

    const transactionRequest = new TransactionRequestBuilder()
      .withUnauthenticatedInputNotes(new NoteAndArgsArray([new NoteAndArgs(note)]))
      .build();

    const txResult = await client.newTransaction(accountId, transactionRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}

export async function consumePublicNote(accountId: AccountId, noteId: string) {
  const { getClient } = useClient();
  try {
    const client = await getClient();
    const consumeTxRequest = client.newConsumeTransactionRequest([noteId]);
    const txResult = await client.newTransaction(accountId, consumeTxRequest);
    await client.submitTransaction(txResult);

    return txResult.executedTransaction().id().toHex();
  } catch (err) {
    throw new Error("Failed to consume notes");
  }
}



export async function createNoteAndSubmit(
  sender: AccountId,
  receiver: AccountId,
  faucetId: AccountId,
  amount: number,
  noteType: NoteType,
  recallableTimeInSeconds?: number,
) {
  const { getClient } = useClient();

  console.log("🚀 ~ createNoteAndSubmit ~ sender:", sender.toString());
  console.log("🚀 ~ createNoteAndSubmit ~ receiver:", receiver.toString());
  console.log("🚀 ~ createNoteAndSubmit ~ faucetId:", faucetId.toString());
  console.log("🚀 ~ createNoteAndSubmit ~ amount:", amount);
  console.log("🚀 ~ createNoteAndSubmit ~ noteType:", noteType);

  try {
    const client = await getClient();
    await client.syncState();

    const transactionRequest = client.newSendTransactionRequest(sender, receiver, faucetId, noteType, BigInt(amount));
    const txResult = await client.newTransaction(sender, transactionRequest);
    await client.submitTransaction(txResult);

    await client.syncState();
  } catch (error) {
    throw new Error("Failed to submit note");
  }
}

export async function createGiftNote(
  creator: AccountId,
  offeredAsset: FungibleAsset,
  secret: [Felt, Felt, Felt, Felt],
  serialNumber: [Felt, Felt, Felt, Felt],
) {
  const { getClient } = useClient();
  const client = await getClient();

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
  const giftTag = NoteTag.fromAccountId(creator);
  // hash the secret
  const secretHash = Rpo256.hashElements(new FeltArray(secret));

  // prepare note
  const noteInput = new NoteInputs(new FeltArray(secretHash.toWord() as unknown as Felt[]));
  const noteMetadata = new NoteMetadata(creator, noteType, giftTag, NoteExecutionHint.always(), new Felt(BigInt(0)));
  const noteRecipient = new NoteRecipient(Word.newFromFelts(serialNumber), noteScript, noteInput);
  const noteAssets = new NoteAssets([offeredAsset]);
  const note = new Note(noteAssets, noteMetadata, noteRecipient);

  return OutputNote.full(note);
}

// **************** HELPER METHODS ********************

async function randomSerialNumbers(): Promise<Felt[]> {
  const randomBytes = new Uint32Array(4);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes).map(value => new Felt(BigInt(value)));
}

export async function customCreateP2IDENote(
  sender: AccountId,
  receiver: AccountId,
  amount: number,
  faucet: AccountId,
  recallHeight: number,
  timelockHeight: number,
  noteType: NoteType,
  aux: number,
  serialNumber: Felt[],
) {
  const p2ideNoteScript = NoteScript.p2ide();

  const p2ideInputs = new NoteInputs(
    new FeltArray([
      receiver.suffix(),
      receiver.prefix(),
      new Felt(BigInt(recallHeight)),
      new Felt(BigInt(timelockHeight)),
    ]),
  );

  const noteRecipient = new NoteRecipient(Word.newFromFelts(serialNumber), p2ideNoteScript, p2ideInputs);
  const noteTag = NoteTag.fromAccountId(receiver);
  const noteMetadata = new NoteMetadata(sender, noteType, noteTag, NoteExecutionHint.always(), new Felt(BigInt(aux)));
  const noteAssets = new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]);

  const note = new Note(noteAssets, noteMetadata, noteRecipient);
  return note;
}
