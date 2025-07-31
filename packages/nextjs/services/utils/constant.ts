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

// **************** QASH TOKEN *******************
export const QASH_TOKEN_ADDRESS = "mtst1qpuzxzy5au9n2gq5vhsvyyl9jsaq5a7w";
export const QASH_TOKEN_SYMBOL = "QASH";
export const QASH_TOKEN_DECIMALS = 8;
export const QASH_TOKEN_MAX_SUPPLY = 1000000000000000000;

// **************** MIDEN NETWORK *******************
export const BLOCK_TIME = 5; // seconds
export const NODE_ENDPOINT = process.env.NEXT_PUBLIC_NODE_ENDPOINT || "https://rpc.testnet.miden.io:443";
export const REFETCH_DELAY = 6000;
export const SYNC_STATE_INTERVAL = 3000;
export const MIDEN_EXPLORER_URL = "https://testnet.midenscan.com";

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
