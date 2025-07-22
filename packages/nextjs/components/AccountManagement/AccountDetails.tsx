"use client";
import * as React from "react";
import { SignersTable } from "./SignersTable";
import { ThresholdSelector } from "./ThresholdSelector";
import { ModulesList } from "./ModulesList";
import { ActionButton } from "../Common/ActionButton";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";

export function AccountDetails() {
  const [privateAccount, setPrivateAccount] = React.useState(true);
  const { openModal } = useModal();

  return (
    <main className="flex flex-col gap-4 justify-between items-center self-stretch p-4 rounded-xl bg-zinc-800 w-full max-md:w-full">
      <section className="flex flex-col gap-2.5 items-start self-stretch">
        <label className="text-base font-medium leading-4 text-center text-white">Account name</label>
        <div className="flex flex-col gap-1.5 items-start self-stretch p-3 rounded-xl bg-neutral-700">
          <input
            type="text"
            value="Jessie02"
            className="text-base font-medium tracking-tight leading-5 text-white flex-[1_0_0] w-[703px] bg-transparent border-none outline-none"
            readOnly
          />
        </div>
      </section>

      <section className="flex justify-between items-center self-stretch">
        <div className="flex flex-col gap-1 justify-center items-start flex-[1_0_0]">
          <h3 className="text-base font-medium leading-4 text-center text-white">Private account</h3>
          <p className="self-stretch text-sm tracking-normal leading-4 text-neutral-500">
            No one can view the account details and your transaction proceeded under this account
          </p>
        </div>
        <ToggleSwitch enabled={privateAccount} onChange={setPrivateAccount} />
      </section>

      <section className="flex flex-col gap-2.5 items-start self-stretch">
        <div className="flex gap-2.5 items-center self-stretch">
          <div className="flex flex-col gap-1 justify-center items-start flex-[1_0_0]">
            <h3 className="text-base font-medium leading-4 text-center text-white">Account features</h3>
            <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500">Description</p>
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
            onClick={() => {
              openModal(MODAL_IDS.MODULES_SETUP);
            }}
          >
            Account features
          </button>
        </div>
        <ModulesList />
      </section>

      <section className="flex flex-col gap-2.5 items-start self-stretch">
        <div className="flex flex-col gap-1 justify-center items-start self-stretch">
          <h3 className="text-base font-medium leading-4 text-center text-white">Co-owners list</h3>
          <p className="self-stretch text-base tracking-tight leading-5 text-neutral-500">
            Set the signer and how many need to confirm to execute a valid transaction
          </p>
        </div>
        <SignersTable />
      </section>

      <ThresholdSelector />

      <footer className="flex gap-2 items-start self-stretch max-sm:flex-col">
        <button
          className={`font-barlow font-medium text-sm transition-colors cursor-pointer bg-white text-blue-600 h-10.5 w-40`}
          style={{
            padding: "6px 10px 8px 10px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "bold",
            lineHeight: "100%",
            boxShadow:
              "0px 0px 0px 1px #0059FF, 0px 1px 3px 0px rgba(9, 65, 143, 0.20), 0px -2.4px 0px 0px #0059FF inset",
          }}
          onClick={() => {}}
        >
          Cancel
        </button>
        <ActionButton text="Save changes" onClick={() => {}} disabled={true} className="h-10 w-full font-bold" />
      </footer>
    </main>
  );
}
