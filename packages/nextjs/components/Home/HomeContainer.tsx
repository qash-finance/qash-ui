"use client";
import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { CardContainer } from "./CardContainer";
import { PaymentInteraction } from "./PaymentInteraction";
import { Overview } from "./Overview";
import { TransactionHistory } from "./TransactionHistory";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";
import { useAccount } from "@/hooks/web3/useAccount";

export const HomeContainer = () => {
  const [loading, setLoading] = useState(false);
  const { accountId } = useAccount();
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const client = useMidenSdkStore(state => state.client);

  useEffect(() => {
    if (!accountId || !client) return;

    (async () => {
      const { NetworkId, AccountInterface, TransactionFilter, NoteFilter, NoteFilterTypes, WebClient } = await import(
        "@demox-labs/miden-sdk"
      );
      console.log("Fetching transactions for account:", accountId);
      setLoading(true);
      try {
        if (client instanceof WebClient) {
          console.log("ACCOUNT ID", accountId);
          const transactionRecords = (await client.getTransactions(TransactionFilter.all())).filter(
            tx => tx.accountId().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet) === accountId,
          );
          const inputNotes = await client.getInputNotes(new NoteFilter(NoteFilterTypes.All));
          const zippedInputeNotesAndTr = transactionRecords.map(tr => {
            if (tr.outputNotes().notes().length > 0) {
              return { tr, inputNote: undefined };
            } else {
              const inputNotesForTr = inputNotes.filter(note => note.consumerTransactionId() === tr.id().toHex());
              return { tr, inputNote: inputNotesForTr };
            }
          });
          await loadTransactions(zippedInputeNotesAndTr);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [client, accountId]);

  return (
    <div className="w-full h-full p-5 flex flex-col items-start gap-4">
      <div className="w-full flex flex-col gap-4 px-5">
        <Header />
        <CardContainer />
      </div>
      <PaymentInteraction />
      <Overview />
      <TransactionHistory />
    </div>
  );
};
