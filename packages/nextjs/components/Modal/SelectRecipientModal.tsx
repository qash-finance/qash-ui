"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ActionButton } from "../Common/ActionButton";
import { SelectRecipientModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../Common/ModalHeader";
import BaseModal from "./BaseModal";
import { useGetAddressBooks } from "@/services/api/address-book";
import { AddressBook } from "@/types/address-book";
import { Empty } from "../Common/Empty";
import { useForm } from "react-hook-form";
import { formatAddress } from "@/services/utils/miden/address";
import { CustomCheckbox } from "../Common/CustomCheckbox";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useQueryClient } from "@tanstack/react-query";

interface AddressItemProps {
  name: string;
  address: string;
  isSelected?: boolean;
  onToggle?: () => void;
}

function AddressItem({ name, address, isSelected = false, onToggle }: AddressItemProps) {
  return (
    <div
      className="flex gap-2.5 items-center self-stretch px-3.5 py-3.5 max-md:p-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2.5 cursor-pointer border-b last:border-b-0 border-[black]"
      onClick={onToggle}
    >
      <CustomCheckbox
        checked={isSelected}
        onChange={() => onToggle?.()}
        aria-label={`${isSelected ? "Unselect" : "Select"} ${name}`}
      />

      <p className="overflow-hidden text-base leading-5 text-white flex-[1_0_0] text-ellipsis max-md:text-base max-sm:text-sm">
        {name}
      </p>
      <div className="flex gap-1 justify-center items-center px-2 py-1.5 rounded-xl bg-neutral-700">
        <span className="text-sm tracking-tight leading-5 text-white max-sm:text-xs">{formatAddress(address)}</span>
      </div>
    </div>
  );
}

export function SelectRecipientModal({ isOpen, onClose, onSave }: ModalProp<SelectRecipientModalProps>) {
  // **************** Custom Hooks *******************
  const { register, watch, reset } = useForm();
  const { data: addressBooks, refetch: refetchAddressBooks } = useGetAddressBooks();
  const { isConnected } = useWalletConnect();
  const queryClient = useQueryClient();

  // **************** Local State *******************
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const search = watch("search");

  // Group address books by category
  const groupedAddressBooks = useMemo(() => {
    // Don't show any data when disconnected
    if (!isConnected || !addressBooks) return {};
    return addressBooks.reduce((groups: Record<string, AddressBook[]>, categoryData: any) => {
      const category = categoryData.name; // Use 'name' as category from the new structure
      if (!groups[category]) groups[category] = [];
      // Add all addressBooks from this category
      groups[category].push(...(categoryData.addressBooks || []));
      return groups;
    }, {});
  }, [addressBooks, isConnected]);

  // Filter address books by search term
  const filteredGroupedAddressBooks = useMemo(() => {
    if (!search || !groupedAddressBooks) return groupedAddressBooks;

    const filtered: Record<string, AddressBook[]> = {};
    Object.keys(groupedAddressBooks).forEach(category => {
      const filteredInCategory = (groupedAddressBooks[category] || []).filter((ab: AddressBook) =>
        ab.name.toLowerCase().includes(search.toLowerCase()),
      );
      if (filteredInCategory.length > 0) {
        filtered[category] = filteredInCategory;
      }
    });
    return filtered;
  }, [groupedAddressBooks, search]);

  // Tabs = categories (use filtered results when searching)
  const categories = useMemo(() => Object.keys(filteredGroupedAddressBooks), [filteredGroupedAddressBooks]);

  //*******************************************************
  //******************* Effects ***************************
  //*******************************************************

  // Set default active tab
  useEffect(() => {
    if (categories.length > 0 && !activeTab) setActiveTab(categories[0]);
  }, [categories, activeTab]);

  useEffect(() => {
    if (search && categories.length > 0) {
      // If current active tab doesn't exist in filtered results, switch to first available
      if (!categories.includes(activeTab)) {
        setActiveTab(categories[0]);
      }
    } else if (!search && categories.length > 0 && !activeTab) {
      // Reset to first category when search is cleared
      setActiveTab(categories[0]);
    }
  }, [search, categories, activeTab]);

  useEffect(() => {
    if (isConnected) {
      // Refetch address books when connected
      refetchAddressBooks();
    } else {
      // Clear data and reset all state when disconnected
      queryClient.removeQueries({ queryKey: ["address-book"] });
      setActiveTab("");
      setSelectedAddress("");
      setSelectedName("");
      reset(); // Clear search form
    }
  }, [isConnected, refetchAddressBooks, queryClient, reset]);

  //*******************************************************
  //******************* Handlers ***************************
  //*******************************************************

  // Handle select toggle (single select)
  const handleToggleAddress = (address: string, name: string) => {
    if (address === selectedAddress) {
      setSelectedAddress("");
      setSelectedName("");
    } else {
      setSelectedAddress(address);
      setSelectedName(name);
    }
  };

  // Save handler
  const handleSave = () => {
    if (onSave && selectedAddress) {
      onSave(selectedAddress, selectedName);
      setSelectedAddress("");
      setSelectedName("");
      onClose && onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      title="Choose address"
      icon="/modal/choose-address-icon.gif"
    >
      <div className="flex flex-col items-center rounded-b-2xl border border-solid bg-[#1E1E1E] border-zinc-800 h-[490px] w-[500px] max-md:h-auto max-md:max-w-[500px] max-md:min-h-[490px] max-md:w-[90%] max-sm:m-2.5 max-sm:h-auto max-sm:min-h-[400px] max-sm:w-[95%]">
        {/* Main */}
        <main className="flex flex-col gap-3 items-start self-stretch p-1.5 flex-[1_0_0]">
          {/* Search Input */}
          <section className="flex flex-col gap-1.5 items-start self-stretch px-1 py-0 rounded-xl bg-zinc-800">
            <div className="flex relative gap-2.5 items-center self-stretch px-3.5 py-3.5 rounded-lg backdrop-blur-[2px] max-sm:p-3">
              <input
                type="text"
                placeholder="Search"
                className="text-base tracking-tight leading-5 flex-[1_0_0] text-neutral-600 max-md:text-base bg-transparent border-none outline-none placeholder-neutral-600"
                {...register("search")}
              />
            </div>
          </section>

          {/* Address List */}
          <section className="overflow-x-auto flex flex-col gap-2.5 items-start self-stretch flex-[1_0_0]">
            <h2 className="text-base tracking-tighter leading-5 text-white">
              Your address book ({(filteredGroupedAddressBooks[activeTab] as AddressBook[])?.length || 0})
            </h2>

            {/* Filter Tabs */}
            <nav className="flex gap-1.5 items-start self-stretch max-md:flex-wrap max-sm:flex-wrap max-sm:gap-1 overflow-x-auto">
              {categories.map((cat, idx) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setSelectedAddress(""); // clear selection on tab change (optional)
                    setSelectedName("");
                  }}
                  className={`flex gap-2.5 items-center px-4 py-2.5 rounded-3xl max-sm:px-3 max-sm:py-2 cursor-pointer ${
                    activeTab === cat ? "bg-[#066EFF] text-black" : "bg-zinc-800 text-white"
                  }`}
                >
                  <span className="text-sm leading-4 text-white max-sm:text-sm">{cat}</span>
                </button>
              ))}
            </nav>

            {(filteredGroupedAddressBooks[activeTab] as AddressBook[])?.length > 0 ? (
              <div className="flex flex-col gap-1.5 items-start self-stretch">
                <div className="flex flex-col gap-1.5 items-start self-stretch p-1 rounded-xl bg-[#313131]">
                  {(filteredGroupedAddressBooks[activeTab] as AddressBook[])?.map((ab: AddressBook, idx: number) => (
                    <AddressItem
                      key={ab.address + ab.name}
                      name={ab.name}
                      address={ab.address}
                      isSelected={selectedAddress === ab.address}
                      onToggle={() => handleToggleAddress(ab.address, ab.name)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Empty
                icon="/no-request-icon.svg"
                title={search ? "No matching addresses" : "No addresses"}
                className="h-full"
              />
            )}
          </section>

          {/* Footer */}
          <footer className="flex gap-2 items-start self-stretch">
            <ActionButton text="Save" onClick={handleSave} className="w-full h-10" disabled={!selectedAddress} />
          </footer>
        </main>
      </div>
    </BaseModal>
  );
}

export default SelectRecipientModal;
