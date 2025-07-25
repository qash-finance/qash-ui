"use client";
import * as React from "react";
import { StatusCard } from "./StatusCard";
import { Table } from "../../Common/Table";
import { ActionButton } from "../../Common/ActionButton";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import SkeletonLoading from "@/components/Common/SkeletonLoading";
import { formatAddress } from "@/services/utils/miden/address";
import { qashTokenAddress } from "@/services/utils/constant";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { RecallableNote } from "@/types/transaction";
import { customCreateP2IDENote } from "@/services/utils/miden/note";
import {
  AccountId,
  Felt,
  NoteAndArgs,
  NoteAndArgsArray,
  NoteType,
  TransactionRequestBuilder,
} from "@demox-labs/miden-sdk";
import {
  submitTransactionWithOwnInputNotes,
  submitTransactionWithOwnOutputNotes,
} from "@/services/utils/miden/transactions";
import toast from "react-hot-toast";

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

const TableSection = ({
  title,
  subtitle,
  headers,
  data,
  actionRenderer,
  columnWidths,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  data: any[];
  actionRenderer: (rowData: any, index: number) => React.ReactNode;
  columnWidths?: Record<number, string>;
}) => (
  <section className="mt-2.5 w-full max-md:max-w-full">
    <div className="w-full max-md:max-w-full">
      <div className="flex gap-2.5 items-start w-full max-md:max-w-full">
        <div className="flex flex-col flex-1 shrink justify-center w-full basis-0 min-w-60 max-md:max-w-full">
          <h1 className="text-white text-xl font-bold">{title}</h1>
          <p className="mt-2 text-base tracking-tight leading-none text-neutral-500 max-md:max-w-full">{subtitle}</p>
        </div>
      </div>
      <div className="mt-2.5">
        <Table
          headers={headers}
          data={data}
          actionColumn={true}
          actionRenderer={actionRenderer}
          className="w-full"
          columnWidths={columnWidths}
        />
      </div>
    </div>
  </section>
);

export const CancelDashboardContainer: React.FC = () => {
  // **************** Server Hooks *******************
  const {
    data: recallableNotes,
    isLoading: recallableNotesLoading,
    refetch: refetchRecallableNotes,
  } = useRecallableNotes();
  const [countdown, setCountdown] = React.useState("00H:00M:00S");
  const [recallingNoteId, setRecallingNoteId] = React.useState<number | null>(null);
  const [checkedRows, setCheckedRows] = React.useState<number[]>([]);

  // Update countdown every second
  React.useEffect(() => {
    if (!recallableNotes?.nextRecallTime) return;

    const updateCountdown = () => {
      const date = new Date(recallableNotes.nextRecallTime);
      const now = new Date();
      let diff = Math.max(0, date.getTime() - now.getTime());
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      diff %= 3600000;
      const minutes = String(Math.floor(diff / 60000)).padStart(2, "0");
      diff %= 60000;
      const seconds = String(Math.floor(diff / 1000)).padStart(2, "0");
      setCountdown(`${hours}H:${minutes}M:${seconds}S`);
    };

    // Initial update
    updateCountdown();

    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [recallableNotes?.nextRecallTime]);

  // **************** Local State *******************
  const pendingHeaders = ["", "Amount", "To", "Date/Time"];
  const waitingHeaders = ["Amount", "To", "Date/Time", "Recall in"];

  const handleCheckRow = React.useCallback((idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  }, []);

  const handleCheckAll = React.useCallback(
    (items: any[]) => {
      if (checkedRows.length === items.length) {
        setCheckedRows([]);
      } else {
        setCheckedRows(items.map((_, idx) => idx));
      }
    },
    [checkedRows],
  );

  const handleCancelAll = async () => {
    try {
      toast.loading("Cancelling transactions...");

      // Process each checked note
      for (const idx of checkedRows) {
        const note = recallableNotes?.recallableItems[idx];
        if (!note) continue;

        setRecallingNoteId(note.id);

        // build p2ide
        const p2ideNote = await customCreateP2IDENote(
          AccountId.fromBech32(note.sender),
          AccountId.fromBech32(note.recipient),
          Number(note.assets[0].amount),
          AccountId.fromBech32(note.assets[0].faucetId),
          note.recallableHeight,
          note.recallableHeight,
          note.private ? NoteType.Private : NoteType.Public,
          0,
          note.serialNumber.map(serialNumber => new Felt(BigInt(serialNumber))),
        );

        // submit tx
        await submitTransactionWithOwnInputNotes(
          new NoteAndArgsArray([new NoteAndArgs(p2ideNote)]),
          AccountId.fromBech32(note.sender),
        );
      }

      // refetch recallable notes
      await refetchRecallableNotes();
      setCheckedRows([]);

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
      <ActionButton
        text={"Cancel"}
        disabled={recallingNoteId === recallingNote.id || new Date(recallingNote.recallableTime) > new Date()}
        onClick={async () => {
          try {
            toast.loading("Cancelling transaction...");
            setRecallingNoteId(recallingNote.id);

            // build p2ide
            const note = await customCreateP2IDENote(
              AccountId.fromBech32(recallingNote.sender),
              AccountId.fromBech32(recallingNote.recipient),
              Number(recallingNote.assets[0].amount),
              AccountId.fromBech32(recallingNote.assets[0].faucetId),
              recallingNote.recallableHeight,
              recallingNote.recallableHeight,
              recallingNote.private ? NoteType.Private : NoteType.Public,
              0,
              recallingNote.serialNumber.map(serialNumber => new Felt(BigInt(serialNumber))),
            );

            // submit tx
            const txId = await submitTransactionWithOwnInputNotes(
              new NoteAndArgsArray([new NoteAndArgs(note)]),
              AccountId.fromBech32(recallingNote.sender),
            );

            // refetch recallable notes
            await refetchRecallableNotes();

            toast.dismiss();
            toast.success(
              <div>
                Transaction sent successfully, view transaction on{" "}
                <a
                  href={`https://testnet.midenscan.com/tx/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Miden Explorer
                </a>
              </div>,
            );
          } catch (error) {
            console.error("Error recalling note:", error);
            toast.dismiss();
            toast.error("Failed to cancel transaction");
          } finally {
            setRecallingNoteId(null);
          }
        }}
      />
    </div>
  );

  return (
    <section className="rounded-2xl bg-neutral-900 w-full h-full px-[16px] py-[20px]">
      {recallableNotesLoading ? (
        <SkeletonLoading />
      ) : (
        <div className="flex-1 w-full max-md:max-w-full">
          <article className="overflow-hidden flex-1 text-white rounded-xl bg-[#1E1E1E] min-w-60"></article>
          <div className="flex flex-wrap gap-2 p-1.5 w-full rounded-2xl bg-neutral-950 min-h-[164px] max-md:max-w-full">
            <article className=" flex-1 text-white rounded-xl bg-[#1E1E1E] ">
              <div
                className=" relative flex-1 shrink rounded-2xl basis-0 bg-[#1150AE] min-w-60 border-white border-solid shadow-md border-[3px] mt-5 h-[87%]"
                style={{
                  backgroundImage: `
                  linear-gradient(to bottom, rgba(30,160,220,0.7), rgba(17,80,174,0.1)),
                  url('/cancel-card-background.svg')
                `,
                  backgroundSize: "cover, cover",
                  backgroundPosition: "center, center",
                }}
              >
                <div className="flex-col rounded-[10px] flex justify-center items-center h-[105px] ">
                  <div className="relative top-[-10px] z-0">
                    <img src="/cancel-card-header.svg" alt="cancel-background" className="w-full h-full" />
                  </div>
                  <div className="relative top-[-65px] z-10">
                    <span className="text-white text-lg font-normal font-['Barlow']">Next cancel payment</span>
                  </div>
                  <div className="font-bold text-4xl text-white relative top-[-25px] z-10 font-repetition-scrolling">
                    {countdown}
                  </div>
                </div>
              </div>
            </article>

            <StatusCard
              title="Waiting for cancel payment"
              value={recallableNotes?.recalledCount.toString() || "0"}
              hasBackground={true}
            />

            <StatusCard
              title="Cancelled"
              value={recallableNotes?.recalledCount.toString() || "0"}
              hasBackground={true}
            />
          </div>

          <TableSection
            title="Ready to Cancel"
            subtitle="Payments that are now eligible for cancellation. You can select multiple payments to cancel them in batch."
            headers={pendingHeaders}
            data={
              recallableNotes?.recallableItems.map((note, index) => ({
                "": (
                  <div className="flex justify-center items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={checkedRows.includes(index)}
                      onChange={() => handleCheckRow(index)}
                    />
                  </div>
                ),
                Amount: (
                  <div className="relative flex flex-row flex-wrap gap-1 items-center">
                    <div className="group relative flex items-center gap-1">
                      <img
                        src={
                          qashTokenAddress == note.assets[0].faucetId
                            ? "/q3x-icon.svg"
                            : blo(turnBechToHex(note.assets[0].faucetId))
                        }
                        alt={note.assets[0].metadata?.symbol || "Token"}
                        className="w-4 h-4 flex-shrink-0 rounded-full"
                      />
                      <span className="text-white">{note.assets[0].amount}</span>
                      {/* Tooltip on hover */}
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        {note.assets[0].metadata?.symbol || "Unknown Token"}
                      </div>
                    </div>
                  </div>
                ),
                To: (
                  <div className="items-center bg-opacity-10  flex justify-center">
                    <span className="text-white py-1 bg-[#363636] px-5 rounded-[34px]">
                      {formatAddress(note.recipient)}
                    </span>
                  </div>
                ),
                "Date/Time": <span className="text-stone-300 text-sm">{formatDate(note.createdAt)}</span>,
                actionDisabled: false,
                originalNote: note,
              })) || []
            }
            actionRenderer={rowData => renderCancelAction(rowData.originalNote)}
            columnWidths={{
              "0": "5%",
              "1": "55%",
              "2": "20%",
              "3": "20%",
            }}
          />

          {checkedRows.length > 0 && (
            <div className="flex items-center justify-end mt-2 gap-2">
              <ActionButton text="Cancel selection" type="neutral" onClick={() => setCheckedRows([])} />
              <ActionButton text="Cancel all selected" onClick={handleCancelAll} disabled={recallingNoteId !== null} />
            </div>
          )}
          <div className="my-5"></div>
          <TableSection
            title="Upcoming Cancellations"
            subtitle="Payments that will become cancellable once their scheduled time is reached. The cancel button will automatically enable at the specified time."
            headers={waitingHeaders}
            data={
              recallableNotes?.waitingToRecallItems.map((note, index) => ({
                Amount: (
                  <div className="relative flex flex-row flex-wrap gap-1 items-center">
                    <div className="group relative flex items-center gap-1">
                      <img
                        src={
                          qashTokenAddress == note.assets[0].faucetId
                            ? "/q3x-icon.svg"
                            : blo(turnBechToHex(note.assets[0].faucetId))
                        }
                        alt={note.assets[0].metadata?.symbol || "Token"}
                        className="w-4 h-4 flex-shrink-0 rounded-full"
                      />
                      <span className="text-white">{note.assets[0].amount}</span>
                      {/* Tooltip on hover */}
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        {note.assets[0].metadata?.symbol || "Unknown Token"}
                      </div>
                    </div>
                  </div>
                ),
                To: (
                  <div className="items-center bg-opacity-10  flex justify-center">
                    <span className="text-white py-1 bg-[#363636] px-5 rounded-[34px]">
                      {formatAddress(note.recipient)}
                    </span>
                  </div>
                ),
                "Date/Time": <span className="text-stone-300 text-sm">{formatDate(note.createdAt)}</span>,
                "Recall in": <span className="text-stone-300 text-sm">{formatDate(note.recallableTime)}</span>,
                actionDisabled: new Date(note.recallableTime) > new Date(),
                originalNote: note,
              })) || []
            }
            actionRenderer={rowData => renderCancelAction(rowData.originalNote)}
            columnWidths={{
              "0": "35%",
              "1": "25%",
              "2": "20%",
              "3": "20%",
            }}
          />
        </div>
      )}
    </section>
  );
};

export default CancelDashboardContainer;
