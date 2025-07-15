"use client";
import * as React from "react";
import { AccountItem } from "./AccountItem";

export function AccountSidebar() {
  const accounts = [
    {
      id: "jessie02",
      name: "Jessie02",
      signers: "12 Signers",
      threshold: "Theshold: 5/12",
      isSelected: true,
    },
    {
      id: "jessie01",
      name: "Jessie01",
      signers: "12 Signers",
      threshold: "Theshold: 5/12",
      isSelected: false,
    },
    {
      id: "jessie",
      name: "Jessie",
      signers: "12 Signers",
      threshold: "Theshold: 5/12",
      isSelected: false,
    },
  ];

  return (
    <aside className="relative self-stretch rounded-xl bg-stone-900 w-[321px] max-md:static max-md:w-full max-md:h-auto">
      <header className="flex justify-between items-center py-2 pr-2 pl-3 border-b border-solid bg-zinc-800 border-b-neutral-900 h-[53px] w-[321px] max-md:w-full rounded-t-xl">
        <div className="flex gap-1.5 items-center">
          <div className="flex justify-center items-center p-0.5 w-5 h-5 rounded-md bg-neutral-900">
            <img src="/sidebar/account-management.gif" className="shrink-0 w-4 h-4 aspect-[1/1] grayscale opacity-60" />
          </div>
          <h2 className="text-base font-medium tracking-tight leading-4 text-white">My accounts</h2>
        </div>
        <button
          className={`font-barlow font-medium text-sm transition-colors cursor-pointer bg-white text-blue-600 h-8`}
          style={{
            padding: "6px 10px 8px 10px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "500",
            letterSpacing: "-0.084px",
            lineHeight: "100%",
            boxShadow:
              "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
          }}
          onClick={() => {}}
        >
          New account
        </button>
      </header>

      <div className="flex absolute left-2 flex-col gap-1.5 items-start h-[169px] top-[61px] w-[305px] max-md:static max-md:w-full max-md:h-auto">
        {accounts.map(account => (
          <AccountItem key={account.id} {...account} />
        ))}
      </div>

      <footer className="flex absolute bottom-0 left-0 gap-1.5 items-center px-3 pt-2 pb-3 h-14 border-t border-solid bg-stone-900 border-t-zinc-800 w-[321px] max-md:static max-md:w-full rounded-b-xl">
        <button className="flex gap-1.5 justify-center items-center px-4 py-1.5 rounded-xl bg-neutral-700 flex-[1_0_0]">
          <span className="text-base font-medium leading-6 text-zinc-100">Export account</span>
        </button>
        <button className="flex gap-1.5 justify-center items-center px-4 py-1.5 rounded-xl bg-neutral-700 flex-[1_0_0]">
          <span className="text-base font-medium leading-6 text-zinc-100">Import account</span>
        </button>
      </footer>
    </aside>
  );
}
