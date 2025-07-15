import * as React from "react";
import { ActionButton } from "../../Common/ActionButton";

interface TableRowProps {
  type: string;
  hasGift?: boolean;
  amount: string;
  from: string;
  dateTime: string;
  recallIn?: string;
  actionDisabled?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  type,
  hasGift = false,
  amount,
  from,
  dateTime,
  recallIn,
  actionDisabled = false,
}) => {
  return (
    <tr className="flex-wrap gap-0 items-start w-full max-md:max-w-full bg-[#1E1E1E]">
      <td className="overflow-hidden flex-col justify-center items-center px-3.5 py-3.5 border border-solid bg-[#1E1E1E] border-zinc-800 min-h-9 w-[39px]">
        <div className="gap-px rounded-sm bg-stone-50 bg-opacity-10 h-[11px] min-h-[11px]  w-[11px]" />
      </td>

      <td className="overflow-hidden gap-1 justify-center items-center px-5 text-xs font-medium tracking-tight leading-tight text-white whitespace-nowrap border border-solid bg-[#1E1E1E] border-zinc-800 w-[100px]">
        <div className="flex gap-1.5 justify-center">
          {hasGift && (
            <div className="overflow-hidden gap-0.5 justify-center items-center px-2 py-1.5 bg-red-600 rounded-[34px]">
              <span className="text-white">Gift</span>
            </div>
          )}
          <div className="overflow-hidden gap-0.5 justify-center items-center px-1.5 py-1.5 bg-[#363636] bg-opacity-10 rounded-[34px]">
            <span className="text-white">{type}</span>
          </div>
        </div>
      </td>

      <td className="overflow-hidden flex-col flex-1 shrink justify-center text-base tracking-tight leading-tight text-center text-white whitespace-nowrap border border-solid basis-0 bg-[#1E1E1E] border-zinc-800 min-w-60 max-md:max-w-full">
        <div className=" flex flex-row flex-wrap gap-1 ml-5 ">
          <img src="/token/usdt.svg" />
          <span className="text-white">{amount}</span>
        </div>
      </td>

      <td className=" text-xs font-medium text-white whitespace-nowrap border border-solid bg-[#1E1E1E] border-zinc-800 text-center  justify-center ">
        <div className=" items-center px-1.5 py-1 bg-[#363636] bg-opacity-10 rounded-[34px] flex justify-center w-17  m-auto ">
          <span className="text-white">{from}</span>
        </div>
      </td>

      <td className="overflow-hidden flex-col justify-center text-sm tracking-tight leading-tight text-center border border-solid bg-[#1E1E1E] border-zinc-800 text-stone-300 w-[133px]">
        <div className="text-ellipsis text-stone-300">{dateTime}</div>
      </td>

      {recallIn && (
        <td className="overflow-hidden flex-col justify-center px-7 py-2.5 text-sm tracking-tight leading-tight text-center whitespace-nowrap border border-solid bg-[#1E1E1E] border-zinc-800 text-stone-300 w-[133px] max-md:px-5">
          <div className="text-ellipsis text-stone-300">{recallIn}</div>
        </td>
      )}

      <td className="overflow-hidden gap-1.5 justify-center items-center p-2 text-sm font-medium tracking-normal leading-none text-white whitespace-nowrap border border-solid bg-[#1E1E1E] border-zinc-800 min-h-9 w-[126px]">
        <div className="flex justify-center items-center">
          <ActionButton text="Recall" disabled={actionDisabled} />
        </div>
      </td>
    </tr>
  );
};
