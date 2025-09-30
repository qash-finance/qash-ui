import { useAccountContext } from "@/contexts/AccountProvider";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useTransactionStore } from "@/contexts/TransactionProvider";
import { formatAddress } from "@/services/utils/miden/address";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { InteractAccountTransactionModalProps, MODAL_IDS } from "@/types/modal";
import { blo } from "blo";
import React, { useMemo } from "react";

interface TopInteractedAddressesProps {
  walletAddress: string;
  accumulatedAmount: number;
  rank: number;
  transactionCount: number;
}

const TopInteractedAddresses = () => {
  const { accountId, assets } = useAccountContext();
  const transactions = useTransactionStore(state => state.transactions);
  const { openModal } = useModal();

  // Calculate top 3 senders from incoming transactions, excluding the current user
  const topInteractedAddresses = useMemo(() => {
    if (!accountId || !transactions.length) return [];

    // Filter incoming transactions to the current user, excluding self-transactions
    const incomingTransactions = transactions.filter(
      transaction =>
        transaction.type === "Incoming" && transaction.recipient === accountId && transaction.sender !== accountId,
    );

    // Group by sender and accumulate amounts
    const senderMap = new Map<string, { amount: number; count: number }>();

    incomingTransactions.forEach(transaction => {
      const sender = transaction.sender;
      const current = senderMap.get(sender) || { amount: 0, count: 0 };

      // Sum up all asset amounts for this sender with proper decimal conversion
      let totalAmount = 0;
      transaction.assets.forEach(asset => {
        // Find the asset metadata to get the correct decimals
        const assetMetadata = assets.find(accAsset => accAsset.faucetId === asset.assetId);
        if (assetMetadata) {
          totalAmount += Number(asset.amount) / 10 ** assetMetadata.metadata.decimals;
        }
      });

      senderMap.set(sender, {
        amount: current.amount + totalAmount,
        count: current.count + 1,
      });
    });

    // Convert to array and sort by amount (descending)
    const sortedSenders = Array.from(senderMap.entries())
      .map(([walletAddress, { amount, count }]) => ({
        walletAddress,
        accumulatedAmount: amount,
        rank: 0, // Will be set below
        transactionCount: count,
      }))
      .sort((a, b) => b.accumulatedAmount - a.accumulatedAmount)
      .slice(0, 3); // Take top 3

    // Set ranks
    sortedSenders.forEach((sender, index) => {
      sender.rank = index + 1;
    });

    return sortedSenders;
  }, [transactions, accountId, assets]);

  return (
    <div className="flex flex-col gap-2 h-[250px] items-center pb-2 pt-4 px-4 relative overflow-hidden flex-1 border-r border-primary-divider">
      {/* Header */}
      <div className="flex flex-row gap-1 items-center w-full">
        <img src="/wallet-analytics/trophy-icon.gif" alt="trophy" className="w-5 h-5" />
        <span className="capitalize text-text-primary">Frequent Addresses</span>
      </div>

      {/* Addresses List */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="bg-background flex flex-col gap-1 items-start p-2 rounded-[10px] w-full h-full border-t-2 border-primary-divider">
          {topInteractedAddresses.length > 0 ? (
            topInteractedAddresses.map((address: TopInteractedAddressesProps, index: number) => (
              <div
                key={index}
                onClick={() => {
                  openModal<InteractAccountTransactionModalProps>(MODAL_IDS.INTERACT_ACCOUNT_TRANSACTION, {
                    address: address.walletAddress,
                  });
                }}
                className="flex flex-row gap-3 items-center px-2 py-1.5 rounded-lg w-full cursor-pointer"
              >
                <img src={blo(turnBechToHex(address.walletAddress))} alt="avatar" className="w-8 h-8 rounded-full" />
                <div className="flex flex-col gap-0.5 flex-1">
                  <div className="font-medium h-5 flex items-center text-[#292929] text-sm tracking-[-0.2px] w-full">
                    <span className="block leading-[20px]">{formatAddress(address.walletAddress)}</span>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <img src="/wallet-analytics/coin-icon.gif" alt="coin" className="w-4 h-4" />
                    <span className="font-semibold text-[#066eff] text-sm tracking-[-0.2px]">
                      {address.accumulatedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                {address.rank === 1 ? (
                  <img src="/wallet-analytics/medal.svg" alt="medal" className="w-7 h-7" />
                ) : (
                  <div className="font-medium text-[#464646] text-sm tracking-[-0.2px]">#{address.rank}</div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-black text-center w-full">
              <span>No top interacted addresses found!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopInteractedAddresses;
