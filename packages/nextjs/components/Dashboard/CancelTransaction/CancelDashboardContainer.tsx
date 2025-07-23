"use client";
import * as React from "react";
import { StatusCard } from "./StatusCard";
import { Table } from "../../Common/Table";
import { ActionButton } from "../../Common/ActionButton";

const TableSection = ({
  title,
  subtitle,
  headers,
  data,
  actionRenderer,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  data: any[];
  actionRenderer: (rowData: any, index: number) => React.ReactNode;
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
          columnWidths={{
            1: "600px",
          }}
        />
      </div>
    </div>
  </section>
);

const pendingRecallData = [
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-red-600 rounded-full">
          <span className="text-white">Gift</span>
        </div>
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">120,000</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    actionDisabled: false,
  },
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">1.02</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    actionDisabled: false,
  },
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">260.01</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    actionDisabled: false,
  },
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">100.05</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    actionDisabled: false,
  },
];

const waitingRecallData = [
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">120,000</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    "Recall in": <span className="text-stone-300 text-sm">01H:19M:16S</span>,
    actionDisabled: true,
  },
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">1.02</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    "Recall in": <span className="text-stone-300 text-sm">02H:59M:45S</span>,
    actionDisabled: true,
  },
  {
    Type: (
      <div className="flex gap-1.5 justify-center">
        <div className="overflow-hidden gap-0.5 justify-center items-center px-4 py-1 bg-[#363636] bg-opacity-10 rounded-full">
          <span className="text-white">P2ID-R</span>
        </div>
      </div>
    ),
    Amount: (
      <div className="flex flex-row flex-wrap gap-1 justify-center items-center">
        <img src="/token/usdt.svg" alt="USDT" />
        <span className="text-white">260.01</span>
      </div>
    ),
    From: (
      <div className="items-center py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center">
        <span className="text-white">0xd...s78</span>
      </div>
    ),
    "Date/Time": <span className="text-stone-300 text-sm">25/11/2024, 07:15</span>,
    "Recall in": <span className="text-stone-300 text-sm">03H:01M:07S</span>,
    actionDisabled: true,
  },
];

export const CancelDashboardContainer: React.FC = () => {
  const pendingHeaders = ["Type", "Amount", "From", "Date/Time"];
  const waitingHeaders = ["Type", "Amount", "From", "Date/Time", "Recall in"];

  const renderCancelAction = (rowData: any, index: number) => (
    <div className="flex justify-center items-center">
      <ActionButton text="Cancel" disabled={rowData.actionDisabled} />
    </div>
  );

  return (
    <section className="rounded-2xl bg-neutral-900 w-full h-full px-[16px] py-[20px]">
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
                  {/* {nextRecallTime
                    ? (() => {
                        const date = new Date(nextRecallTime);
                        const now = new Date();
                        let diff = Math.max(0, date.getTime() - now.getTime());
                        const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
                        diff %= 3600000;
                        const minutes = String(Math.floor(diff / 60000)).padStart(2, "0");
                        diff %= 60000;
                        const seconds = String(Math.floor(diff / 1000)).padStart(2, "0");
                        return `${hours}H:${minutes}M:${seconds}S`;
                      })()
                    : "00H:00M:00S"} */}
                </div>
              </div>
            </div>
          </article>

          <StatusCard title="Waiting for cancel payment" value="07" hasBackground={true} />

          <StatusCard title="Cancelled" value="15" hasBackground={true} />
        </div>

        <TableSection
          title="Pending to Cancel"
          subtitle="..."
          headers={pendingHeaders}
          data={pendingRecallData}
          actionRenderer={renderCancelAction}
        />

        <TableSection
          title="Waiting for Cancel"
          subtitle="..."
          headers={waitingHeaders}
          data={waitingRecallData}
          actionRenderer={renderCancelAction}
        />
      </div>
    </section>
  );
};

export default CancelDashboardContainer;
