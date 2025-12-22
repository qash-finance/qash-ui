"use client";
import React, { useCallback, useEffect, useState } from "react";
import { StatusCard } from "./StatusCard";
import { ActionButton } from "../../Common/ActionButton";
import { CustomCheckbox } from "../../Common/CustomCheckbox";
import { useRecallableNotes } from "@/hooks/server/useRecallableNotes";
import SkeletonLoading from "@/components/Common/SkeletonLoading";
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
import { Empty } from "@/components/Common/Empty";
import { useAccountContext } from "@/contexts/AccountProvider";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useGiftDashboard } from "@/hooks/server/useGiftDashboard";
import { useRecallBatch } from "@/services/api/transaction";

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
  checkedRows,
  onCheckAll,
  onCheckRow,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  data: any[];
  actionRenderer: (rowData: any, index: number) => React.ReactNode;
  columnWidths?: Record<number, string>;
  checkedRows: number[];
  onCheckAll: () => void;
  onCheckRow: (index: number) => void;
}) => {
  const isAllChecked = data.length > 0 && checkedRows.length === data.length;

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
    rowData,
    index,
    checked,
    onCheck,
  }: {
    rowData: any;
    index: number;
    checked: boolean;
    onCheck: () => void;
  }) => {
    return (
      <tr className="bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]">
        <td className="px-2 py-2 border-r border-zinc-800 text-center">
          <CustomCheckbox checked={checked} onChange={onCheck} />
        </td>
        {headers.map((header, headerIndex) => (
          <td
            key={header}
            className={`px-2 py-2 ${headerIndex === 0 ? "min-w-[300px]" : ""} ${
              headerIndex === headers.length - 1 ? "" : "border-r border-zinc-800"
            } ${headerIndex === 0 ? "text-left" : "text-center"}`}
          >
            {header === "Action" ? actionRenderer(rowData, index) : rowData[header]}
          </td>
        ))}
      </tr>
    );
  };

  return (
    <section className="mt-2.5 w-full max-md:max-w-full">
      <div className="w-full max-md:max-w-full">
        <div className="flex gap-2.5 items-start w-full max-md:max-w-full">
          <div className="flex flex-col flex-1 shrink justify-center w-full basis-0 min-w-60 max-md:max-w-full">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="mt-2 text-base tracking-tight leading-none text-neutral-500 max-md:max-w-full">{subtitle}</p>
          </div>
        </div>
        <div className="mt-2.5">
          {data.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full min-w-[800px]">
                <TableHeader columns={headers} allChecked={isAllChecked} onCheckAll={onCheckAll} />
                <tbody>
                  {data.map((rowData, index) => (
                    <TableRow
                      key={index}
                      rowData={rowData}
                      index={index}
                      checked={checkedRows.includes(index)}
                      onCheck={() => onCheckRow(index)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No payments to cancel" />
          )}
        </div>
      </div>
    </section>
  );
};

export const CancelDashboardContainer: React.FC = () => {
  // **************** Server Hooks *******************
  const {
    data: recallableNotes,
    isLoading: recallableNotesLoading,
    refetch: refetchRecallableNotes,
  } = useRecallableNotes();
  const { refetch: refetchGiftDashboard } = useGiftDashboard();

  console.log("recallableNotes", recallableNotes);

  const { mutateAsync: recallBatch } = useRecallBatch();
  const { accountId: walletAddress, forceFetch: forceRefetchAssets } = useAccountContext();
  const { isConnected } = useWalletConnect();

  // **************** Local State *******************
  const [countdown, setCountdown] = React.useState("00H:00M:00S");
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
        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
        diff %= 3600000;
        const minutes = String(Math.floor(diff / 60000)).padStart(2, "0");
        diff %= 60000;
        const seconds = String(Math.floor(diff / 1000)).padStart(2, "0");
        setCountdown(`${hours}H:${minutes}M:${seconds}S`);
      } else {
        setCountdown("00H:00M:00S");
      }
    };

    // Initial update
    updateCountdown();

    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [recallableNotes?.nextRecallTime, isConnected]);

  // **************** Local State *******************
  const readyToCancelHeaders = ["Amount", "To", "Date/Time", "Action"];
  const upcomingCancelHeaders = ["Amount", "To", "Date/Time", "Recall in", "Action"];

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

  const handleCancelAll = async () => {
    try {
      toast.loading("Cancelling transactions...");
      // Process each checked note
      // for (const idx of checkedRows) {
      //   const note = recallableNotes?.recallableItems[idx];
      //   if (!note) continue;

      //   setRecallingNoteId(note.id);

      //   // build p2ide
      //   const p2ideNote = await customCreateP2IDENote(
      //     AccountId.fromBech32(note.sender),
      //     AccountId.fromBech32(note.recipient),
      //     Number(note.assets[0].amount),
      //     AccountId.fromBech32(note.assets[0].faucetId),
      //     note.recallableHeight,
      //     note.recallableHeight,
      //     note.private ? NoteType.Private : NoteType.Public,
      //     0,
      //     note.serialNumber.map(serialNumber => new Felt(BigInt(serialNumber))),
      //   );

      //   // submit tx
      //   await submitTransactionWithOwnInputNotes(
      //     new NoteAndArgsArray([new NoteAndArgs(p2ideNote)]),
      //     AccountId.fromBech32(note.sender),
      //   );
      // }

      // get all notes
      const notes = checkedRows.map(idx => recallableNotes?.recallableItems[idx]);

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

        setCheckedRows([]);
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
      <ActionButton
        text={"Cancel"}
        disabled={recallingNoteId !== null || new Date(recallingNote.recallableTime) > new Date()}
        onClick={async () => {
          try {
            toast.loading("Cancelling transaction...");
            console.log(recallingNote);

            setRecallingNoteId(recallingNote.id);

            // build p2ide
            // const note = await customCreateP2IDENote(
            //   AccountId.fromBech32(recallingNote.sender),
            //   AccountId.fromBech32(recallingNote.recipient),
            //   Number(recallingNote.assets[0].amount),
            //   AccountId.fromBech32(recallingNote.assets[0].faucetId),
            //   recallingNote.recallableHeight,
            //   recallingNote.recallableHeight,
            //   recallingNote.private ? NoteType.Private : NoteType.Public,
            //   0,
            //   recallingNote.serialNumber.map(serialNumber => new Felt(BigInt(serialNumber))),
            // );

            // submit tx
            // const txId = await submitTransactionWithOwnInputNotes(
            //   new NoteAndArgsArray([new NoteAndArgs(note)]),
            //   AccountId.fromBech32(recallingNote.sender),
            // );

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
                Transaction sent successfully, view transaction on{" "}
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
              value={recallableNotes?.waitingToRecallItems?.length.toString() || "0"}
              hasBackground={true}
            />

            <StatusCard
              title="Cancelled"
              value={recallableNotes?.recalledCount?.toString() || "0"}
              hasBackground={true}
            />
          </div>

          <TableSection
            title="Ready to Cancel"
            subtitle="Payments that are now eligible for cancellation. You can select multiple payments to cancel them in batch."
            headers={readyToCancelHeaders}
            data={
              recallableNotes?.recallableItems?.map((note: RecallableNote, index: number) => ({
                Amount: (
                  <div className="relative flex flex-row flex-wrap gap-1 items-center">
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
                      <span className="text-white">{note.assets[0].amount}</span>
                      {/* Tooltip on hover */}
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        {note.assets[0].metadata?.symbol || "Unknown Token"}
                      </div>
                    </div>
                    {note.isGift && (
                      <span className="ml-3 bg-[#292929] flex items-center justify-between px-3 py-0.5 rounded-lg w-fit">
                        <span className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">
                          Gift
                        </span>
                      </span>
                    )}
                  </div>
                ),
                To: (
                  <div className="items-center bg-opacity-10  flex justify-center">
                    {note.isGift ? (
                      <div className="text-white">-</div>
                    ) : (
                      <span className="text-white py-1 bg-[#363636] px-5 rounded-[34px]">
                        {formatAddress(note.recipient)}
                      </span>
                    )}
                  </div>
                ),
                "Date/Time": <span className="text-stone-300 text-sm">{formatDate(note.createdAt)}</span>,
                actionDisabled: false,
                originalNote: note,
              })) || []
            }
            actionRenderer={rowData => renderCancelAction(rowData.originalNote)}
            columnWidths={{
              "0": "55%",
              "1": "20%",
              "2": "25%",
            }}
            checkedRows={checkedRows}
            onCheckAll={handleCheckAll}
            onCheckRow={handleCheckRow}
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
            headers={upcomingCancelHeaders}
            data={
              recallableNotes?.waitingToRecallItems?.map((note: any) => ({
                Amount: (
                  <div className="relative flex flex-row flex-wrap gap-1 items-center">
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
                      <span className="text-white">{note.assets[0].amount}</span>
                      {/* Tooltip on hover */}
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                        {note.assets[0].metadata?.symbol || "Unknown Token"}
                      </div>
                    </div>
                    {note.isGift && (
                      <span className="ml-3 bg-[#292929] flex items-center justify-between px-3 py-0.5 rounded-lg w-fit">
                        <span className="text-white text-[14px] font-medium tracking-[0.07px] leading-[20px]">
                          Gift
                        </span>
                      </span>
                    )}
                  </div>
                ),
                To: (
                  <div className="items-center bg-opacity-10  flex justify-center">
                    {note.isGift ? (
                      <div className="text-white">-</div>
                    ) : (
                      <span className="text-white py-1 bg-[#363636] px-5 rounded-[34px]">
                        {formatAddress(note.recipient)}
                      </span>
                    )}
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
            checkedRows={checkedWaitingRows}
            onCheckAll={handleCheckAllWaiting}
            onCheckRow={handleCheckWaitingRow}
          />
        </div>
      )}
    </section>
  );
};

export default CancelDashboardContainer;
