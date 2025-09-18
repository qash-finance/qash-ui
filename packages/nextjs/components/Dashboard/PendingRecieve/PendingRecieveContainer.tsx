"use client";
import React, { useState, useCallback, useEffect } from "react";
import ReceiveAddress from "./ReceiveAddress";
import { ActionButton } from "@/components/Common/ActionButton";
import { ToggleSwitch } from "@/components/Common/ToggleSwitch";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { toast } from "react-hot-toast";
import { Empty } from "@/components/Common/Empty";
import {
  consumeAllUnauthenticatedNotes,
  consumeUnauthenticatedNote,
  consumeNoteByID,
} from "@/services/utils/miden/note";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { AssetWithMetadata, PartialConsumableNote } from "@/types/faucet";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { formatNumberWithCommas } from "@/services/utils/formatNumber";
import { formatUnits } from "viem";
import { useConsumableNotes } from "@/hooks/server/useConsumableNotes";
import useConsumeNotes from "@/hooks/server/useConsume";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import SkeletonLoading from "@/components/Common/SkeletonLoading";
import { CustomCheckbox } from "@/components/Common/CustomCheckbox";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useConfirmGroupPaymentRequest } from "@/services/api/request-payment";
import { useConsumePublicNotes } from "@/services/api/transaction";

const HeaderColumns = ["Amount", "From", "Action"];

const TableHeader = ({
  columns,
  allChecked,
  onCheckAll,
}: {
  columns: string[];
  allChecked: boolean;
  onCheckAll: () => void;
}) => {
  return (
    <thead>
      <tr className="bg-[#181818] ">
        <th className=" text-center text-sm font-medium text-neutral-400 rounded-tl-lg py-2">
          <CustomCheckbox checked={allChecked} onChange={onCheckAll} />
        </th>
        {columns.map((column, index) => (
          <th
            key={column}
            className={` text-center font-medium text-neutral-400 border-r border-[#292929] py-2 ${
              index === 0 ? "rounded-tl-lg" : ""
            } ${index === columns.length - 1 ? "rounded-tr-lg border-r-0" : ""} ${index === 1 ? "min-w-[300px]" : ""}`}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const TableRow = ({
  assets,
  from,
  dateTime,
  action,
  checked,
  onCheck,
  onClaim,
  disabled,
}: {
  assets: AssetWithMetadata[];
  from: string;
  dateTime: string;
  action: string;
  checked: boolean;
  onCheck: () => void;
  onClaim: () => void;
  disabled: boolean;
}) => {
  return (
    <tr className="bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]">
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <CustomCheckbox checked={checked} onChange={onCheck} />
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 min-w-[300px]">
        <div className="flex justify-center items-center gap-2">
          {assets.map((asset, index) => (
            <div key={index} className="flex items-center gap-1 relative group">
              <img
                src={QASH_TOKEN_ADDRESS == asset.faucetId ? "/q3x-icon.png" : blo(turnBechToHex(asset.faucetId))}
                alt={asset.metadata?.symbol || "Token"}
                className="w-4 h-4 flex-shrink-0 rounded-full"
              />
              <p className="text-stone-300 truncate">
                {formatNumberWithCommas(
                  formatUnits(BigInt(Math.round(Number(asset.amount))), asset.metadata?.decimals),
                )}
              </p>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {asset.metadata?.symbol || "Unknown Token"}
              </div>
            </div>
          ))}
        </div>
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
          <span className="text-white font-medium">
            {from.slice(0, 6)}...{from.slice(-4)}
          </span>
        </div>
      </td>

      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <ActionButton text="Receive" onClick={() => onClaim()} disabled={disabled} />
        </div>
      </td>
    </tr>
  );
};

export const PendingRecieveContainer: React.FC = () => {
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
  const [autoClaim, setAutoClaim] = useState(false);
  const [consumableNotes, setConsumableNotes] = useState<PartialConsumableNote[]>([]);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const [claiming, setClaiming] = useState(false);
  console.log("consumableNotesFromServer", consumableNotesFromServer);
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

  const isAllChecked = consumableNotes.length > 0 && checkedRows.length === consumableNotes.length;

  // **************** Local State *******************
  const handleCheckAll = useCallback(() => {
    if (isAllChecked) setCheckedRows([]);
    else setCheckedRows(consumableNotes.map((_, idx) => idx));
  }, [isAllChecked, consumableNotes]);

  const handleCheckRow = useCallback((idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  }, []);

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
      toast.success("Payment received successfully");

      // Remove the consumed note from the list
      setConsumableNotes(prev => prev.filter(n => n.id !== note.id));
      // Also update checked rows if this note was checked
      setCheckedRows(prev => prev.filter(index => consumableNotes[index]?.id !== note.id));

      await forceRefetchRecallableNotes();
    } catch (error) {
      console.error("Error consuming note:", error);
      toast.dismiss();
      toast.error("Failed to receive payment: " + String(error));
      setClaiming(false);
    }
  };

  const handleClaimAll = async () => {
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
      toast.success("Payments received successfully");

      // Remove the claimed notes from the list
      const claimedNoteIds = checkedRows.map(idx => consumableNotes[idx].id);
      setConsumableNotes(prev => prev.filter(note => !claimedNoteIds.includes(note.id)));
      // Clear the checked rows
      setCheckedRows([]);

      await forceRefetchRecallableNotes();
    } catch (error) {
      console.error("Error consuming notes:", error);
      toast.dismiss();
      toast.error("Failed to receive payments: " + String(error));
      setClaiming(false);
    }
  };

  return (
    <div className="flex w-full h-full bg-neutral-900  rounded-xl text-white p-6 space-y-6 gap-4">
      {
        <div className="flex-3">
          <div>
            {/* Pending Section */}
            <div className=" pending-to-receive flex items-center justify-between">
              <div>
                <header className="flex flex-col gap-2 justify-center items-start w-full">
                  <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
                    Pending to receive
                  </h2>
                  <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
                    Payments sent to you that are ready to be added to your wallet
                  </p>
                </header>
              </div>

              <div className="cursor-not-allowed flex items-center gap-2 bg-white rounded-lg px-3 py-1">
                <span className="text-lg text-black">Auto Claim</span>
                <ToggleSwitch disabled={true} enabled={autoClaim} onChange={() => setAutoClaim(!autoClaim)} />
              </div>
            </div>
            {!isConnected ? (
              <div className="mt-2">
                <Empty title="No pending receive" />
              </div>
            ) : isLoadingConsumableNotesFromServer ? (
              <SkeletonLoading />
            ) : (
              <div>
                {/* Pending Table */}
                <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-800" data-tour="pending-payments">
                  {consumableNotes?.length === 0 || !consumableNotes ? (
                    <Empty title="No pending receive" />
                  ) : (
                    <table className="w-full">
                      <TableHeader
                        columns={HeaderColumns}
                        allChecked={isAllChecked || false}
                        onCheckAll={handleCheckAll}
                      />
                      <tbody>
                        {consumableNotes?.map((row, index) => (
                          <TableRow
                            key={`pending-${index}`}
                            assets={row.assets}
                            from={row.sender}
                            dateTime={new Date().toISOString()}
                            action={"Claim"}
                            checked={checkedRows.includes(index)}
                            onCheck={() => handleCheckRow(index)}
                            onClaim={() => handleClaim(row)}
                            disabled={claiming}
                          />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {checkedRows.length > 0 && (
                  <div className="flex items-center justify-end mt-2 gap-2">
                    <ActionButton text="Cancel" type="neutral" onClick={() => setCheckedRows([])} />
                    <ActionButton text="Receive all" onClick={() => handleClaimAll()} disabled={claiming} />
                  </div>
                )}
                {/* Unverified Section */}
                {isConnected && (
                  <React.Fragment>
                    <div className="mt-10">
                      <div>
                        <header className="flex flex-col gap-2 justify-center items-start w-full">
                          <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
                            Unverified request
                          </h2>
                          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
                            Payments that need additional confirmation before you can receive them
                          </p>
                        </header>
                      </div>
                    </div>
                    <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-800">
                      <Empty title="No pending receive" />
                    </div>
                  </React.Fragment>
                )}
              </div>
            )}
          </div>
        </div>
      }

      <div className="flex-1" data-tour="receive-section">
        <ReceiveAddress
          onEnterAmount={() => {
            openModal(MODAL_IDS.CREATE_CUSTOM_QR);
          }}
        />
      </div>
    </div>
  );
};
