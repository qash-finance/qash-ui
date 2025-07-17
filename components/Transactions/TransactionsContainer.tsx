"use client";
import React from "react";
import { StatusBadge } from "../Common/StatusBadge";
import { ActionButton } from "../Common/ActionButton";
import { Table } from "../Common/Table";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

const mockData = [
  {
    type: "Send",
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    to: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
  {
    type: "Send",
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    to: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
  {
    type: "Send",
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    to: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "failed" as const,
  },
];

export function TransactionsContainer() {
  const headers = ["Type", "Amount", "Request From", "To", "Date/Time"];

  // Transform data to include React components for complex cells
  const tableData = mockData.map(item => ({
    Type: (
      <div className="flex items-center gap-2">
        <span className="text-white font-medium truncate">{item.type}</span>
      </div>
    ),
    Amount: (
      <div className="flex justify-center items-center gap-2">
        <img src="/token/usdt.svg" alt="Token" className="w-4 h-4 flex-shrink-0" />
        <p className="text-stone-300 truncate">{item.amount}</p>
      </div>
    ),
    "Request From": (
      <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
        <span className="text-white font-medium">{item.requestFrom}</span>
      </div>
    ),
    To: (
      <div className="inline-flex items-center justify-center bg-[#363636] rounded-full px-3 py-1">
        <span className="text-white font-medium">{item.to}</span>
      </div>
    ),
    "Date/Time": item.confirmAt,
    status: item.status, // Keep for action renderer
  }));

  const pendingActionRenderer = () => {
    const { openModal } = useModal();

    return (
      <div className="flex items-center justify-center gap-2">
        <ActionButton text="Deny" type="deny" onClick={() => {}} />
        <ActionButton
          text="Accept"
          onClick={() => {
            openModal(MODAL_IDS.TRANSACTION_DETAIL);
          }}
        />
      </div>
    );
  };

  const historyActionRenderer = (rowData: any) => (
    <div className="flex items-center justify-center gap-2">
      <StatusBadge status={rowData.status} text={rowData.status} />
    </div>
  );

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

        <Table headers={headers} data={tableData} actionColumn={true} actionRenderer={pendingActionRenderer} />
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">History</h2>
          <p className="text-sm text-gray-400">Below are the transactions you have confirmed</p>
        </div>

        <Table headers={headers} data={tableData} actionColumn={true} actionRenderer={historyActionRenderer} />
      </div>
    </div>
  );
}
