"use client";
import * as React from "react";

export function SignersTable() {
  const signers = [
    { id: 1, name: "Elon Musk", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
    { id: 2, name: "Alexander", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
    { id: 3, name: "John Smith", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
    { id: 4, name: "Maxie", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
    { id: 6, name: "Katherine", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
    { id: 7, name: "Name", address: "Address" },
  ];

  return (
    <div className="flex flex-col gap-0 items-start self-stretch rounded-lg border border-solid border-zinc-800 max-sm:overflow-x-auto">
      <header className="flex gap-0 items-start self-stretch max-sm:min-w-[600px]">
        <div className="flex justify-center items-center py-2.5 pr-3 pl-3 w-14 h-9 border border-solid bg-neutral-900 border-zinc-800">
          <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500">No</span>
        </div>
        <div className="flex justify-center items-center py-2.5 pr-3 pl-3 h-9 border border-solid bg-neutral-900 border-zinc-800 w-[129px]">
          <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500">Signer name</span>
        </div>
        <div className="flex justify-center items-center py-2.5 pr-3 pl-3 h-9 border border-solid bg-neutral-900 border-zinc-800 flex-[1_0_0]">
          <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500">Address</span>
        </div>
        <div className="flex justify-center items-center py-2.5 pr-3 pl-3 h-9 border border-solid bg-neutral-900 border-zinc-800 w-[126px]">
          <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500">Action</span>
        </div>
      </header>

      {signers.map(signer => (
        <div key={signer.id} className="flex gap-0 items-start self-stretch max-sm:min-w-[600px]">
          <div className="flex flex-col gap-2.5 justify-center items-center px-5 py-2.5 w-14 h-9 border border-solid bg-stone-900 border-zinc-800">
            <span className="text-xs font-medium tracking-tight leading-4 text-center text-white">{signer.id}</span>
          </div>
          <div className="flex flex-col gap-2.5 justify-center items-center px-5 py-2.5 h-9 border border-solid bg-stone-900 border-zinc-800 w-[129px]">
            <div className="flex justify-between items-center self-stretch">
              <span className="text-sm tracking-tight leading-4 text-center text-white">{signer.name}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 justify-center items-center px-5 py-2.5 h-9 border border-solid bg-stone-900 border-zinc-800 flex-[1_0_0]">
            <div className="flex gap-1 justify-between items-center self-stretch">
              <span className="text-sm tracking-tight leading-4 text-center text-white">{signer.address}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 justify-center items-center px-5 py-2.5 h-9 border border-solid bg-stone-900 border-zinc-800 w-[126px]">
            <button
              className="flex gap-1.5 justify-center items-center px-2.5 pt-1.5 pb-2 bg-[#FF2323] rounded-xl shadow"
              style={{
                padding: "6px 10px 8px 10px",
                borderRadius: "10px",
                fontWeight: "500",
                letterSpacing: "-0.084px",
                lineHeight: "100%",
                boxShadow:
                  "0px 0px 0px 1px #D70000, 0px 1px 3px 0px rgba(143, 9, 9, 0.20), 0px -2.4px 0px 0px #D70000 inset",
              }}
            >
              <span className="text-sm font-medium tracking-normal leading-3 text-white">Remove</span>
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-0 justify-center items-center self-stretch px-0 py-2.5 bg-neutral-950">
        <span className="text-base tracking-tight leading-5 text-white">New signer</span>
      </div>
    </div>
  );
}
