import { AccountId } from "@demox-labs/miden-sdk";

export const turnBechToHex = (tokenAddressInBech32: string): `0x${string}` => {
  try {
    const bech32 = AccountId.fromBech32(tokenAddressInBech32);
    return bech32.toString() as `0x${string}`;
  } catch (error) {
    return "0x44d6cAAC62A593A53931E2DB6124c9045f78345c";
  }
};
