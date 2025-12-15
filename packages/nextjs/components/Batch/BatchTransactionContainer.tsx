"use client";
import React, { useState } from "react";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "../Common/ActionButton";
import { BatchTransaction, useBatchTransactions } from "@/services/store/batchTransactions";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import toast from "react-hot-toast";
import { createBatchNote } from "@/services/utils/miden/note";
import { submitTransactionWithOwnOutputNotes } from "@/services/utils/miden/transactions";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useSendBatchTransaction } from "@/hooks/server/useSendTransaction";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useAcceptRequest } from "@/services/api/request-payment";
import { BaseContainer } from "../Common/BaseContainer";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";
import { useRouter } from "next/navigation";
import { CellContent, Table } from "../Common/Table";
import { formatAddress } from "@/services/utils/miden/address";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatUnits } from "viem";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { Badge, BadgeStatus } from "../Common/Badge";
import { TransactionOverview } from "./TransactionOverview";
import { useTitle } from "@/contexts/TitleProvider";
import { Tooltip } from "react-tooltip";
import BatchActionTooltip from "../Common/ToolTip/BatchActionTooltip";

enum STEP {
  PREPARE = "prepare",
  OVERVIEW = "overview",
}

export function BatchTransactionContainer() {
  // **************** Custom Hooks *******************
  const { isConnected } = useWalletConnect();
  const { removeTransaction, addTransaction, duplicateTransaction, editTransaction } = useBatchTransactions();
  const { accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { getBatchTransactions, clearBatch } = useBatchTransactions();
  const { mutateAsync: sendBatchTransaction } = useSendBatchTransaction();
  const { forceFetch: forceRefetchRecallablePayment } = useRecallableNotes();
  const { mutateAsync: acceptRequest } = useAcceptRequest();
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  // **************** Local State *******************
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEP.PREPARE);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  // Subscribe directly to the store state for automatic reactivity
  const allTransactions = useBatchTransactions(state => state.transactions);
  const transactions = React.useMemo(() => {
    if (walletAddress && isConnected && allTransactions[walletAddress]) {
      return allTransactions[walletAddress].map(tx => ({
        ...tx,
        createdAt: new Date(tx.createdAt),
      }));
    }
    return [];
  }, [walletAddress, isConnected, allTransactions]);

  const handleRemoveTransaction = (transactionId: string) => {
    if (!walletAddress) return;
    openModal(MODAL_IDS.REMOVE_TRANSACTION_CONFIRMATION, {
      onRemove: () => {
        toast.success("Transaction removed");
        removeTransaction(walletAddress, transactionId);
      },
    });
  };

  const handleEditTransaction = (transactionId: string) => {
    // Find the transaction and open Send Modal with pre-filled data
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      // Create AssetWithMetadata object for the selected token
      const selectedToken = {
        amount: "0", // We don't store balance in batch transaction
        faucetId: transaction.tokenAddress,
        metadata: transaction.tokenMetadata,
      };

      // Open Edit Modal with pre-filled data
      openModal(MODAL_IDS.EDIT_TRANSACTION, {
        pendingRequestId: 0, // Required prop
        transactionId: transactionId,
        recipient: transaction.recipient,
        recipientName: transaction.recipientName || "Unknown",
        amount: transaction.amount,
        message: transaction.message || "",
        tokenAddress: transaction.tokenAddress,
        tokenSymbol: transaction.tokenMetadata.symbol,
        isPrivate: transaction.isPrivate,
        recallableTime: transaction.recallableTime,
        onSaveChanges: (updatedData: {
          amount: string;
          recipient: string;
          message: string;
          isPrivate: boolean;
          recallableTime: number;
        }) => {
          // Update the existing transaction with new data
          if (walletAddress) {
            editTransaction(walletAddress, transactionId, {
              amount: updatedData.amount,
              recipient: updatedData.recipient,
              message: updatedData.message,
              isPrivate: updatedData.isPrivate,
              recallableTime: updatedData.recallableTime,
              recallableHeight: Math.floor(updatedData.recallableTime / 5), // Convert seconds to blocks (5 seconds per block)
            });

            toast.success("Transaction updated successfully");
          }
        },
      });
    }
  };

  const handleDuplicateTransaction = (transactionId: string) => {
    // Find the transaction and duplicate it
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction && walletAddress) {
      duplicateTransaction(walletAddress, transaction.id);
      toast.success("Transaction duplicated");
    }
  };

  const handleCheckRow = (idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const handleCheckAll = () => {
    if (checkedRows.length === transactions.length) {
      setCheckedRows([]);
    } else {
      setCheckedRows(transactions.map((_, idx) => idx));
    }
  };

  const isAllChecked = transactions.length > 0 && checkedRows.length === transactions.length;

  // Convert batch transactions to table data format
  const batchTableData = transactions.map((transaction, index) => {
    return {
      " ": (
        <div className="flex justify-center items-center">
          <CustomCheckbox checked={checkedRows.includes(index)} onChange={() => handleCheckRow(index)} />
        </div>
      ),
      Amount: (
        <div className="flex justify-center items-center gap-1">
          <img
            src={
              QASH_TOKEN_ADDRESS == transaction.tokenAddress
                ? "/q3x-icon.png"
                : blo(turnBechToHex(transaction.tokenAddress))
            }
            alt={transaction.tokenMetadata?.symbol || "Token"}
            className="w-4 h-4 flex-shrink-0 rounded-full"
          />
          <span className="text-text-primary text-sm leading-none">
            {formatNumberWithCommas(transaction.amount)} {transaction.tokenMetadata?.symbol || "Unknown Token"}
          </span>
        </div>
      ),
      Message: (
        <div className="flex justify-center items-center gap-1">
          <span className="text-text-primary text-sm leading-none truncate">{transaction.message || "-"}</span>
        </div>
      ),
      To: (
        <div className="flex justify-center items-center gap-1">
          <span className="text-text-primary text-sm leading-none">{formatAddress(transaction.recipient)}</span>
        </div>
      ),
      "Cancellable in": (
        <span className="text-text-primary text-sm leading-none">{transaction.recallableTime / 3600} hour(s)</span>
      ),
      Type: (
        <div className="flex justify-center items-center">
          <Badge
            status={transaction.isPrivate ? BadgeStatus.PRIVATE : BadgeStatus.PUBLIC}
            text={transaction.isPrivate ? "Private" : "Public"}
          />
        </div>
      ),
    };
  });

  // Action renderer for batch table
  const batchActionRenderer = (rowData: Record<string, CellContent>, index: number) => (
    <div className="flex items-center justify-center w-full">
      <img
        src="/misc/three-dot-icon.svg"
        alt="three dot icon"
        className="w-6 h-6 cursor-pointer"
        data-tooltip-id="batch-action-tooltip"
        data-tooltip-content={transactions[index]?.id || ""}
      />
    </div>
  );

  const handleConfirm = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      openModal(MODAL_IDS.PROCESSING_TRANSACTION, {});
      setIsLoading(true);

      // Get selected transactions only
      const allTransactions = getBatchTransactions(walletAddress);
      const selectedTransactions = allTransactions.filter((_, index) => checkedRows.includes(index));

      if (selectedTransactions.length === 0) {
        toast.dismiss();
        toast.error("No transactions selected");
        return;
      }
      const { batch, noteIds, serialNumbers, recallableHeights } = await createBatchNote(
        walletAddress,
        selectedTransactions,
      );
      // Submit transaction to blockchain
      const txId = await submitTransactionWithOwnOutputNotes(walletAddress, batch);
      // submit transaction to server
      await sendBatchTransaction(
        selectedTransactions.map((transaction, index) => ({
          assets: [
            {
              faucetId: transaction.tokenAddress,
              amount: transaction.amount,
              metadata: transaction.tokenMetadata,
            },
          ],
          private: transaction.isPrivate,
          recipient: transaction.recipient,
          recallable: true,
          recallableTime: new Date(Date.now() + transaction.recallableTime * 1000),
          recallableHeight: recallableHeights[index],
          serialNumber: serialNumbers[index],
          noteType: transaction.noteType,
          noteId: noteIds[index],
          transactionId: txId,
        })),
      );

      // we can add multiple request payments to the batch
      // we need to avoid accepting the same request payment multiple times
      const acceptedRequestPayments = new Set<number>();
      for (const transaction of selectedTransactions) {
        if (transaction.pendingRequestId) {
          if (!acceptedRequestPayments.has(transaction.pendingRequestId)) {
            await acceptRequest({ id: transaction.pendingRequestId, txid: txId });
            acceptedRequestPayments.add(transaction.pendingRequestId);
          }
        }
      }

      handleBackToForm();

      clearBatch(walletAddress);
      await forceRefetchRecallablePayment();
      await forceRefetchAssets();
      setIsLoading(false);

      closeModal(MODAL_IDS.PROCESSING_TRANSACTION);

      toast.success("Transfer Successfully");
    } catch (error) {
      console.error("Failed to process batch transactions:", error);
      toast.dismiss();
      toast.error("Failed to process batch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionOverview = () => {
    setStep(STEP.OVERVIEW);
    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Batch /</span>
        <span className="text-text-primary">Transaction Overview</span>
      </div>,
    );
    setShowBackArrow(true);
    setOnBackClick(() => handleBackToForm);
  };

  // Handle going back to form
  const handleBackToForm = () => {
    setStep(STEP.PREPARE);
    setTitle("Welcome to Qash");
    setShowBackArrow(false);
    setOnBackClick(undefined);
  };

  return (
    <div className="flex flex-col w-full h-full p-4 gap-5">
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-row w-full px-4 gap-2">
          {step === STEP.PREPARE ? (
            <>
              <img src="/misc/light-shopping-bag.svg" alt="send" className="w-6" />
              <span className="font-semibold text-text-primary text-2xl">Batch</span>
            </>
          ) : (
            <>
              <img src="/misc/bill-icon.svg" alt="send" className="w-6" />
              <span className="font-semibold text-text-primary text-2xl">Transaction Overview</span>
            </>
          )}
        </div>
        {step === STEP.PREPARE && (
          <div className="flex items-center gap-2">
            <PrimaryButton
              text="Add transaction"
              onClick={() => router.push("/move-crypto?tab=send")}
              containerClassName="w-[180px]"
              icon="/misc/plus-icon.svg"
              iconPosition="left"
            />
          </div>
        )}
      </div>

      <div className="flex justify-center items-start h-full">
        {step === STEP.PREPARE && (
          <BaseContainer
            header={
              <div className="flex w-full justify-between items-center p-5">
                <span className="text-text-primary text-lg leading-none font-bold">Total Batch</span>
                <span className="text-text-primary text-lg leading-none font-bold">
                  {transactions.length} transactions
                </span>
              </div>
            }
            containerClassName="w-full h-full"
          >
            <div id="table-container" className="p-3 flex flex-col h-full">
              <Table
                headers={[" ", "Amount", "Message", "To", "Cancellable in", "Type"]}
                columnWidths={{
                  0: "0%",
                  1: "10%",
                  2: "30%",
                }}
                data={batchTableData}
                actionColumn={transactions.length > 0}
                actionRenderer={transactions.length > 0 ? batchActionRenderer : undefined}
                selectedRows={checkedRows}
                draggable={true}
                rowClassName="!p-10"
              />
            </div>
          </BaseContainer>
        )}

        {step === STEP.OVERVIEW && transactions && (
          <TransactionOverview
            transactions={transactions
              .filter((_, index) => checkedRows.includes(index))
              .map(transaction => ({
                ...transaction,
                createdAt: transaction.createdAt.toISOString(),
              }))}
            onConfirm={handleConfirm}
          />
        )}

        {step === STEP.PREPARE && (
          <div className="flex absolute bottom-0 w-full p-5 backdrop-blur-[50px] border-t border-primary-divider justify-between items-center">
            <div className="flex flex-row items-center gap-4">
              <CustomCheckbox checked={isAllChecked} onChange={handleCheckAll} />
              <span className="text-text-secondary text-lg leading-none">Select all ({checkedRows.length})</span>
            </div>
            <div className="flex flex-row items-center gap-4 w-[350px]">
              <span className="text-text-secondary text-lg leading-none">
                Total: ({transactions.length} transactions)
              </span>
              <SecondaryButton
                text="Confirm and Send"
                onClick={handleTransactionOverview}
                buttonClassName="flex-1"
                disabled={checkedRows.length === 0}
              />
            </div>
          </div>
        )}
      </div>

      {/* Batch Action Tooltip */}
      <Tooltip
        id="batch-action-tooltip"
        clickable
        style={{
          zIndex: 20,
          borderRadius: "16px",
          padding: "0",
        }}
        noArrow
        border="none"
        opacity={1}
        render={({ content }) => {
          if (!content) return null;
          const transactionId = content;
          const transaction = transactions.find(t => t.id === transactionId);
          if (!transaction) return null;

          return (
            <BatchActionTooltip
              onEdit={() => handleEditTransaction(transactionId)}
              onDuplicate={() => handleDuplicateTransaction(transactionId)}
              onRemove={() => handleRemoveTransaction(transactionId)}
            />
          );
        }}
      />
    </div>
  );
}

export default BatchTransactionContainer;
