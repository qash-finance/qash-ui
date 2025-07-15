import * as React from "react";
import { TableRow } from "./TableRow";

interface TableData {
  type: string;
  hasGift?: boolean;
  amount: string;
  from: string;
  dateTime: string;
  recallIn?: string;
  actionDisabled?: boolean;
}

interface DataTableProps {
  title: string;
  subtitle: string;
  showRecallColumn?: boolean;
  data: TableData[];
}

export const DataTable: React.FC<DataTableProps> = ({ title, subtitle, showRecallColumn = false, data }) => {
  return (
    <section className="mt-2.5 w-full max-md:max-w-full">
      <div className="w-full max-md:max-w-full">
        <div className="flex gap-2.5 items-start w-full max-md:max-w-full">
          <div className="flex flex-col flex-1 shrink justify-center w-full basis-0 min-w-60 max-md:max-w-full">
            <h1 className="text-white text-xl font-bold">{title}</h1>
            <p className="mt-2 text-base tracking-tight leading-none text-neutral-500 max-md:max-w-full">{subtitle}</p>
          </div>
        </div>

        <div className="overflow-hidden mt-2.5 w-full rounded-lg border border-solid border-zinc-800 max-md:max-w-full">
          <table className="w-full">
            <thead className="flex-wrap gap-0 items-start w-full max-md:max-w-full">
              <tr className="flex-wrap gap-0 items-start w-full max-md:max-w-full">
                <th className="overflow-hidden flex-col justify-center items-center px-3.5 py-3.5 border border-solid bg-neutral-900 border-zinc-800 min-h-9 w-[39px]">
                  <div className="gap-px rounded-sm bg-stone-50 bg-opacity-10 h-[11px] min-h-[11px] rotate-[3.141592653589793rad] w-[11px]" />
                </th>

                <th className="overflow-hidden flex-col justify-center px-9 py-2.5 text-sm font-medium tracking-tight leading-tight text-center whitespace-nowrap border border-solid bg-neutral-900 border-zinc-800 text-neutral-500 w-[100px] max-md:px-5">
                  <div>Type</div>
                </th>

                <th className="overflow-hidden flex-col flex-1 shrink justify-center items-center px-16 py-2.5 text-sm font-medium tracking-tight leading-tight text-center whitespace-nowrap border border-solid basis-0 bg-neutral-900 border-zinc-800 min-w-60 text-neutral-500 max-md:px-5 max-md:max-w-full">
                  <div>Amount</div>
                </th>

                <th className="overflow-hidden flex-col justify-center px-12 py-2.5 text-sm font-medium tracking-tight leading-tight text-center whitespace-nowrap border border-solid bg-neutral-900 border-zinc-800 text-neutral-500 w-[129px] max-md:px-5">
                  <div>From</div>
                </th>

                <th className="overflow-hidden flex-col justify-center px-9 py-2.5 text-sm font-medium tracking-tight leading-tight text-center whitespace-nowrap border border-solid bg-neutral-900 border-zinc-800 text-neutral-500 w-[133px] max-md:px-5">
                  <div>Date/Time</div>
                </th>

                {showRecallColumn && (
                  <th className="overflow-hidden flex-col justify-center px-11 py-2.5 text-sm font-medium tracking-tight leading-tight text-center border border-solid bg-neutral-900 border-zinc-800 text-neutral-500 w-[133px] max-md:px-5">
                    <div>Recall in</div>
                  </th>
                )}

                <th className="overflow-hidden gap-2.5 justify-center items-center py-2.5 text-sm font-medium tracking-tight leading-tight text-center whitespace-nowrap border border-solid bg-neutral-900 border-zinc-800 min-h-9 text-neutral-500 w-[126px]">
                  <div className="flex-1 shrink basis-0">Action</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => (
                <TableRow
                  key={index}
                  type={row.type}
                  hasGift={row.hasGift}
                  amount={row.amount}
                  from={row.from}
                  dateTime={row.dateTime}
                  recallIn={row.recallIn}
                  actionDisabled={row.actionDisabled}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
