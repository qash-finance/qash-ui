"use client";

import React, { useState } from "react";
import { SecondaryButton } from "../Common/SecondaryButton";
import { formatAddress } from "@/services/utils/miden/address";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import toast from "react-hot-toast";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import {
  BLOCK_TIME,
  MIDEN_EXPLORER_URL,
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_SYMBOL,
  REFETCH_DELAY,
} from "@/services/utils/constant";
import { AssetWithMetadata } from "@/types/faucet";
import { createP2IDENote } from "@/services/utils/miden/note";
import { CustomNoteType, WrappedNoteType } from "@/types/note";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { sendSingleTransaction } from "@/services/api/transaction";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { BatchTransaction, useBatchTransactions } from "@/services/store/batchTransactions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { Badge, BadgeStatus } from "../Common/Badge";

const itemStyle = "flex flex-rol justify-between items-center py-3 px-5 border-b border-[#C8CBD0]";

interface TransactionOverviewProps {
  transactions: BatchTransaction[];
  onConfirm: () => void;
}

export const TransactionOverview = ({ transactions, onConfirm }: TransactionOverviewProps) => {
  const { accountId: accountAddress } = useAccountContext();

  return (
    <div className={`flex flex-col bg-base-container-main-background rounded-4xl p-[1px] w-[900px]`}>
      <div className="flex min-h-[50px] justify-center items-center">All transactions</div>

      <div className="p-3 bg-base-container-sub-background rounded-3xl border-t-1 border-base-container-sub-border-top gap-1">
        <div className="grid grid-cols-5 p-3 py-1 text-sm font-bold text-text-primary justify-items-center">
          <div>Message</div>
          <div>To</div>
          <div>Cancellable in</div>
          <div>Type</div>
          <div>Amount</div>
        </div>
        <div className="border-b-2 border-primary-divider my-2"></div>
        <div className="flex flex-col gap-2">
          {transactions.map(tx => (
            <div
              key={tx.id}
              className="grid grid-cols-5 gap-4 items-center p-3 py-5 bg-background rounded-lg justify-items-center"
            >
              <div className="text-sm text-text-primary truncate w-[100px] justify-self-center text-center">
                {tx.message || "-"}
              </div>
              <div className="text-sm text-text-primary">{formatAddress(tx.recipient)}</div>
              <div className="text-sm text-text-primary">{tx.recallableTime / 3600} hour(s)</div>
              <div className="text-sm text-text-primary">
                <Badge
                  status={tx.isPrivate ? BadgeStatus.PRIVATE : BadgeStatus.PUBLIC}
                  text={tx.isPrivate ? "Private" : "Public"}
                />
              </div>
              <div className="text-sm text-text-primary flex items-center gap-2">
                <img
                  src={
                    transactions[0].tokenMetadata.symbol === QASH_TOKEN_SYMBOL
                      ? "/q3x-icon.png"
                      : blo(turnBechToHex(tx.tokenAddress))
                  }
                  alt={tx.tokenMetadata.symbol}
                  className="w-4 h-4 rounded-full"
                />
                {tx.amount} {tx.tokenMetadata.symbol}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={itemStyle}>
        <span>Number of transactions</span>
        <span>{transactions.length} transactions</span>
      </div>

      <div className={`${itemStyle} !border-b-0`}>
        <span>Total Payment</span>
        <span>
          {transactions && transactions.length > 0
            ? transactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0)
            : 0}{" "}
          {transactions[0].tokenMetadata.symbol}
        </span>
      </div>

      <div className="flex flex-rol justify-between items-center p-4 gap-20">
        <div className="flex justify-between items-center flex-row bg-base-container-sub-background rounded-xl border-t-1 border-base-container-sub-border-top p-3 w-[300px]">
          <div className="flex flex-row items-center gap-2">
            <img src={blo(turnBechToHex(accountAddress))} className="w-7 h-7 rounded-full" />
            <div className="flex flex-col gap-1">
              <span className="text-text-secondary text-sm leading-none">Account</span>
              <span className="text-text-primary text-sm leading-none">(Q3x) {formatAddress(accountAddress)}</span>
            </div>
          </div>
          <img src="/arrow/chevron-down.svg" alt="Edit" className="w-5 h-5" />
        </div>
        <SecondaryButton text="Confirm and Send" buttonClassName="w-[150px]" onClick={onConfirm} />
      </div>
    </div>
  );
};
