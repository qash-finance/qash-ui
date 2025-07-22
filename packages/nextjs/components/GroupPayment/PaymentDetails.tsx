"use client";
import React, { useState } from "react";
import { PaymentContainer } from "./PaymentContainer";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import { TabContainer } from "../Common/TabContainer";
import { ActionButton } from "../Common/ActionButton";
// import { useModal } from "@/hooks/web3/";

interface PaymentDetailsProps {
  amount: string;
  perPersonAmount: string;
  groupName: string;
  memberCount: number;
  shareLink: string;
}

const groups = ["Best Friends", "Lunch order at...", "Concert GD", "Korea Travelling 2025"];

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  amount,
  perPersonAmount,
  groupName,
  memberCount,
  shareLink,
}) => {
  const [activeGroup, setActiveGroup] = React.useState("Best Friends");
  const { openModal } = useModal();
  const [selectedToken, setSelectedToken] = React.useState("USDT");

  //Temporary state
  const [generateLink, setGenerateLink] = useState(false);

  return (
    <div className="flex flex-1 gap-2.5 mt-2.5 rounded-xl size-full max-md:max-w-full">
      <div className="flex flex-col p-2 rounded-xl bg-zinc-900 min-w-60 w-[380px]">
        <div className="overflow-hidden flex-1 w-full rounded-xl bg-zinc-800">
          <div className="flex gap-5 justify-between px-3.5 py-2 w-full text-white bg-[#2D2D2D]">
            <span className="my-auto text-base leading-none text-white">Group sharing</span>
            <div className="flex gap-2 items-center text-sm font-medium leading-none">
              <div className="flex gap-5 justify-between py-0.5 pr-0.5 pl-2 rounded-[10px] bg-neutral-900">
                <input
                  type="text"
                  readOnly
                  value={amount}
                  placeholder="0.00"
                  className="bg-transparent text-white outline-none w-20"
                />
                <button className="flex flex-col justify-center py-1 px-2 rounded-[10px] bg-zinc-800 hover:bg-zinc-700 transition-colors outline-none">
                  <div
                    className="flex gap-1 items-center cursor-pointer"
                    onClick={() => {
                      openModal(MODAL_IDS.SELECT_TOKEN);
                    }}
                  >
                    <img src="/token/usdt.svg" alt="Token" className="w-5 h-5" />
                    <span className="text-white">{selectedToken}</span>
                    <img
                      src="/arrow/filled-arrow-down.svg"
                      alt="Dropdown arrow"
                      className="object-contain shrink-0 aspect-[1.75] fill-white w-[7px]"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 justify-center w-full text-center h-[300px] bg-[#292929]">
            <div className="flex gap-2.5 justify-center items-center w-full text-5xl font-medium leading-none whitespace-nowrap max-md:text-4xl">
              <span className="self-stretch my-auto text-white max-md:text-4xl">USDT</span>
              <span className="self-stretch my-auto text-white max-md:text-4xl">{amount}</span>
            </div>
            <p className="mt-2.5 text-base tracking-tight leading-none text-neutral-500">{perPersonAmount} / Person</p>
          </div>
        </div>

        <div className="flex gap-2.5 items-center py-2.5 pr-4 pl-3 mt-1 w-full text-base leading-none text-white rounded-xl bg-zinc-800">
          <img className="rounded-full" src="/group-payment/default-group-payment-avatar.svg" alt="Group icon" />
          <div className="flex flex-col flex-1 shrink justify-center items-start self-stretch my-auto text-center basis-0 min-w-60">
            <span className="text-white">{groupName}</span>
          </div>
          <span className="self-stretch my-auto text-right text-white">{memberCount}</span>
        </div>

        <div className="flex gap-2.5 items-center py-2.5 pr-4 pl-3 mt-1 w-full text-base leading-none text-white rounded-xl bg-zinc-800">
          <div className="bg-white rounded-full p-1 flex items-center justify-center w-10 h-10">
            <img
              src="/group-payment/group-payment-money-icon.gif"
              className="object-contain w-6 h-6"
              alt="Payment icon"
            />
          </div>
          <span className="flex-1 shrink self-stretch my-auto text-white basis-0">Each member pays</span>
          <span className="flex-1 shrink self-stretch my-auto text-right text-white basis-0">${perPersonAmount}</span>
        </div>

        {generateLink ? (
          <div className="pt-2 mt-1 w-full">
            <div className="flex gap-2 items-center px-2 py-2 w-full bg-blue-600 rounded-xl">
              <span className="flex-1 shrink self-stretch my-auto text-base font-medium leading-none text-white basis-4 text-ellipsis">
                {shareLink}
              </span>
              <button className="flex gap-1.5 justify-center items-center self-stretch px-2 py-1 my-auto text-sm font-semibold tracking-tight leading-tight bg-white rounded-[10px] text-zinc-800">
                <span className="self-stretch my-auto text-zinc-800">Copy link</span>
                <img
                  src="copy-icon.svg "
                  className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square"
                  alt="Copy icon"
                />
              </button>
            </div>
          </div>
        ) : (
          <ActionButton onClick={() => setGenerateLink(true)} text="Generate link" className="h-[45px] mt-2 text-md" />
        )}
      </div>

      <PaymentContainer groups={groups} />
    </div>
  );
};
