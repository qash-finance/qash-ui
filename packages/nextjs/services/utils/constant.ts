// **************** LOCAL STORAGE *******************
export const TOUR_SKIPPED_KEY = "tour_skipped";
export const BALANCE_VISIBILITY_KEY = "balance_visibility";
export const ANALYTICS_SESSION_ID_KEY = "analytics_session_id";
export const ANALYTICS_SESSION_START_KEY = "analytics_session_start";
export const ANALYTICS_USER_ADDRESS_KEY = "analytics_user_address";
export const WALLET_ADDRESSES_KEY = "miden-wallet-addresses";
export const LAST_CONNECTED_KEY = "miden-last-connected-address";
export const MIDEN_WALLET_AUTH_KEY = "miden_wallet_auth";
export const MIDEN_WALLET_KEYS_KEY = "miden_wallet_keys";
export const QR_STORAGE_KEY = "custom_qr_codes";
export const MIGRATION_VERSION_KEY = "migration_version";
export const CURRENT_MIGRATION_VERSION = "0.11.0";
export const MIDEN_DB_NAME = "MidenClientDB";

// **************** QASH TOKEN *******************
export const QASH_TOKEN_ADDRESS = "mtst1ar600d6s8uwwjgznqtxqt085qs9a50ej";
export const QASH_TOKEN_SYMBOL = "QASH";
export const QASH_TOKEN_DECIMALS = 8;
export const QASH_TOKEN_MAX_SUPPLY = 1000000000000000000;

// **************** MIDEN NETWORK *******************
export const BLOCK_TIME = 5; // seconds
export const NODE_ENDPOINT = process.env.NEXT_PUBLIC_NODE_ENDPOINT || "https://rpc.testnet.miden.io";
export const REFETCH_DELAY = 6000;
export const SYNC_STATE_INTERVAL = 3000;
export const MIDEN_EXPLORER_URL = "https://testnet.midenscan.com";
export const MIDEN_NETWORK_ID = "mtst";

// **************** AUTH *******************
export const AUTH_EXPIRATION_HOURS = 720; // 30 days
export const AUTH_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// **************** CSS *******************
export const BUTTON_STYLES = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "16px",
  fontWeight: "500",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  transition: "background-color 0.2s",
  textAlign: "center" as const,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#3b82f6",
};

// **************** TANSTACK QUERY *******************
export const STALE_TIME = 1000 * 60 * 5;

// **************** DEFAULT AVATAR *******************
export const DEFAULT_AVATAR_ADDRESS = "0x44d6cAAC62A593A53931E2DB6124c9045f78345c";

// **************** GIFT NOTE *******************
export const GIFT_NOTE_SCRIPT = `
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

# => [secret]
begin
    # Writing the note inputs to memory
    push.0 exec.note::get_inputs drop drop
    # => [secret]

    # Pad stack and load note inputs from memory
    padw push.0 mem_loadw
    # => [INPUTS, DIGEST]
    debug.stack

    # Assert that the note input matches the digest
    # Will fail if the two hashes do not match
    assert_eqw

    exec.add_note_assets_to_account

    exec.sys::truncate_stack
end
  `;
