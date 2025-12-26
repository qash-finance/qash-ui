"use client";

import { useClient, useAccount, type Wallet } from "@getpara/react-sdk";
import { createParaMidenClient } from "miden-para";
import { useEffect, useRef, useState, useMemo } from "react";

export function useMiden(nodeUrl?: string) {
  const para = useClient();
  const { isConnected, embedded } = useAccount();
  const clientRef = useRef<import("@demox-labs/miden-sdk").WebClient | null>(null);
  const [accountId, setAccountId] = useState<string>("");

  // Filter for EVM-compatible wallets - memoize to prevent infinite loops
  const evmWallets = useMemo(() => embedded.wallets?.filter(w => w.type === "EVM"), [embedded.wallets]);

  useEffect(() => {
    console.log("useMiden effect triggered:", {
      isConnected,
      evmWallets,
      para,
      nodeUrl,
    });
    async function setupClient() {
      if (isConnected && evmWallets && para) {
        const { AccountType, AccountId, Address, NetworkId } = await import("@demox-labs/miden-sdk");

        const { client: midenParaClient, accountId: aId } = await createParaMidenClient(
          para,
          evmWallets as Wallet[],
          {
            endpoint: nodeUrl,
            type: AccountType.RegularAccountImmutableCode,
            storageMode: "private",
            accountSeed: process.env.NEXT_PUBLIC_MIDEN_ACCOUNT_SEED,
            noteTransportUrl: "https://transport.miden.io",
          },
          false,
        );

        clientRef.current = midenParaClient;
        setAccountId(Address.fromAccountId(AccountId.fromHex(aId), "BasicWallet").toBech32(NetworkId.Testnet));
      }
    }
    setupClient();

    return () => {
      clientRef.current?.terminate();
      clientRef.current = null;
      setAccountId("");
    };
  }, [isConnected, evmWallets, para, nodeUrl]);
  return { client: clientRef.current, accountId };
}
