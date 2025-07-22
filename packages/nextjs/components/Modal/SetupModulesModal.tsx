"use client";
import React, { useState } from "react";
import { ToggleSwitch } from "../Common/ToggleSwitch";
import { ActionButton } from "../Common/ActionButton";
import { ModalHeader } from "../Common/ModalHeader";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ModulesSetupProps } from "@/types/modal";
import BaseModal from "./BaseModal";

interface Signer {
  id: number;
  name: string;
  address: string;
}
interface SignerRowProps {
  number: number;
  name: string;
  address: string;
  isPlaceholder?: boolean;
  onRemove?: () => void;
}

const SignerRow: React.FC<SignerRowProps> = ({ number, name, address, isPlaceholder = false, onRemove }) => {
  return (
    <tr className="flex gap-0 items-start w-full max-md:min-w-[500px]">
      <td className="flex justify-center items-center px-5 py-2.5 w-14 border border-solid bg-stone-900 border-zinc-800 h-[37px]">
        <span className="text-xs font-medium tracking-tight leading-4 text-center text-white max-sm:text-xs">
          {number}
        </span>
      </td>

      <td className="flex justify-center items-center px-2 py-2.5 border border-solid bg-stone-900 border-zinc-800 h-[37px] w-[129px]">
        <div className="flex justify-between items-center w-full">
          <span
            className={`text-sm tracking-tight leading-4 text-center max-sm:text-xs ${
              isPlaceholder ? "text-neutral-600" : "text-white"
            }`}
          >
            {name}
          </span>
        </div>
      </td>

      <td className="flex flex-1 justify-center items-start px-5 py-2.5 border border-solid bg-stone-900 border-zinc-800 h-[37px]">
        <div className="flex justify-between items-center w-full">
          <span
            className={`overflow-hidden text-sm tracking-tight leading-4 text-ellipsis max-sm:text-xs ${
              isPlaceholder ? "text-neutral-600 text-center" : "text-white text-left"
            }`}
          >
            {address}
          </span>
        </div>
      </td>

      <td className="flex justify-center items-center p-2 border border-solid bg-stone-900 border-zinc-800 h-[37px] w-[126px]">
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
      </td>
    </tr>
  );
};

const signers = [
  { id: 1, name: "Elon Musk", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
  { id: 2, name: "Alexander", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
  { id: 3, name: "John Smith", address: "0xda5541C4Aa25B300aa1f12473b8c4341297d3sd2" },
];

export const SetupModulesModal = ({
  isOpen,
  onClose,
  onRemoveSigner,
  onAddNewAddress,
  onCancel,
  onSave,
}: ModalProp<ModulesSetupProps>) => {
  const [whitelisting, setWhitelisting] = useState(false);

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Account features" icon="/sidebar/account-management.gif">
      <div className="flex flex-col items-center mx-auto my-0 rounded-b-2xl  bg-[#1E1E1E] h-[553px] w-[950px] max-md:h-auto max-md:max-w-[600px] max-md:w-[90%] max-sm:mx-auto max-sm:my-2.5 max-sm:w-[95%]">
        <div className="flex flex-1 gap-1.5 items-center p-1.5 w-full max-md:flex-col max-md:gap-3">
          {/* Sidebar */}
          <aside className="flex flex-col items-start h-full rounded-md bg-[#292929] w-[350px] max-md:order-2 max-md:w-full">
            <div className="flex justify-between items-center px-3 py-1.5 w-full h-10 border-b border-solid border-b-neutral-700 max-sm:px-2 max-sm:py-1 max-sm:h-9">
              <span className="text-base tracking-tight leading-5 text-white max-sm:text-sm">Whitelisting</span>
              <ToggleSwitch enabled={whitelisting} onChange={setWhitelisting} />
            </div>

            <div className="flex justify-between items-center px-3 py-1.5 w-full h-10 border-b border-solid border-b-neutral-700 max-sm:px-2 max-sm:py-1 max-sm:h-9">
              <span className="text-base tracking-tight leading-5 text-white max-sm:text-sm">Spending limits</span>
              <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-700">
                <span className="text-sm tracking-tight leading-5 text-white">Upcoming</span>
              </div>
            </div>

            <div className="flex justify-between items-center px-3 py-1.5 w-full h-10 border-b border-solid border-b-neutral-700 max-sm:px-2 max-sm:py-1 max-sm:h-9">
              <span className="text-base tracking-tight leading-5 text-white max-sm:text-sm">Timelock transfer</span>
              <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-700">
                <span className="text-sm tracking-tight leading-5 text-white">Upcoming</span>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex flex-col gap-2.5 items-start px-2 py-2.5 h-full rounded-md bg-[#292929] w-full max-md:order-1 max-md:w-full max-sm:px-1.5 max-sm:py-2">
            <section className="flex flex-col gap-1 justify-center items-start w-full">
              <h2 className="text-base font-medium leading-4 text-white max-sm:text-sm">Co-owners list</h2>
              <p className="w-full text-base tracking-tight leading-5 text-neutral-500 max-sm:text-sm">
                This account can only send tokens to these addresses
              </p>
            </section>

            {/* Signers table */}
            <div className="flex flex-col gap-0 items-start w-full rounded-lg border border-solid border-zinc-800 max-md:overflow-x-auto ">
              <table className="w-full">
                <thead>
                  <tr className="flex gap-0 items-start w-full max-md:min-w-[500px]">
                    <th className="flex justify-center items-center p-2.5 w-14 h-9 border border-solid bg-[#181818] border-zinc-800 rounded-tl-lg">
                      <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500 max-sm:text-xs">
                        No
                      </span>
                    </th>

                    <th className="flex justify-center items-center p-2.5 h-9 border border-solid bg-[#181818] border-zinc-800 w-[129px]">
                      <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500 max-sm:text-xs">
                        Remember name
                      </span>
                    </th>

                    <th className="flex flex-1 justify-center items-center p-2.5 h-9 border border-solid bg-[#181818] border-zinc-800">
                      <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500 max-sm:text-xs">
                        Address
                      </span>
                    </th>

                    <th className="flex justify-center items-center p-2.5 h-9 border border-solid bg-[#181818] border-zinc-800 w-[126px] rounded-tr-lg">
                      <span className="text-sm font-medium tracking-tight leading-4 text-center text-neutral-500 max-sm:text-xs">
                        Action
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {signers?.map(signer => (
                    <SignerRow
                      key={signer.id}
                      number={signer.id}
                      name={signer.name}
                      address={signer.address}
                      onRemove={() => onRemoveSigner?.(signer.id)}
                    />
                  ))}

                  <SignerRow number={4} name="Name" address="Address" isPlaceholder={true} onRemove={() => {}} />

                  <tr className="flex gap-0 justify-center items-center px-0 py-2.5 w-full bg-neutral-950 rounded-b-lg">
                    <td className="w-full">
                      <button
                        className="text-base tracking-tight leading-5 text-white w-full"
                        onClick={onAddNewAddress}
                      >
                        New address
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 items-start mt-auto w-full max-sm:flex-col max-sm:gap-2">
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
                onClick={onCancel}
              >
                Cancel
              </button>
              <ActionButton text="Save changes" onClick={onSave} className="w-full h-10" />
            </div>
          </main>
        </div>
      </div>
    </BaseModal>
  );
};

export default SetupModulesModal;
