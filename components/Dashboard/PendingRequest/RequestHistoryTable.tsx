import * as React from "react";
import { RequestHistoryRow } from "./RequestHistoryRow";

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
    status: "failed" as const,
  },
];

export const RequestHistoryTable: React.FC = () => {
  return (
    <div className="flex flex-col gap-0 items-start self-stretch rounded-lg border border-solid border-zinc-800 max-md:overflow-x-auto max-sm:text-xs">
      <table className="w-full rounded-lg">
        <thead className="items-start self-stretch max-md:min-w-[600px]">
          <tr className="items-start self-stretch max-md:min-w-[600px] rounded-t-lg">
            <th className="  relative justify-center items-center px-2 py-2.5 h-9 border-r border-solid bg-neutral-900 border-zinc-800 w-[126px] max-md:w-[100px] max-sm:w-20 rounded-tl-lg">
              <span className="absolute top-2.5 shrink-0 w-28 text-sm font-medium tracking-tight leading-4 text-center h-[17px] left-[7px] text-neutral-500">
                Amount
              </span>
            </th>
            <th className="h-9 border-r border-solid bg-neutral-900 border-zinc-800 max-md:min-w-[200px] max-sm:min-w-[150px] text-center align-middle">
              <span className="text-sm font-medium tracking-tight leading-4 text-neutral-500">Message</span>
            </th>
            <th className="relative justify-center items-center py-2.5 pr-2 pl-2 h-9 border-r border-solid bg-neutral-900 border-zinc-800 w-[129px] max-md:w-[100px] max-sm:w-20">
              <span className="absolute left-2 top-2.5 shrink-0 text-sm font-medium tracking-tight leading-4 text-center h-[17px] text-neutral-500 w-[113px]">
                Request from
              </span>
            </th>
            <th className="relative justify-center items-center py-2.5 pr-2.5 pl-2.5 h-9 border-r border-solid bg-neutral-900 border-zinc-800 w-[133px] max-md:w-[110px] max-sm:w-[90px]">
              <span className="absolute top-2.5 left-2.5 shrink-0 text-sm font-medium tracking-tight leading-4 text-center h-[17px] text-neutral-500 w-[113px]">
                Confirm at
              </span>
            </th>
            <th className="relative justify-center items-center px-0 py-2.5 h-9 border-r border-solid bg-neutral-900 border-zinc-800 w-[78px] max-md:w-[70px] max-sm:w-[60px]">
              <span className="absolute top-2.5 shrink-0 text-sm font-medium tracking-tight leading-4 text-center h-[17px] left-[-18px] text-neutral-500 w-[113px]">
                Status
              </span>
            </th>
            <th className="w-9 h-9 bg-neutral-900 border-zinc-800 rounded-tr-lg" />
          </tr>
        </thead>
        <tbody>
          {mockData.map((row, index) => (
            <RequestHistoryRow
              key={index}
              amount={row.amount}
              message={row.message}
              requestFrom={row.requestFrom}
              confirmAt={row.confirmAt}
              status={row.status}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
