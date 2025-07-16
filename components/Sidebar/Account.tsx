"use client";
import { formatAddress } from "@/services/utils/address";
import { useWallet } from "@demox-labs/miden-wallet-adapter-react";
import * as React from "react";

interface AccountProps {}

export const Account: React.FC<AccountProps> = () => {
  const { disconnect, publicKey } = useWallet();

  return (
    <article className="overflow-hidden w-full font-medium bg-white rounded-xl h-[130px] ">
      {/* Account Info */}
      <section className="flex flex-col justify-center px-3 w-full text-blue-600 whitespace-nowrap h-4/6">
        <header className="flex items-center w-full text-sm font-medium tracking-tight">
          <div className="flex flex-1 gap-1 items-center self-stretch my-auto basis-0">
            <img
              src="/miden-logo.svg"
              className="object-contain shrink-0 self-stretch my-auto w-7 aspect-square"
              alt="miden logo icon"
            />
            <span className="self-stretch my-auto text-blue-600">{formatAddress(publicKey?.toString() || "0x")}</span>
            <img
              src="/copy-icon.svg"
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
              alt="Copy icon"
            />
          </div>
          <img
            onClick={() => disconnect()}
            src="/power-button.svg"
            className="object-contain shrink-0 self-stretch my-auto w-5 aspect-square"
            alt="power button icon"
          />
        </header>
        <div className="flex relative gap-1 items-center pl-8 w-full leading-tight">
          <div className="flex overflow-hidden z-0 flex-1 shrink gap-0.5 justify-center items-center self-stretch px-1.5 py-1 my-auto bg-blue-100 rounded-md basis-0">
            <span className="flex-1 shrink self-stretch my-auto text-base font-semibold tracking-tight text-blue-600 basis-0">
              Jessie02
            </span>
            <span className="self-stretch my-auto text-sm font-medium tracking-tight text-blue-600">0xd...s78</span>
            <img
              src="/copy-icon.svg"
              className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square"
              alt="copy icon"
            />
          </div>
          <img
            src="/arrow/filled-arrow-right.svg"
            className="object-contain z-0 shrink-0 self-stretch my-auto w-4 aspect-square"
            alt="filled arrow right icon"
          />
          <img
            src="/connect-wallet-icon.svg"
            className="object-contain absolute z-0 shrink-0 self-start aspect-square h-[19px] left-[11px] stroke-[1px] stroke-blue-600 w-[19px]"
            alt="Status indicator"
          />
        </div>
      </section>

      {/* Current Plan */}
      <section className="flex gap-1.5 items-center px-3 py-2.5 w-full bg-blue-700 h-2/6">
        <img
          src="/current-plan-icon.svg"
          className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          alt="Plan icon"
        />
        <h2 className="flex-1 shrink self-stretch my-auto text-base font-medium text-white basis-4">Current Plan</h2>
        <div className="flex gap-2.5 justify-center items-center self-stretch px-2 py-1 my-auto text-xs font-semibold tracking-tight leading-tight whitespace-nowrap bg-white rounded-lg text-neutral-950">
          <span className="self-stretch my-auto text-neutral-950">Free</span>
        </div>
      </section>
    </article>
  );
};

export default Account;
