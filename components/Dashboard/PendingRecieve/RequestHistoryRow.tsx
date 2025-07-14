import * as React from "react";
import { StatusBadge } from "./StatusBadge";

interface RequestHistoryRowProps {
  amount: string;
  message: string;
  requestFrom: string;
  confirmAt: string;
  status: "succeed" | "failed";
}

export const RequestHistoryRow: React.FC<RequestHistoryRowProps> = ({
  amount,
  message,
  requestFrom,
  confirmAt,
  status,
}) => {
  return (
    <tr className=" gap-0 items-start self-stretch max-md:min-w-[600px] bg-[#1E1E1E]">
      <td className="gap-2.5 items-start px-5 py-2.5 border border-solid  border-zinc-800 max-md:w-[100px] max-sm:w-20 ">
        <div className="flex gap-1 items-center self-stretch">
          <img src="/token/usdt.svg" alt="dark-close-icon" className="w-4 h-4" />
          <span className="text-base tracking-tight leading-5 text-center text-white max-sm:text-sm">{amount}</span>
        </div>
      </td>
      <td className="gap-2.5 items-start px-2 py-2.5 border border-solid border-zinc-800 max-md:min-w-[200px] max-sm:min-w-[150px]">
        <div className=" gap-1 items-center self-stretch">
          <p className="text-base tracking-tight leading-5 text-center text-stone-300 max-sm:text-sm">{message}</p>
        </div>
      </td>
      <td className=" border-zinc-800 text-center align-middle border-r border-b">
        <div className="bg-[#363636] bg-opacity-10 rounded-full w-20 mx-auto flex items-center justify-center">
          <span className="text-xs font-medium tracking-tight leading-4 text-white text-center">{requestFrom}</span>
        </div>
      </td>
      <td className="border-zinc-800  max-md:w-[110px] max-sm:w-[90px] text-center align-middle border-b">
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-sm tracking-tight leading-4 text-stone-300 max-sm:text-xs">{confirmAt}</span>
        </div>
      </td>
      <td className=" gap-2.5 items-start px-2.5 py-2 border border-solid border-zinc-800 w-[78px] max-md:w-[70px] max-sm:w-[60px]">
        <StatusBadge status={status} />
      </td>
      <td className=" justify-center items-center p-2.5 w-9 h-9 border border-solid border-zinc-800">
        <img src="/external-link-icon.svg" alt="external-link-icon" className="w-4 h-4" />
      </td>
    </tr>
  );
};
