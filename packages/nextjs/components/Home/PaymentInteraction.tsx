"use client";
import React, { useState, useEffect } from "react";
import { BaseContainer } from "../Common/BaseContainer";
import { TabContainer } from "../Common/TabContainer";
import { CellContent, Table } from "../Common/Table";
import DraggableTableExample from "../Example/DraggableTableExample";
import { ActionButton } from "@/components/Common/ActionButton";
import { CustomCheckbox } from "@/components/Common/CustomCheckbox";
import { AssetWithMetadata, PartialConsumableNote } from "@/types/faucet";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatUnits } from "viem";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useConsumableNotes } from "@/hooks/server/useConsumableNotes";
import useConsumeNotes from "@/hooks/server/useConsume";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useConfirmGroupPaymentRequest } from "@/services/api/request-payment";
import { useConsumePublicNotes } from "@/services/api/transaction";
import {
  consumeAllUnauthenticatedNotes,
  consumeUnauthenticatedNote,
  consumeNoteByID,
} from "@/services/utils/miden/note";
import { toast } from "react-hot-toast";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

const tabs = [
  { id: "payment-request", label: "Payment Request", description: "Send a request, receive funds with ease" },
  { id: "receive", label: "Receive", description: "Receive tokens by claiming them here." },
  {
    id: "cancel-payment",
    label: "Cancel Payment",
    description: "Cancel a pending payment anytime before it’s claimed",
  },
  { id: "payroll", label: "Payroll" },
];

export const PaymentInteraction = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [autoClaim, setAutoClaim] = useState(false);
  // **************** Custom Hooks *******************
  const { walletAddress, isConnected } = useWalletConnect();
  const { openModal } = useModal();

  // **************** Server Hooks *******************
  const {
    data: consumableNotesFromServer,
    isLoading: isLoadingConsumableNotesFromServer,
    error: errorConsumableNotesFromServer,
    isRefetching: isRefetchingConsumableNotesFromServer,
  } = useConsumableNotes();
  const { forceFetch: forceRefetchRecallableNotes } = useRecallableNotes();
  const { mutateAsync: consumeNotes } = useConsumeNotes();
  const { mutateAsync: consumePublicNotes } = useConsumePublicNotes();
  const { mutateAsync: confirmGroupPaymentRequest } = useConfirmGroupPaymentRequest();

  // **************** Local State *******************
  const [consumableNotes, setConsumableNotes] = useState<PartialConsumableNote[]>([]);

  useEffect(() => {
    (async () => {
      if (walletAddress && isConnected) {
        if (!errorConsumableNotesFromServer) {
          if (consumableNotesFromServer) {
            setConsumableNotes(consumableNotesFromServer);
          } else {
            setConsumableNotes([]);
          }
        } else {
          setConsumableNotes([]);
        }
      }
    })();
  }, [walletAddress, isConnected, consumableNotesFromServer, isRefetchingConsumableNotesFromServer]);

  const handleDragEnd = (newData: Record<string, CellContent>[]) => {
    // setTableData(newData);
    console.log("New order:", newData);
  };

  const isAllChecked = consumableNotes.length > 0 && checkedRows.length === consumableNotes.length;

  const handleCheckAll = () => {
    if (isAllChecked) setCheckedRows([]);
    else setCheckedRows(consumableNotes.map((_, idx) => idx));
  };

  const handleCheckRow = (idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  };

  const toastSuccess = () =>
    toast.success(
      <div className="flex flex-row gap-2 justify-center items-center w-full">
        <span className="text-white">Claimed successfully</span>
        <div
          className="flex justify-center items-center p-2 px-4 rounded-lg bg-background border-b-1 border-primary-divider cursor-pointer"
          onClick={() => openModal(MODAL_IDS.PORTFOLIO)}
        >
          <span className="text-text-primary text-sm">View assets</span>
        </div>
      </div>,
    );

  const handleClaim = async (note: PartialConsumableNote) => {
    try {
      if (!walletAddress) {
        return toast.error("Please connect your wallet");
      }
      toast.loading("Receiving payment...");

      setClaiming(true);
      console.log("NOTE", note);

      if (note.private || note.recallableHeight > 0) {
        // if private or recallableHeight > 0, we need to update on server
        if (!note.private && note.recallableHeight > 0) {
          // public + recallable
          const txId = await consumeNoteByID(walletAddress, note.id);
          // consume on server level
          await consumeNotes([
            {
              noteId: note.id,
              txId: txId,
            },
          ]);
        } else if (note.private && note.recallableHeight > 0) {
          // private + recallable
          const txId = await consumeUnauthenticatedNote(walletAddress, note);
          // consume on server level
          await consumeNotes([
            {
              noteId: note.id,
              txId: txId,
            },
          ]);
        }
      } else {
        // dont need to update server
        const txId = await consumeNoteByID(walletAddress, note.id);
        await consumePublicNotes([
          {
            sender: note.sender,
            recipient: note.recipient,
            amount: Number(
              formatUnits(BigInt(Math.round(Number(note.assets[0].amount))), note.assets[0].metadata?.decimals),
            ),
            tokenId: note.assets[0].faucetId,
            tokenName: note.assets[0].metadata?.symbol,
            txId: txId,
            noteId: note.id,
            requestPaymentId: consumableNotes.find(n => n.id === note.id)?.requestPaymentId,
          },
        ]);
      }

      if (note.requestPaymentId) {
        await confirmGroupPaymentRequest(note.requestPaymentId);
      }

      setClaiming(false);
      toast.dismiss();

      // Remove the consumed note from the list
      setConsumableNotes(prev => prev.filter(n => n.id !== note.id));
      // Also update checked rows if this note was checked
      setCheckedRows(prev => prev.filter(index => consumableNotes[index]?.id !== note.id));

      toastSuccess();

      await forceRefetchRecallableNotes();
    } catch (error) {
      console.error("Error consuming note:", error);
      toast.dismiss();
      toast.error("Failed to receive payment: " + String(error));
      setClaiming(false);
    }
  };

  const handleClaimSelected = async () => {
    try {
      if (!walletAddress) {
        return toast.error("Please connect your wallet");
      }
      toast.loading("Receiving payments...");

      setClaiming(true);

      // consume on network level
      const txId = await consumeAllUnauthenticatedNotes(
        walletAddress,
        checkedRows.map(idx => ({
          isPrivate: consumableNotes[idx].private,
          noteId: consumableNotes[idx].id,
          partialNote: consumableNotes[idx],
        })),
      );

      // loop through the transactions being consume, and if the transaction is public (non recallable + non private), call consume public notes
      for (const id of checkedRows) {
        const note = consumableNotes[id];
        if (!note.private && note.recallableHeight < 0) {
          await consumePublicNotes([
            {
              sender: note.sender,
              recipient: note.recipient,
              amount: Number(
                formatUnits(BigInt(Math.round(Number(note.assets[0].amount))), note.assets[0].metadata?.decimals),
              ),
              tokenId: note.assets[0].faucetId,
              tokenName: note.assets[0].metadata?.symbol,
              txId: txId,
              noteId: note.id,
              requestPaymentId: consumableNotes.find(n => n.id === note.id)?.requestPaymentId,
            },
          ]);
        }
      }

      // consume on server level
      await consumeNotes(
        checkedRows.map(idx => ({
          noteId: consumableNotes[idx].id,
          txId: txId,
        })),
      );

      // get all private
      setClaiming(false);

      toast.dismiss();

      // Remove the claimed notes from the list
      const claimedNoteIds = checkedRows.map(idx => consumableNotes[idx].id);
      setConsumableNotes(prev => prev.filter(note => !claimedNoteIds.includes(note.id)));
      // Clear the checked rows
      setCheckedRows([]);

      toastSuccess();

      await forceRefetchRecallableNotes();
    } catch (error) {
      console.error("Error consuming notes:", error);
      toast.dismiss();
      toast.error("Failed to receive payments: " + String(error));
      setClaiming(false);
    }
  };

  // Tab content renderers
  const renderPaymentRequestContent = () => (
    <></>
    // <Table
    //   headers={paymentRequestHeaders}
    //   data={tableData}
    //   columnWidths={{ 0: "10%", 1: "20%", 2: "20%", 3: "20%", 4: "20%", 5: "20%" }}
    //   draggable={true}
    //   onDragEnd={handleDragEnd}
    // />
  );

  // Convert receive data to table format - moved outside render function
  const receiveTableData = consumableNotes.map((note, index) => {
    return {
      "header-0": <CustomCheckbox checked={checkedRows.includes(index)} onChange={() => handleCheckRow(index)} />,
      Amount: (
        <div className="flex justify-center items-center gap-2">
          {note.assets.map((asset, assetIndex) => (
            <div key={assetIndex} className="flex items-center gap-1 relative group">
              <img
                src={QASH_TOKEN_ADDRESS == asset.faucetId ? "/q3x-icon.png" : blo(turnBechToHex(asset.faucetId))}
                alt={asset.metadata?.symbol || "Token"}
                className="w-4 h-4 flex-shrink-0 rounded-full"
              />
              <p className="text-text-primary leading-none truncate">
                {formatNumberWithCommas(
                  formatUnits(BigInt(Math.round(Number(asset.amount))), asset.metadata?.decimals),
                )}{" "}
                {asset.metadata?.symbol || "Unknown Token"}
              </p>
            </div>
          ))}
        </div>
      ),
      From: (
        <span className="text-text-primary text-sm leading-none">
          {note.sender.slice(0, 6)}...{note.sender.slice(-4)}
        </span>
      ),
      "Date/Time": <span className="text-text-primary text-sm leading-none">25/09/25, 12:00</span>,
      "Applied automation": (
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center justify-between bg-app-background rounded-lg p-3 max-w-[200px] w-full">
            <span className="text-text-primary text-sm leading-none">None</span>
            <img src="/arrow/chevron-down.svg" alt="info" className="w-4 h-4" />
          </div>
        </div>
      ),
    };
  });

  const renderReceiveContent = () => {
    // Action renderer for receive table
    const receiveActionRenderer = (rowData: Record<string, CellContent>, index: number) => (
      <div className="flex items-center justify-center w-full">
        <div
          className="w-[130px] flex gap-1 p-0.5"
          style={{
            borderRadius: "10px",
            background: "linear-gradient(0deg, #002C69 0%, #0061E7 100%)",
          }}
        >
          <PrimaryButton
            text="Claim"
            onClick={() => handleClaim(consumableNotes[index])}
            disabled={claiming}
            containerClassName="flex-2"
          />
          <SecondaryButton
            variant="light"
            text={<img src="/misc/blue-shopping-bag.svg" alt="Receive all" className="w-5 h-5" />}
            onClick={() => {}}
            disabled={claiming}
            iconPosition="left"
            buttonClassName="flex-1"
          />
        </div>
      </div>
    );

    const renderFooterContent = () => {
      return (
        <div className="flex items-center justify-center gap-2 w-[350px]">
          <button
            type="button"
            className="bg-background justify-center border-b-1 border-primary-divider rounded-lg flex items-center gap-2 px-4 py-2 flex-1 cursor-pointer"
            onClick={() => {}}
          >
            <img alt="" className="w-5" src="/misc/light-shopping-bag.svg" />
            <span className="text-text-primary text-sm">Add to Batch</span>
          </button>
          <SecondaryButton
            text="Claim transactions"
            onClick={() => handleClaimSelected()}
            disabled={claiming}
            buttonClassName="flex-1"
          />
        </div>
      );
    };

    return (
      <>
        <Table
          headers={[
            <CustomCheckbox checked={isAllChecked} onChange={handleCheckAll} />,
            "Amount",
            "From",
            "Date/Time",
            "Applied automation",
          ]}
          data={receiveTableData}
          columnWidths={{ 0: "0%", 1: "10%", 2: "15%", 3: "25%", 4: "25%", 5: "20%" }}
          actionColumn={consumableNotes?.length > 0}
          actionRenderer={consumableNotes?.length > 0 ? receiveActionRenderer : undefined}
          selectedRows={checkedRows}
          footerRenderer={renderFooterContent}
        />
      </>
    );
  };

  const renderCancelPaymentContent = () => (
    <div className="text-center py-8 text-neutral-500">Cancel Payment content coming soon</div>
  );

  const renderPayrollContent = () => (
    <div className="text-center py-8 text-neutral-500">Payroll content coming soon</div>
  );

  // Main content renderer based on active tab
  const renderTabContent = () => {
    switch (activeTab.id) {
      case "payment-request":
        return renderPaymentRequestContent();
      case "receive":
        return renderReceiveContent();
      case "cancel-payment":
        return renderCancelPaymentContent();
      case "payroll":
        return renderPayrollContent();
      //   default:
      //     return renderPaymentRequestContent();
    }
  };

  const renderRecieveHeaderContent = () => {
    return (
      <div className="flex flex-row gap-2">
        <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-background border-b-1 border-primary-divider">
          <div className="flex items-center gap-1 justify-center">
            <span className="text-text-primary text-sm leading-none">Auto claim</span>
            <img src="/misc/gray-info-icon.svg" alt="info" className="w-4 h-4" />
          </div>
          <ToggleSwitch enabled={autoClaim} onChange={setAutoClaim} />
        </div>
        <div className="flex items-center justify-between gap-1 py-2 px-3 rounded-lg bg-background border-b-1 border-primary-divider">
          <img src="/sidebar/filled-setting.svg" alt="info" className="w-4 h-4" />
          <span className="text-text-primary text-sm leading-none">Automation</span>
          <img src="/misc/gray-info-icon.svg" alt="info" className="w-4 h-4" />
        </div>
      </div>
    );
  };

  return (
    <BaseContainer
      header={
        <div className="flex w-full justify-start items-center px-5 py-2">
          <TabContainer
            tabs={tabs}
            activeTab={activeTab.id}
            setActiveTab={tabId => {
              const tab = tabs.find(t => t.id === tabId);
              if (tab) setActiveTab(tab);
            }}
            textSize="sm"
          />
        </div>
      }
    >
      <div className="w-full justify-between items-center flex p-5">
        <div className="flex flex-col gap-2">
          <span className="text-text-primary text-xl leading-none">{activeTab.label}</span>
          <span className="text-text-secondary text-sm leading-none">{activeTab.description}</span>
        </div>
        {activeTab.id === "receive" && renderRecieveHeaderContent()}
      </div>

      <div className=" overflow-y-auto w-full px-5 pb-5">{renderTabContent()}</div>
    </BaseContainer>
  );
};
