import React from "react";
import { ActionButton } from "../Common/ActionButton";

export const AddressCard = () => {
  return (
    <div className="flex flex-col gap-2 w-[250px] bg-[#292929] rounded-xl p-2">
      <div className="flex flex-row gap-2 items-center">
        <img src="/default-avatar-icon.png" alt="folder" className="w-12 h-12 rounded-xl" />
        <div className="flex flex-col gap-1">
          <span className="text-base leading-5 text-white">Jimmy Cullen</span>
          <span className="text-sm leading-4 text-[#BDBDBD]">0x1234567890</span>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <ActionButton text="Send" className="w-full" />
        <img src="/token/usdt.svg" alt="token" className="w-8 h-8" />
      </div>
    </div>
  );
};
