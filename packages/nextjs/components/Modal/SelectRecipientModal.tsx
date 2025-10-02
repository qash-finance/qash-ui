"use client";
import React, { useEffect, useMemo, useState } from "react";
import { SelectRecipientModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../Common/ModalHeader";
import BaseModal from "./BaseModal";
import { useGetCategories, useGetAllAddressBooks, useGetAddressBooksByCategory } from "@/services/api/address-book";
import { AddressBook, Category } from "@/types/address-book";
import { Empty } from "../Common/Empty";
import { useForm } from "react-hook-form";
import { formatAddress } from "@/services/utils/miden/address";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useQueryClient } from "@tanstack/react-query";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { createShapeElement } from "../ContactBook/ShapeSelectionTooltip";

interface AddressItemProps {
  name: string;
  address: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

function AddressItem({ name, address, isSelected = false, onSelect }: AddressItemProps) {
  return (
    <div
      className="flex gap-2.5 items-center self-stretch p-3.5 rounded-lg cursor-pointer hover:bg-app-background w-full"
      onClick={onSelect}
    >
      <img src={blo(turnBechToHex(address))} alt="address" className="w-9 h-9 rounded-full" />
      <div className="flex flex-col gap-1">
        <p className=" leading-5 text-text-primary font-semibold">{name}</p>
        <span className="text-sm tracking-tight leading-5 text-text-secondary">{formatAddress(address)}</span>
      </div>
    </div>
  );
}

export function SelectRecipientModal({ isOpen, onClose, onSave }: ModalProp<SelectRecipientModalProps>) {
  // **************** Custom Hooks *******************
  const { register, watch, reset } = useForm();
  const { data: categories } = useGetCategories();
  const { data: allAddressBooks, refetch: refetchAllAddressBooks } = useGetAllAddressBooks();
  const { isConnected } = useWalletConnect();
  const queryClient = useQueryClient();

  // **************** Local State *******************
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const search = watch("search");

  // Get address books based on active tab
  const getCategoryId = () => {
    if (activeTab === "all") return null;
    return Number(activeTab);
  };

  const { data: categoryAddressBooks } = useGetAddressBooksByCategory(getCategoryId());

  // Use appropriate data source based on active tab
  const addressBooks = activeTab === "all" ? allAddressBooks : categoryAddressBooks;

  // Filter address books by search term
  const filteredAddressBooks = useMemo(() => {
    if (!search || !addressBooks) return addressBooks || [];
    return addressBooks.filter((ab: AddressBook) => ab.name.toLowerCase().includes(search.toLowerCase()));
  }, [addressBooks, search]);

  // Get category names for tabs
  const categoryNames = useMemo(() => {
    if (!categories) return [];
    return categories.map(cat => cat.name);
  }, [categories]);

  //*******************************************************
  //******************* Effects ***************************
  //*******************************************************

  // Set default active tab
  useEffect(() => {
    if (categoryNames.length > 0 && activeTab === "all") {
      setActiveTab("all");
    }
  }, [categoryNames, activeTab]);

  useEffect(() => {
    if (isConnected) {
      // Refetch address books when connected
      refetchAllAddressBooks();
    } else {
      // Clear data and reset all state when disconnected
      queryClient.removeQueries({ queryKey: ["address-book"] });
      queryClient.removeQueries({ queryKey: ["categories"] });
      setActiveTab("all");
      setSelectedAddress("");
      setSelectedName("");
      reset(); // Clear search form
    }
  }, [isConnected, refetchAllAddressBooks, queryClient, reset]);

  //*******************************************************
  //******************* Handlers ***************************
  //*******************************************************

  // Handle address selection (auto-return on click)
  const handleSelectAddress = (address: string, name: string) => {
    setSelectedAddress(address);
    setSelectedName(name);
    // Automatically save and close when a recipient is selected
    if (onSave) {
      onSave(address, name);
      onClose && onClose();
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedAddress(""); // Clear selection on tab change
    setSelectedName("");
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Select from contact book" onClose={onClose} />
      <div className="flex flex-col items-start rounded-b-2xl border-2 bg-background border-primary-divider h-[580px] w-[650px] p-3">
        {/* Search Input */}
        <section className="flex flex-row items-center justify-between p-3 rounded-xl bg-app-background w-full">
          <input
            type="text"
            placeholder="Search name or address"
            className="text-text-primary outline-none placeholder-text-secondary"
            {...register("search")}
          />
          <img src="/misc/blue-search-icon.svg" alt="search" className="w-5 h-5" />
        </section>

        {/* Address List */}
        <section className="overflow-x-auto flex flex-col gap-2.5 items-start self-stretch flex-[1_0_0]">
          <h2 className="leading-5 text-text-secondary">{filteredAddressBooks?.length || 0} contacts</h2>

          {/* Filter Tabs */}
          <nav className="flex gap-1.5 items-start self-stretch -overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`flex gap-2.5 items-center px-5 py-2 rounded-3xl cursor-pointer font-semibold ${
                activeTab === "all"
                  ? "bg-black text-white"
                  : "text-text-primary border border-primary-divider bg-transparent"
              }`}
            >
              <span className={`${activeTab === "all" ? "text-white" : "text-text-primary"}`}>All Categories</span>
            </button>
            {categoryNames.map((cat, idx) => {
              const category = categories?.find(c => c.name === cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleTabChange(category?.id.toString() || "")}
                  className={`flex gap-2.5 items-center px-5 py-2 rounded-3xl cursor-pointer font-semibold ${
                    activeTab === category?.id.toString()
                      ? "bg-black text-white"
                      : "text-text-primary border border-primary-divider bg-transparent"
                  }`}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    {category && createShapeElement(category.shape, category.color)}
                  </div>
                  <span className={`${activeTab === category?.id.toString() ? "text-white" : "text-text-primary"}`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </nav>

          {filteredAddressBooks && filteredAddressBooks.length > 0 ? (
            <div className="flex flex-col items-start h-full w-full">
              {filteredAddressBooks.map((ab: AddressBook, idx: number) => (
                <AddressItem
                  key={ab.address + ab.name}
                  name={ab.name}
                  address={ab.address}
                  isSelected={selectedAddress === ab.address}
                  onSelect={() => handleSelectAddress(ab.address, ab.name)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">No contacts found</div>
          )}
        </section>
      </div>
    </BaseModal>
  );
}

export default SelectRecipientModal;
