// **************** QASH TOKEN *******************
export const qashTokenAddress = "mtst1qpwlhl3glkt0jgr92vcxcqjxlvxty26p";
export const qashTokenSymbol = "QASH";
export const qashTokenDecimals = 8;
export const qashTokenMaxSupply = 1000000;

// **************** MIDEN NETWORK *******************
export const blockTime = 5; // seconds
export const nodeEndpoint = process.env.NEXT_PUBLIC_NODE_ENDPOINT || "https://rpc.testnet.miden.io:443";

// **************** CSS *******************
export const buttonStyle = {
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
