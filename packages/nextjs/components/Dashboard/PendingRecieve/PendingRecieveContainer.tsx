"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import ReceiveAddress from "./ReceiveAddress";
import { ActionButton } from "@/components/Common/ActionButton";
import { ToggleSwitch } from "@/components/Common/ToggleSwitch";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { useConsumeTransactions, useGetConsumable } from "@/services/api/transaction";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { toast } from "react-hot-toast";
import { Empty } from "@/components/Common/Empty";
import { getConsumableNotes } from "@/services/utils/note";
import { AccountId, ConsumableNoteRecord, NoteType as MidenNoteType } from "@demox-labs/miden-sdk";
import { ConsumableNote, NoteType } from "@/types/transaction";
import { useDeployedAccount } from "@/hooks/web3/useDeployedAccount";

const mockData = [
  {
    amount: "120,000",
    from: "0xd...s78",
    dateTime: "25/11/2024, 07:15",
    action: "Claim",
  },
  {
    amount: "120,000",
    from: "0xd...s78",
    dateTime: "25/11/2024, 07:15",
    action: "Claim",
  },
  {
    amount: "120,000",
    from: "0xd...s78",
    dateTime: "25/11/2024, 07:15",
    action: "Claim",
  },
];

const HeaderColumns = ["Amount", "From", "Date/Time", "Action"];

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
          <input type="checkbox" className="w-4 h-4 mt-1" checked={allChecked} onChange={onCheckAll} />
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
  amount,
  from,
  dateTime,
  action,
  checked,
  onCheck,
  onClaim,
  disabled,
}: {
  amount: string;
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
        <input type="checkbox" className="w-4 h-4" checked={checked} onChange={onCheck} />
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 min-w-[300px]">
        <div className="flex justify-center items-center gap-2">
          <img src="/token/usdt.svg" alt="Token" className="w-4 h-4 flex-shrink-0" />
          <p className="text-stone-300  truncate">{amount}</p>
        </div>
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
          <span className="text-white font-medium">
            {from.slice(0, 6)}...{from.slice(-4)}
          </span>
        </div>
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <span className="text-white  font-medium">
          {new Date(dateTime).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </td>
      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <ActionButton text="Claim" onClick={onClaim} disabled={disabled} />
        </div>
      </td>
    </tr>
  );
};

export const PendingRecieveContainer: React.FC = () => {
  const { publicKey } = useWallet();
  const [autoClaim, setAutoClaim] = useState(false);
  const { openModal } = useModal();
  const [consumableNotes, setConsumableNotes] = useState<ConsumableNote[]>([]);
  const { getConsumableNotes, consumeAllNotes, isReady } = useDeployedAccount();
  const { data: consumable } = useGetConsumable(publicKey || "");
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const [claiming, setClaiming] = useState(false);
  // const { mutate: consumeTransactions } = useConsumeTransactions(publicKey || "");

  useEffect(() => {
    (async () => {
      if (isReady && publicKey) {
        //@ts-ignore
        const notes: ConsumableNoteRecord[] = await getConsumableNotes();

        //@ts-ignore
        const consumableNotes: ConsumableNote[] = notes.map(note => {
          const id = note.inputNoteRecord().id().toString();
          const inputNoteRecord = note.inputNoteRecord();
          const metadata = inputNoteRecord.metadata();
          const details = inputNoteRecord.details();
          const assets = details
            .assets()
            .fungibleAssets()
            .map(asset => ({
              faucetId: asset.faucetId().toString(),
              amount: asset.amount().toString(),
            }));
          const sender = metadata?.sender().toString();
          const isPrivate = metadata?.noteType() === MidenNoteType.Private;

          //no updatedAt because it's not included in the note
          //no recallableTime because it's not included in the note
          //no serialNumber because it's not included in the note
          //no decimal because it's not included in the note

          return {
            id: id,
            sender: sender!,
            recipient: publicKey,
            assets: assets,
            private: isPrivate,
            recallable: false,
            recallableTime: null,
            serialNumber: [],
            noteType: NoteType.P2IDR,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        setConsumableNotes(consumableNotes);
      }
    })();
  }, [publicKey, isReady]);

  // const isAllChecked = consumable && consumable.length > 0 && checkedRows.length === consumable.length;
  // const handleCheckAll = useCallback(() => {
  //   if (isAllChecked) setCheckedRows([]);
  //   else setCheckedRows(consumable?.map((_, idx) => idx) || []);
  // }, [isAllChecked, consumable]);
  const isAllChecked = consumableNotes.length > 0 && checkedRows.length === consumableNotes.length;
  const handleCheckAll = useCallback(() => {
    if (isAllChecked) setCheckedRows([]);
    else setCheckedRows(consumableNotes.map((_, idx) => idx));
  }, [isAllChecked, consumableNotes]);

  const handleCheckRow = useCallback((idx: number) => {
    setCheckedRows(prev => (prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]));
  }, []);

  const handleClaim = (index: number) => {
    let indicesToClaim: number[] = [];
    if (index === -1) {
      // Claim all
      indicesToClaim = consumableNotes.map((_, idx) => idx);
    } else if (checkedRows.length > 0) {
      indicesToClaim = checkedRows;
    } else {
      indicesToClaim = [index];
    }

    //@ts-ignore
    const noteIds = consumableNotes?.filter((_, idx) => indicesToClaim.includes(idx)).map(note => note.id) as string[];

    setClaiming(true);
    consumeAllNotes(noteIds)
      .then(() => {
        toast.success("Transactions consumed successfully");
        //remove the consumed notes from the list
        //@ts-ignore
        setConsumableNotes(prev => prev.filter(note => !noteIds.includes(note.id)));
        setClaiming(false);
      })
      .catch((error: any) => {
        console.log("🚀 ~ onError ~ error:", error);
        toast.error("Failed to consume transactions");
        setClaiming(false);
      });

    // const rowsToClaim = consumable?.filter((_, idx) => indicesToClaim.includes(idx));

    // const notes = rowsToClaim?.map(row => {
    //   const sender = AccountId.fromHex(row.sender);
    //   const faucet = AccountId.fromHex(row.assets[0].faucetId);
    //   const target = AccountId.fromHex(row.recipient);
    //   const isPrivate = row.private;

    //   const noteMetadata = new NoteMetadata(
    //     sender,
    //     isPrivate ? NoteType.Private : NoteType.Public,
    //     NoteTag.fromAccountId(target, NoteExecutionMode.newLocal()),
    //     NoteExecutionHint.always(),
    //   );

    //   const noteAsset = new NoteAssets(
    //     row.assets.map(asset => new FungibleAsset(AccountId.fromHex(asset.faucetId), BigInt(asset.amount))),
    //   );

    //   const noteRecipient = new NoteRecipient(
    //     Word.newFromFelts(row.serialNumber.map(num => new Felt(BigInt(num)))),
    //     NoteScript.p2id(),
    //     new NoteInputs(new FeltArray([target.suffix(), target.prefix()])),
    //   );

    //   return new Note(noteAsset, noteMetadata, noteRecipient);
    // });

    // const noteIds = notes?.map(note => note.id().toString());

    // const noteIds = rowsToClaim?.map(row => row.id.toString());

    if (!noteIds || noteIds.length === 0) {
      return;
    }

    // consumeTransactions(noteIds, {
    //   onSuccess: () => {
    //     toast.success("Transactions consumed successfully");
    //   },
    //   onError: (error: any) => {
    //     console.log("🚀 ~ onError ~ error:", error);
    //     toast.error("Failed to consume transactions");
    //   },
    // });
  };

  return (
    <div className="flex w-full h-full bg-black rounded-xl text-white p-6 space-y-6 gap-4">
      <div className="flex-3">
        {/* Pending Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold ">Pending to receive</h2>
            <p className="text-sm text-gray-400 mb-2">
              Once you accept, you're committing to send the amount to the request address
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1">
            <span className="text-lg text-black">Auto Claim</span>
            <ToggleSwitch enabled={autoClaim} onChange={() => setAutoClaim(!autoClaim)} />
          </div>
        </div>

        {/* Pending Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          {consumableNotes?.length === 0 || !consumableNotes ? (
            <Empty title="No pending receive" />
          ) : (
            <table className="w-full min-w-[800px]">
              <TableHeader columns={HeaderColumns} allChecked={isAllChecked || false} onCheckAll={handleCheckAll} />
              <tbody>
                {consumableNotes?.map((row, index) => (
                  <TableRow
                    key={`pending-${index}`}
                    amount={row.assets[0].amount}
                    from={row.sender}
                    dateTime={row.createdAt}
                    action={row.status}
                    checked={checkedRows.includes(index)}
                    onCheck={() => handleCheckRow(index)}
                    onClaim={() => handleClaim(index)}
                    disabled={claiming}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-end mt-2 gap-2">
          <ActionButton text="Cancel" type="neutral" onClick={() => setCheckedRows([])} />
          <ActionButton text="Claim all" onClick={() => handleClaim(-1)} disabled={claiming} />
        </div>

        {/* Unverified Section */}
        <div>
          <h2 className="text-xl font-semibold">Unverified request</h2>
          <p className="text-sm text-gray-400  mb-2">
            Once you accept, you're committing to send the amount to the request address
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[800px]">
            <TableHeader columns={HeaderColumns} allChecked={false} onCheckAll={() => {}} />
            <tbody>
              {mockData.map((row, index) => (
                <TableRow
                  key={`pending-${index}`}
                  amount={row.amount}
                  from={row.from}
                  dateTime={row.dateTime}
                  action={row.action}
                  checked={false}
                  onCheck={() => {}}
                  onClaim={() => {}}
                  disabled={claiming}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex-1">
        <ReceiveAddress
          onEnterAmount={() => {
            openModal(MODAL_IDS.CREATE_CUSTOM_QR);
          }}
          onSaveQR={() => {}}
          onCopyAddress={() => {}}
        />
      </div>
    </div>
  );
};
