import {
  AccountId,
  NoteType,
  FungibleAsset,
  Felt,
  TransactionKernel,
  NoteScript,
  NoteTag,
  Rpo256,
  FeltArray,
  NoteInputs,
  NoteMetadata,
  NoteExecutionHint,
  NoteAssets,
  Note,
  NoteRecipient,
  Word,
  OutputNote,
} from "@demox-labs/miden-sdk";
import { useClient } from "../../hooks/web3/useClient";

async function randomSerialNumbers(): Promise<Felt[]> {
  const randomBytes = new Uint32Array(4);
  crypto.getRandomValues(randomBytes);

  return Array.from(randomBytes).map(value => new Felt(BigInt(value)));
}

export async function createP2IDNote(
  sender: AccountId,
  receiver: AccountId,
  faucet: AccountId,
  amount: number,
  noteType: NoteType,
) {
  const { FungibleAsset, OutputNote, Note, NoteAssets, Word, Felt } = await import("@demox-labs/miden-sdk");

  return OutputNote.full(
    Note.createP2IDNote(
      sender,
      receiver,
      new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]),
      noteType,
      // @todo: replace hardcoded values with random values
      Word.newFromFelts([new Felt(BigInt(1)), new Felt(BigInt(2)), new Felt(BigInt(3)), new Felt(BigInt(4))]),
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

  return OutputNote.full(
    Note.createP2IDENote(
      sender,
      receiver,
      new NoteAssets([new FungibleAsset(faucet, BigInt(amount))]),
      noteType,
      // @todo: replace hardcoded values with random values
      Word.newFromFelts([new Felt(BigInt(1)), new Felt(BigInt(2)), new Felt(BigInt(3)), new Felt(BigInt(4))]),
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
