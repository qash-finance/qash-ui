import React, { useState, useEffect, useCallback } from "react";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import { useRecallBatch } from "@/services/api/transaction";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useGiftDashboard } from "@/hooks/server/useGiftDashboard";
import { formatAddress } from "@/services/utils/miden/address";
import { MIDEN_EXPLORER_URL, QASH_TOKEN_ADDRESS, REFETCH_DELAY } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { RecallableNote, RecallableNoteType } from "@/types/transaction";
import {
  consumeNoteByID,
  consumeNoteByIDs,
  consumeUnauthenticatedGiftNote,
  consumeUnauthenticatedGiftNotes,
  createGiftNote,
  stringToSecretArray,
} from "@/services/utils/miden/note";
import toast from "react-hot-toast";
import { Table } from "@/components/Common/Table";
import { ActionButton } from "@/components/Common/ActionButton";
import { CustomCheckbox } from "@/components/Common/CustomCheckbox";
import SkeletonLoading from "@/components/Common/SkeletonLoading";
import { SecondaryButton } from "@/components/Common/SecondaryButton";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

interface CancelPaymentCardProps {
  time?: string;
  number?: string;
  title: string;
  subtitle: string;
  isTimer?: boolean;
  progress?: number; // Progress percentage (0-100)
}

interface CircularProgressProps {
  size: number;
  progress: number;
  strokeWidth?: number;
  className?: string;
}

const CircularProgress = ({ size, progress, strokeWidth = 3, className = "" }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" style={{ width: size, height: size }}>
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F6F6F6" strokeWidth={strokeWidth} fill="none" />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#066eff"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  );
};

const CancelPaymentCard = ({
  time,
  number,
  title,
  subtitle,
  isTimer = false,
  progress = 0,
}: CancelPaymentCardProps) => {
  return (
    <div
      className={`flex flex-1 flex-row justify-between items-center bg-background rounded-xl ${isTimer ? "p-3.5" : "p-5"} relative border border-primary-divider`}
    >
      <div className="flex flex-col gap-1 w-fit">
        {isTimer ? (
          <div className="flex items-center gap-3">
            <div className="font-repetition-scrolling text-3xl leading-none text-primary-blue">{time}</div>
          </div>
        ) : (
          <div className=" font-semibold text-2xl leading-none text-text-primary tracking-[-0.48px]">{number}</div>
        )}
        <div className="font-medium text-sm leading-5 text-text-secondary tracking-[-0.56px]">{subtitle}</div>
      </div>
      {isTimer && <CircularProgress size={60} progress={progress} strokeWidth={3} />}
    </div>
  );
};

const Tab = ({ title, isActive, onClick }: { title: string; isActive: boolean; onClick: () => void }) => {
  return (
    <div
      className={`flex justify-center items-center rounded-full w-fit px-4 py-1 ${isActive ? "bg-background" : "cursor-pointer"} transition-all duration-150 ease-in-out`}
      onClick={onClick}
    >
      <span className={`text-lg ${isActive ? "text-text-primary" : "text-text-secondary"}`}>{title}</span>
    </div>
  );
};

export const CancelPayment = () => {
  // **************** Server Hooks *******************
  const {
    data: recallableNotes,
    isLoading: recallableNotesLoading,
    refetch: refetchRecallableNotes,
  } = useRecallableNotes();
  const { refetch: refetchGiftDashboard } = useGiftDashboard();

  const { mutateAsync: recallBatch } = useRecallBatch();
  const { accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { isConnected } = useWalletConnect();

  // **************** Local State *******************
  const [activeTab, setActiveTab] = useState("pending");
  const [countdown, setCountdown] = React.useState("00H:00M:00S");
  const [countdownProgress, setCountdownProgress] = React.useState(0);
  const [recallingNoteId, setRecallingNoteId] = React.useState<number | null>(null);
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);
  const [checkedWaitingRows, setCheckedWaitingRows] = useState<number[]>([]);

  // Update countdown every second
  useEffect(() => {
    if (!recallableNotes?.nextRecallTime) return;

    const updateCountdown = () => {
      if (isConnected) {
        const date = new Date(recallableNotes.nextRecallTime);
        const now = new Date();
        let diff = Math.max(0, date.getTime() - now.getTime());

        // Calculate progress (0-100%) based on the actual recall period
        // Use the first recallable item to determine the recall period start time
        const firstRecallableItem = recallableNotes.recallableItems?.[0] || recallableNotes.waitingToRecallItems?.[0];
        if (firstRecallableItem) {
          const recallableTime = new Date(recallableNotes.nextRecallTime).getTime();
          const createdAt = new Date(firstRecallableItem.createdAt).getTime();
          const totalTimeToRecall = recallableTime - createdAt;
          const elapsedTime = now.getTime() - createdAt;
          const progress = Math.min(100, Math.max(0, (elapsedTime / totalTimeToRecall) * 100));
          setCountdownProgress(progress);
        } else {
          // Fallback: assume 24-hour period if no items available
          const totalRecallPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const progress = Math.max(0, Math.min(100, (diff / totalRecallPeriod) * 100));
          setCountdownProgress(100 - progress);
        }

        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
        diff %= 3600000;
        const minutes = String(Math.floor(diff / 60000)).padStart(2, "0");
        diff %= 60000;
        const seconds = String(Math.floor(diff / 1000)).padStart(2, "0");
        setCountdown(`${hours}H:${minutes}M:${seconds}S`);
      } else {
        setCountdown("00H:00M:00S");
        setCountdownProgress(0);
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [recallableNotes?.nextRecallTime, isConnected]);
  // **************** Table Headers *******************

  // **************** Checkbox Handlers *******************
  const handleCheckRow = React.useCallback((idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  }, []);

  const handleCheckAll = useCallback(() => {
    if (checkedRows.length === (recallableNotes?.recallableItems?.length || 0)) {
      setCheckedRows([]);
    } else {
      setCheckedRows((recallableNotes?.recallableItems || []).map((_: any, idx: any) => idx));
    }
  }, [checkedRows, recallableNotes?.recallableItems]);

  const handleCheckWaitingRow = React.useCallback((idx: number) => {
    setCheckedWaitingRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  }, []);

  const handleCheckAllWaiting = useCallback(() => {
    if (checkedWaitingRows.length === (recallableNotes?.waitingToRecallItems?.length || 0)) {
      setCheckedWaitingRows([]);
    } else {
      setCheckedWaitingRows((recallableNotes?.waitingToRecallItems || []).map((_: any, idx: any) => idx));
    }
  }, [checkedWaitingRows, recallableNotes?.waitingToRecallItems]);

  const isAllChecked =
    recallableNotes?.recallableItems?.length &&
    recallableNotes?.recallableItems?.length > 0 &&
    checkedRows.length === recallableNotes?.recallableItems?.length;

  const isAllCheckedWaiting =
    recallableNotes?.waitingToRecallItems?.length &&
    recallableNotes?.waitingToRecallItems?.length > 0 &&
    checkedWaitingRows.length === recallableNotes?.waitingToRecallItems?.length;

  const readyToCancelHeaders = [
    <CustomCheckbox checked={isAllChecked as boolean} onChange={handleCheckAll} />,
    "Amount",
    "To",
    "Date/Time",
    "Action",
  ];
  const upcomingCancelHeaders = [
    <CustomCheckbox checked={isAllCheckedWaiting as boolean} onChange={handleCheckAllWaiting} />,
    "Amount",
    "To",
    "Date/Time",
    "Recall in",
    "Action",
  ];

  // **************** Cancel Actions *******************
  const handleCancelAll = async () => {
    try {
      toast.loading("Cancelling transactions...");

      // Get the appropriate notes based on active tab
      const notes =
        activeTab === "pending"
          ? checkedRows.map(idx => recallableNotes?.recallableItems[idx])
          : checkedWaitingRows.map(idx => recallableNotes?.waitingToRecallItems[idx]);

      // notesId to consume
      const noteIds = notes.map(note => note?.noteId).filter(noteId => noteId !== undefined);

      if (noteIds.length > 0) {
        setRecallingNoteId(Number(noteIds[0]));

        // filter out transaction note ids
        const transactionNoteIds = notes
          .filter(note => !note?.isGift)
          .map(note => note?.noteId)
          .filter(noteId => noteId !== undefined);

        if (transactionNoteIds.length > 0) {
          const p2ideTxId = await consumeNoteByIDs(walletAddress, transactionNoteIds);

          // find all transaction note based on transactionNoteIds
          const transactionNotes = notes.filter(note => transactionNoteIds.includes(note?.noteId!));
          if (transactionNotes.length > 0) {
            await recallBatch({
              items: [
                ...transactionNotes
                  .filter(note => note != undefined)
                  .map(note => ({
                    type: RecallableNoteType.TRANSACTION,
                    id: note.id,
                  })),
              ],
              txId: p2ideTxId,
            });
          }
        }

        // prepare list of gift note
        const giftNotes = notes.filter(note => note?.isGift);
        let preparedGiftNotes = [];
        let secrets = [];
        for (const giftNote of giftNotes) {
          if (giftNote) {
            const secret = stringToSecretArray(giftNote.secretHash!);
            secrets.push(secret);
            const [note, _] = await createGiftNote(
              giftNote?.sender!,
              giftNote?.assets[0].faucetId!,
              BigInt(Number(giftNote?.assets[0].amount!) * 10 ** giftNote?.assets[0].metadata.decimals!),
              secret,
              giftNote?.serialNumber?.map(Number) as [number, number, number, number],
            );
            preparedGiftNotes.push(note);
          }
        }

        if (preparedGiftNotes.length > 0) {
          // consume all gift notes
          const giftTxId = await consumeUnauthenticatedGiftNotes(walletAddress, preparedGiftNotes, secrets);

          await recallBatch({
            items: [
              ...giftNotes
                .filter(note => note != undefined)
                .map(note => ({
                  type: RecallableNoteType.GIFT,
                  id: note.id,
                })),
            ],
            txId: giftTxId,
          });
        }

        // refetch recallable notes
        await refetchRecallableNotes();

        // refetch assets
        setTimeout(() => {
          forceRefetchAssets();
        }, REFETCH_DELAY);

        // Clear the appropriate checked rows based on active tab
        if (activeTab === "pending") {
          setCheckedRows([]);
        } else {
          setCheckedWaitingRows([]);
        }
      }

      toast.dismiss();
      toast.success("All selected transactions cancelled successfully");
    } catch (error) {
      console.error("Error cancelling notes:", error);
      toast.dismiss();
      toast.error("Failed to cancel transactions");
    } finally {
      setRecallingNoteId(null);
    }
  };

  const renderCancelAction = (recallingNote: RecallableNote) => (
    <div className="flex justify-center items-center">
      <SecondaryButton
        text="Cancel"
        disabled={recallingNoteId !== null || new Date(recallingNote.recallableTime) > new Date()}
        onClick={async () => {
          try {
            toast.loading("Cancelling transaction...");
            console.log(recallingNote);

            setRecallingNoteId(recallingNote.id);

            let txId = "";

            if (recallingNote.isGift) {
              const secret = stringToSecretArray(recallingNote.secretHash!);

              // we need to build the note and consume with unanthenticated note
              // build gift note
              const [note, _] = await createGiftNote(
                recallingNote?.sender!,
                recallingNote?.assets[0].faucetId!,
                BigInt(Number(recallingNote?.assets[0].amount!) * 10 ** recallingNote?.assets[0].metadata.decimals!),
                secret,
                recallingNote?.serialNumber?.map(Number) as [number, number, number, number],
              );

              txId = await consumeUnauthenticatedGiftNote(walletAddress, note, secret);

              await recallBatch({
                items: [
                  {
                    type: RecallableNoteType.GIFT,
                    id: recallingNote.id,
                  },
                ],
                txId: txId,
              });
            } else {
              txId = await consumeNoteByID(recallingNote.sender, recallingNote.noteId.toString());

              // recall on server
              await recallBatch({
                items: [
                  {
                    type: RecallableNoteType.TRANSACTION,
                    id: recallingNote.id,
                  },
                ],
                txId: txId,
              });
            }

            // refetch recallable notes
            await refetchRecallableNotes();

            toast.dismiss();
            toast.success(
              <div>
                Transaction recalled successfully, view transaction on{" "}
                <a
                  href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Miden Explorer
                </a>
              </div>,
            );

            // refetch gift dashboard
            await refetchGiftDashboard();
          } catch (error) {
            console.error("Error recalling note:", error);
            toast.dismiss();
            toast.error("Failed to recall transaction");
          } finally {
            setRecallingNoteId(null);
          }
        }}
        buttonClassName="w-fit px-10"
      />
    </div>
  );

  // **************** Data Preparation *******************
  const readyToCancelData =
    recallableNotes?.recallableItems?.map((note: RecallableNote, index: number) => ({
      "header-0": <CustomCheckbox checked={checkedRows.includes(index)} onChange={() => handleCheckRow(index)} />,
      Amount: (
        <div className="relative flex flex-row flex-wrap gap-1 items-center justify-center">
          <div className="group relative flex items-center gap-1">
            <img
              src={
                QASH_TOKEN_ADDRESS == note.assets[0].faucetId
                  ? "/q3x-icon.png"
                  : blo(turnBechToHex(note.assets[0].faucetId))
              }
              alt={note.assets[0].metadata?.symbol || "Token"}
              className="w-4 h-4 flex-shrink-0 rounded-full"
            />
            <span className="text-text-primary">{note.assets[0].amount}</span>
            {/* Tooltip on hover */}
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
              {note.assets[0].metadata?.symbol || "Unknown Token"}
            </div>
          </div>
          {/* {note.isGift && (
            <span className="ml-3 bg-[#292929] flex items-center justify-between px-3 py-0.5 rounded-lg w-fit">
              <span className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">Gift</span>
            </span>
          )} */}
        </div>
      ),
      To: (
        <div className="items-center bg-opacity-10 flex justify-center">
          {note.isGift ? (
            <div className="text-text-primary">-</div>
          ) : (
            <span className="text-text-primary">{formatAddress(note.recipient)}</span>
          )}
        </div>
      ),
      "Date/Time": <span className="text-text-primary">{formatDate(note.createdAt)}</span>,
      Action: renderCancelAction(note),
    })) || [];

  const upcomingCancelData =
    recallableNotes?.waitingToRecallItems?.map((note: any, index: number) => ({
      "header-0": (
        <CustomCheckbox checked={checkedWaitingRows.includes(index)} onChange={() => handleCheckWaitingRow(index)} />
      ),
      Amount: (
        <div className="relative flex flex-row flex-wrap gap-1 items-center justify-center">
          <div className="group relative flex items-center gap-1">
            <img
              src={
                QASH_TOKEN_ADDRESS == note.assets[0].faucetId
                  ? "/q3x-icon.png"
                  : blo(turnBechToHex(note.assets[0].faucetId))
              }
              alt={note.assets[0].metadata?.symbol || "Token"}
              className="w-4 h-4 flex-shrink-0 rounded-full"
            />
            <span className="text-text-primary">{note.assets[0].amount}</span>
            {/* Tooltip on hover */}
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
              {note.assets[0].metadata?.symbol || "Unknown Token"}
            </div>
          </div>
          {/* {note.isGift && (
            <span className="ml-3 bg-background flex items-center justify-between px-3 py-0.5 rounded-lg w-fit">
              <span className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">Gift</span>
            </span>
          )} */}
        </div>
      ),
      To: (
        <div className="items-center bg-opacity-10 flex justify-center">
          {note.isGift ? (
            <div className="text-text-primary">-</div>
          ) : (
            <span className="text-text-primary">{formatAddress(note.recipient)}</span>
          )}
        </div>
      ),
      "Date/Time": <span className="text-text-primary">{formatDate(note.createdAt)}</span>,
      "Recall in": <span className="text-text-primary">{formatDate(note.recallableTime)}</span>,
      Action: renderCancelAction(note),
    })) || [];

  if (recallableNotesLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4 items-center w-full">
        <CancelPaymentCard
          time={countdown}
          title="Next cancel payment"
          subtitle="Next cancel payment"
          isTimer={true}
          progress={countdownProgress}
        />
        <CancelPaymentCard
          number={recallableNotes?.waitingToRecallItems?.length.toString() || "0"}
          title="Waiting for cancel payment"
          subtitle="Waiting for cancel payment"
        />
        <CancelPaymentCard
          number={recallableNotes?.recalledCount?.toString() || "0"}
          title="Cancelled"
          subtitle="Cancelled"
        />
      </div>
      <div className="flex justify-start items-center gap-2">
        <Tab title="Pending to Cancel" isActive={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
        <Tab title="Waiting for Cancel" isActive={activeTab === "waiting"} onClick={() => setActiveTab("waiting")} />
      </div>

      {activeTab === "pending" && (
        <Table
          columnWidths={{
            4: "15%",
          }}
          headers={readyToCancelHeaders}
          data={readyToCancelData}
          selectedRows={checkedRows}
          footerRenderer={() => (
            <SecondaryButton
              text="Cancel transactions"
              onClick={handleCancelAll}
              disabled={recallingNoteId !== null}
              buttonClassName="w-[190px]"
            />
          )}
        />
      )}

      {activeTab === "waiting" && (
        <Table
          columnWidths={{
            4: "15%",
          }}
          headers={upcomingCancelHeaders}
          data={upcomingCancelData}
          selectedRows={checkedWaitingRows}
          footerRenderer={() => (
            <SecondaryButton
              text="Cancel transactions"
              onClick={handleCancelAll}
              disabled={recallingNoteId !== null}
              buttonClassName="w-[190px]"
            />
          )}
        />
      )}
    </div>
  );
};
