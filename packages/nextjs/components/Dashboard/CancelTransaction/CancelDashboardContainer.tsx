"use client";
import * as React from "react";
import { StatusCard } from "./StatusCard";
import { Table } from "../../Common/Table";
import { ActionButton } from "../../Common/ActionButton";
import { useGetRecallable } from "@/services/api/transaction";

const TableSection = ({
  title,
  subtitle,
  headers,
  data,
  actionRenderer,
  checkedRows,
  onCheckAll,
  onCheckRow,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  data: any[];
  actionRenderer: (rowData: any, index: number) => React.ReactNode;
  checkedRows: number[];
  onCheckAll: () => void;
  onCheckRow: (index: number) => void;
}) => {
  const isAllChecked = data.length > 0 && checkedRows.length === data.length;

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
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#181818]">
                  <th className="text-center text-sm font-medium text-neutral-400 rounded-tl-lg py-2">
                    <input type="checkbox" className="w-4 h-4 mt-1" checked={isAllChecked} onChange={onCheckAll} />
                  </th>
                  {headers.map((column, index) => (
                    <th
                      key={column}
                      className={`text-center font-medium text-neutral-400 border-r border-[#292929] py-2 ${
                        index === 0 ? "rounded-tl-lg" : ""
                      } ${index === headers.length - 1 ? "rounded-tr-lg border-r-0" : ""}`}
                    >
                      {column}
                    </th>
                  ))}
                  <th className="text-center font-medium text-neutral-400 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="bg-[#1E1E1E] border-b border-zinc-800 last:border-b-0 hover:bg-[#292929]">
                    <td className="px-2 py-2 border-r border-zinc-800 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={checkedRows.includes(index)}
                        onChange={() => onCheckRow(index)}
                      />
                    </td>
                    {headers.map((header, headerIndex) => (
                      <td key={header} className="px-2 py-2 border-r border-zinc-800 text-center">
                        {row[header]}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">{actionRenderer(row, index)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

const pendingRecallData = [
  {
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
  const { data: recallable } = useGetRecallable();
  const { nextRecallTime } = recallable || {};
  const pendingHeaders = ["Amount", "From", "Date/Time"];
  const waitingHeaders = ["Amount", "From", "Date/Time", "Recall in"];

  // Add checkbox state
  const [pendingCheckedRows, setPendingCheckedRows] = React.useState<number[]>([]);
  const [waitingCheckedRows, setWaitingCheckedRows] = React.useState<number[]>([]);

  const renderCancelAction = (rowData: any, index: number) => (
    <div className="flex justify-center items-center">
      <ActionButton text="Cancel" disabled={rowData.actionDisabled} />
    </div>
  );

  // Checkbox handlers for pending section
  const handlePendingCheckAll = () => {
    if (pendingCheckedRows.length === pendingRecallData.length) {
      setPendingCheckedRows([]);
    } else {
      setPendingCheckedRows(pendingRecallData.map((_, idx) => idx));
    }
  };

  const handlePendingCheckRow = (index: number) => {
    setPendingCheckedRows(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
  };

  // Checkbox handlers for waiting section
  const handleWaitingCheckAll = () => {
    if (waitingCheckedRows.length === waitingRecallData.length) {
      setWaitingCheckedRows([]);
    } else {
      setWaitingCheckedRows(waitingRecallData.map((_, idx) => idx));
    }
  };

  const handleWaitingCheckRow = (index: number) => {
    setWaitingCheckedRows(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
  };

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
                  {nextRecallTime
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
                    : "00H:00M:00S"}
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
          checkedRows={pendingCheckedRows}
          onCheckAll={handlePendingCheckAll}
          onCheckRow={handlePendingCheckRow}
        />

        <TableSection
          title="Waiting for Cancel"
          subtitle="..."
          headers={waitingHeaders}
          data={waitingRecallData}
          actionRenderer={renderCancelAction}
          checkedRows={waitingCheckedRows}
          onCheckAll={handleWaitingCheckAll}
          onCheckRow={handleWaitingCheckRow}
        />
      </div>
    </section>
  );
};

export default CancelDashboardContainer;
