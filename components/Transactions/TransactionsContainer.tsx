"use client";
import React from "react";
import { StatusBadge } from "../Common/StatusBadge";
import { ActionButton } from "../Common/ActionButton";

const mockData = [
  {
    type: "Send",
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
  {
    type: "Send",
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
  {
    type: "Send",
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "failed" as const,
  },
];

const TableRow = ({
  type,
  amount,
  message,
  requestFrom,
  confirmAt,
  status,
  isHistory = false,
}: {
  type: string;
  amount: string;
  message: string;
  requestFrom: string;
  confirmAt: string;
  status: "succeed" | "failed";
  isHistory?: boolean;
}) => {
  return (
    <tr className="bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]">
      <td className="px-4 py-3 border-r border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-white  font-medium truncate">{type}</span>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-zinc-800 min-w-[500px]">
        <div className="flex justify-center items-center gap-2">
          <img src="/token/usdt.svg" alt="Token" className="w-4 h-4 flex-shrink-0" />
          <p className="text-stone-300  truncate">{amount}</p>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-zinc-800 text-center">
        <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
          <span className="text-white  font-medium">{requestFrom}</span>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-zinc-800 text-center">
        <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
          <span className="text-white  font-medium">{requestFrom}</span>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-zinc-800 text-center">
        <span className="text-white ">{confirmAt}</span>
      </td>
      {!isHistory ? (
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <ActionButton text="Deny" type="deny" onClick={() => {}} />
            <ActionButton text="Accept" onClick={() => {}} />
          </div>
        </td>
      ) : (
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <StatusBadge status={status} text={status} />
          </div>
        </td>
      )}
    </tr>
  );
};

const TableHeader = ({ columns }: { columns: string[] }) => {
  return (
    <thead>
      <tr className="bg-[#181818]">
        {columns.map((column, index) => (
          <th
            key={column}
            className={` text-center font-medium text-neutral-400 border-r border-[#292929] ${
              index === 0 ? "rounded-tl-lg" : ""
            } ${index === columns.length - 1 ? "rounded-tr-lg border-r-0" : ""} ${index === 1 ? "min-w-[500px]" : ""}`}
          >
            {column}
          </th>
        ))}
        <th className="px-4 py-3 text-center text-sm font-medium text-neutral-400 rounded-tr-lg">Actions</th>
      </tr>
    </thead>
  );
};

export function TransactionsContainer() {
  const pendingColumns = ["Type", "Amount", "Request From", "To", "Date/Time"];

  return (
    <div className="w-full h-full bg-black rounded-xl text-white p-6 space-y-6">
      {/* Pending Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Pending to approve</h2>
          <p className="text-sm text-gray-400">
            Since you are a signer in the list of signers of the account{" "}
            <span className="font-bold text-white">Jessie02</span>, below are the transactions that need to be confirmed
            by you
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[800px]">
            <TableHeader columns={pendingColumns} />
            <tbody>
              {mockData.map((row, index) => (
                <TableRow
                  key={`pending-${index}`}
                  type={row.type}
                  amount={row.amount}
                  message={row.message}
                  requestFrom={row.requestFrom}
                  confirmAt={row.confirmAt}
                  status={row.status}
                  isHistory={false}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">History</h2>
          <p className="text-sm text-gray-400">Below are the transactions you have confirmed</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[800px]">
            <TableHeader columns={pendingColumns} />
            <tbody>
              {mockData.map((row, index) => (
                <TableRow
                  key={`history-${index}`}
                  type={row.type}
                  amount={row.amount}
                  message={row.message}
                  requestFrom={row.requestFrom}
                  confirmAt={row.confirmAt}
                  status={row.status}
                  isHistory={true}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
