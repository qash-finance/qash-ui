"use client";
import React, { useState } from "react";
import ReceiveAddress from "./ReceiveAddress";
import { ActionButton } from "@/components/Common/ActionButton";
import { ToggleSwitch } from "@/components/Common/ToggleSwitch";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { createGiftNote } from "@/services/utils/note";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import { AccountId, Felt, FungibleAsset } from "@demox-labs/miden-sdk";
import { deployFaucet } from "@/services/utils/faucet";

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

const TableHeader = ({ columns }: { columns: string[] }) => {
  return (
    <thead>
      <tr className="bg-[#181818] ">
        <th className=" text-center text-sm font-medium text-neutral-400 rounded-tl-lg py-2">
          <input type="checkbox" className="w-4 h-4 mt-1" />
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
}: {
  amount: string;
  from: string;
  dateTime: string;
  action: string;
}) => {
  return (
    <tr className="bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]">
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <input type="checkbox" className="w-4 h-4" />
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 min-w-[300px]">
        <div className="flex justify-center items-center gap-2">
          <img src="/token/usdt.svg" alt="Token" className="w-4 h-4 flex-shrink-0" />
          <p className="text-stone-300  truncate">{amount}</p>
        </div>
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
          <span className="text-white  font-medium">{from}</span>
        </div>
      </td>
      <td className="px-2 py-2 border-r border-zinc-800 text-center">
        <span className="text-white  font-medium">{dateTime}</span>
      </td>
      <td className="px-2 py-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <ActionButton text="Claim" onClick={() => {}} />
        </div>
      </td>
    </tr>
  );
};

export const PendingRecieveContainer: React.FC = () => {
  const [autoClaim, setAutoClaim] = useState(false);
  const { openModal } = useModal();

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
          <table className="w-full min-w-[800px]">
            <TableHeader columns={HeaderColumns} />
            <tbody>
              {mockData.map((row, index) => (
                <TableRow
                  key={`pending-${index}`}
                  amount={row.amount}
                  from={row.from}
                  dateTime={row.dateTime}
                  action={row.action}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end mt-2 gap-2">
          <ActionButton text="Cancel" type="neutral" onClick={() => {}} />
          <ActionButton text="Claim all" onClick={() => {}} />
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
            <TableHeader columns={HeaderColumns} />
            <tbody>
              {mockData.map((row, index) => (
                <TableRow
                  key={`pending-${index}`}
                  amount={row.amount}
                  from={row.from}
                  dateTime={row.dateTime}
                  action={row.action}
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
