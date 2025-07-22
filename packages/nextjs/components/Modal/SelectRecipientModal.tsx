"use client";
import * as React from "react";
import { ActionButton } from "../Common/ActionButton";
import { SelectRecipientModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../Common/ModalHeader";
import BaseModal from "./BaseModal";

interface AddressItemProps {
  name: string;
  address: string;
  isSelected?: boolean;
  onToggle?: () => void;
}

const tabs = [
  { id: "all", label: "All" },
  { id: "company", label: "My Company" },
  { id: "friends", label: "Friends" },
  { id: "shanghai", label: "Shanghai_Travel" },
];

function AddressItem({ name, address, isSelected = true, onToggle }: AddressItemProps) {
  return (
    <div
      className="flex gap-2.5 items-center self-stretch px-3.5 py-3.5 max-md:p-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2.5 cursor-pointer"
      onClick={onToggle}
    >
      <span className="relative flex justify-center items-center p-0.5 w-5 h-5 rounded-md border-solid bg-blend-luminosity bg-stone-50 bg-opacity-30 border-[0.42px] border-white border-opacity-40 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => e.stopPropagation()}
          className="appearance-none w-full h-full absolute left-0 top-0 z-10 cursor-pointer rounded-md"
          aria-label={`${isSelected ? "Unselect" : "Select"} ${name}`}
          style={{ margin: 0 }}
        />
        {isSelected && (
          <span className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="checkbox-icon"
              style={{ width: "15px", height: "15px", flexShrink: 0 }}
            >
              <path
                d="M13 4.81445L6.34597 11.4685C6.22393 11.5905 6.02607 11.5905 5.90403 11.4685L3 8.56445"
                stroke="white"
                strokeWidth="1.25"
                strokeLinecap="round"
              ></path>
            </svg>
          </span>
        )}
      </span>
      <p className="overflow-hidden text-base leading-5 text-white flex-[1_0_0] text-ellipsis max-md:text-base max-sm:text-sm">
        {name}
      </p>
      <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-700">
        <span className="text-sm tracking-tight leading-5 text-white max-sm:text-xs">{address}</span>
      </div>
    </div>
  );
}

export function SelectRecipientModal({ isOpen, onClose, onSave }: ModalProp<SelectRecipientModalProps>) {
  const [addressInput, setAddressInput] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");
  const [addresses, setAddresses] = React.useState([
    {
      id: "1",
      name: "Danny Kang",
      address: "0xd3...sd09",
      isSelected: true,
    },
    {
      id: "2",
      name: "Hwang Suk",
      address: "0xDD...e23f",
      isSelected: true,
    },
  ]);

  const handleAddAddress = () => {
    if (addressInput.trim()) {
      // Handle adding new address
      console.log("Adding address:", addressInput);
      setAddressInput("");
    }
  };

  const handleToggleAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => (addr.id === id ? { ...addr, isSelected: !addr.isSelected } : addr)));
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Choose address" icon="/modal/choose-address-icon.gif">
      <div className="flex flex-col items-center rounded-b-2xl border border-solid bg-[#1E1E1E] border-zinc-800 h-[490px] w-[500px] max-md:h-auto max-md:max-w-[500px] max-md:min-h-[490px] max-md:w-[90%] max-sm:m-2.5 max-sm:h-auto max-sm:min-h-[400px] max-sm:w-[95%]">
        {/* Main */}
        <main className="flex flex-col gap-3 items-start self-stretch p-1.5 flex-[1_0_0]">
          {/* Address Input */}
          <section className="flex flex-col gap-1.5 items-start self-stretch px-1 py-0 rounded-xl bg-zinc-800">
            <div className="flex relative gap-2.5 items-center self-stretch px-3.5 py-3.5 rounded-lg backdrop-blur-[2px] max-sm:p-3">
              <input
                type="text"
                placeholder="Enter address"
                value={addressInput}
                onChange={e => setAddressInput(e.target.value)}
                className="text-base tracking-tight leading-5 flex-[1_0_0] text-neutral-600 max-md:text-base bg-transparent border-none outline-none placeholder-neutral-600"
              />
              <ActionButton text="Add" onClick={handleAddAddress} />
            </div>
          </section>

          {/* Address List */}
          <section className="flex flex-col gap-2.5 items-start self-stretch flex-[1_0_0]">
            <h2 className="text-base tracking-tighter leading-5 text-white">Your address book (30)</h2>

            {/* Filter Tabs */}
            <nav className="flex gap-1.5 items-start self-stretch max-md:flex-wrap max-sm:flex-wrap max-sm:gap-1">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex gap-2.5 items-center px-4 py-2.5 rounded-3xl bg-zinc-800 max-sm:px-3 max-sm:py-2"
                >
                  <span className="text-sm leading-4 text-white max-sm:text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex flex-col gap-1.5 items-start self-stretch">
              <div className="flex flex-col gap-1.5 items-start self-stretch p-1 rounded-xl bg-[#313131]">
                {addresses.map(address => (
                  <AddressItem
                    key={address.id}
                    name={address.name}
                    address={address.address}
                    isSelected={address.isSelected}
                    onToggle={() => handleToggleAddress(address.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex gap-2 items-start self-stretch">
            <ActionButton text="Save" onClick={onSave} className="w-full h-10" />
          </footer>
        </main>
      </div>
    </BaseModal>
  );
}

export default SelectRecipientModal;
