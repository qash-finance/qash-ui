"use client";
import * as React from "react";
import { RequestLinkSection } from "./RequestLinkSection";
import { PendingRequestSection } from "./PendingRequestSection";
import { Table } from "../../Common/Table";
import { StatusBadge } from "../../Common/StatusBadge";

const EmptyRequest = () => {
  return (
    <div className="flex flex-col gap-1 justify-center items-center self-stretch rounded-xl bg-zinc-800 h-[100px] max-sm:h-20">
      <img src="/no-request-icon.svg" alt="No request" className="shrink-0 w-6 h-6 opacity-50" />
      <p className="text-sm tracking-tight leading-4 text-neutral-500">No request</p>
    </div>
  );
};

const mockData = [
  {
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
  {
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
  {
    amount: "120,000",
    message: "Hello, remember me? I lend you 12,000 few months ago. Can you send me back?",
    requestFrom: "0xd...s78",
    confirmAt: "25/11/2024, 07:15",
    status: "succeed" as const,
  },
];

const headers = ["Amount", "Message", "Request from", "Confirm at", "Status"];
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
  "Request from": (
    <div className="bg-[#363636] bg-opacity-10 rounded-full w-20 mx-auto flex items-center justify-center">
      <span className="text-xs font-medium tracking-tight leading-4 text-white text-center">{row.requestFrom}</span>
    </div>
  ),
  "Confirm at": <span className="text-sm tracking-tight leading-4 text-stone-300 max-sm:text-xs">{row.confirmAt}</span>,
  Status: <StatusBadge status={row.status} text={row.status} />,
}));

const actionRenderer = () => <img src="/external-link-icon.svg" alt="external-link-icon" className="w-4 h-4" />;

export const DashboardContainer: React.FC = () => {
  return (
    <main className="flex flex-col gap-4 rounded-2xl bg-neutral-900 w-full h-full px-4 py-5">
      <RequestLinkSection />
      <PendingRequestSection />

      {/* Request history */}
      <section className="flex flex-col gap-2.5 items-start self-stretch">
        <header className="flex flex-col gap-2 justify-center items-start">
          <h2 className="text-lg font-medium leading-5 text-center text-white max-sm:text-base">
            Accepted request history
          </h2>
          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
            This is a list of requests you have accepted.
          </p>
        </header>
      </section>

      {/* Request history table */}
      <Table headers={headers} data={data} actionColumn={true} actionRenderer={actionRenderer} />
    </main>
  );
};

export default DashboardContainer;
