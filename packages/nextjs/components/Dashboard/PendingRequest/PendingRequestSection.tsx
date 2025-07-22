import React from "react";
import { CellContent, Table } from "@/components/Common/Table";
import { StatusBadge } from "@/components/Common/StatusBadge";
import { ActionButton } from "@/components/Common/ActionButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

const mockData = [
  {
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    dateTime: "25/11/2024, 07:15",
    status: "awaiting" as const,
  },
  {
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    dateTime: "25/11/2024, 07:15",
    status: "awaiting" as const,
  },
  {
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    dateTime: "25/11/2024, 07:15",
    status: "pending" as const,
  },
];

const data = mockData.map(row => ({
  Amount: (
    <div className="flex gap-1 items-center">
      <img src="/token/usdt.svg" alt="usdt" className="w-4 h-4" />
      <span className="text-base tracking-tight leading-5 text-center text-white max-sm:text-sm">{row.amount}</span>
    </div>
  ),
  Message: (
    <p className="text-base tracking-tight leading-5 text-center text-stone-300 max-sm:text-sm">{row.message}</p>
  ),
  "Request From": (
    <div className="bg-[#363636] bg-opacity-10 rounded-full w-20 mx-auto flex items-center justify-center">
      <span className="text-xs font-medium tracking-tight leading-4 text-white text-center">{row.requestFrom}</span>
    </div>
  ),
  "Date/Time": <span className="text-sm tracking-tight leading-4 text-stone-300 max-sm:text-xs">{row.dateTime}</span>,
  status: row.status,
}));

const headers = ["Amount", "Message", "Request From", "Date/Time"];

const actionRenderer = (rowData: Record<string, CellContent>, index: number) => {
  const { openModal } = useModal();

  return (
    <div className="flex gap-1 items-center justify-center">
      {rowData["status"] === "awaiting" ? (
        <>
          <ActionButton text="Deny" type="deny" className="flex-1" />
          <ActionButton text="Accept" className="flex-1" onClick={() => openModal(MODAL_IDS.SEND)} />
        </>
      ) : (
        <ActionButton text="..." className="flex-1" />
      )}
    </div>
  );
};

export const PendingRequestSection: React.FC = () => {
  return (
    <React.Fragment>
      <header className="flex flex-col gap-2 justify-center items-start w-full">
        <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
          Pending payment request
        </h2>
        <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
          Once you accept, you're committing to send the amount to the request address
        </p>
      </header>
      <Table headers={headers} data={data} actionColumn={true} actionRenderer={actionRenderer} />
    </React.Fragment>
  );
};
