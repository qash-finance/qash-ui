let CustomAccountId: any = null;

// Initialize AccountId on client side only
if (typeof window !== "undefined") {
  import("@demox-labs/miden-sdk").then(({ AccountId }) => {
    CustomAccountId = AccountId;
  });
}

export const turnBechToHex = (tokenAddressInBech32: string): `0x${string}` => {
  try {
    if (!CustomAccountId) {
      // return fallback if SDK not loaded yet
      return "0x44d6cAAC62A593A53931E2DB6124c9045f78345c";
    }
    const bech32 = CustomAccountId.fromBech32(tokenAddressInBech32);
    return bech32.toString() as `0x${string}`;
  } catch (error) {
    return "0x44d6cAAC62A593A53931E2DB6124c9045f78345c";
  }
};
