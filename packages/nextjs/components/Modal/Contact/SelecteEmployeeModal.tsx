"use client";
import React, { useEffect, useMemo, useState } from "react";
import { SelectEmployeeModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../../Common/ModalHeader";
import BaseModal from "../BaseModal";
import { useGetAllEmployeeGroups, useGetEmployeesByGroup, useGetAllEmployees } from "@/services/api/employee";
import { useForm } from "react-hook-form";
import { formatAddress } from "@/services/utils/miden/address";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useQueryClient } from "@tanstack/react-query";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import { createShapeElement } from "../../Common/ToolTip/ShapeSelectionTooltip";
import { CompanyContactResponseDto, CompanyGroupResponseDto } from "@/types/employee";
import { useAuth } from "@/services/auth/context";

interface AddressItemProps {
  name: string;
  address: string;
  email: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

function AddressItem({ name, address, email, isSelected = false, onSelect }: AddressItemProps) {
  return (
    <div
      className="flex gap-2.5 items-center self-stretch p-3.5 rounded-lg cursor-pointer hover:bg-app-background w-full"
      onClick={onSelect}
    >
      <img src={blo(turnBechToHex(address))} alt="address" className="w-9 h-9 rounded-full" />
      <div className="flex flex-col gap-1">
        <p className=" leading-5 text-text-primary font-semibold">
          {name} <span className="text-text-secondary text-sm">({email})</span>
        </p>
        <span className="text-sm tracking-tight leading-5 text-text-secondary">{formatAddress(address)}</span>
      </div>
    </div>
  );
}

export function SelectEmployeeModal({ isOpen, onClose, onSave }: ModalProp<SelectEmployeeModalProps>) {
  // **************** Custom Hooks *******************
  const { isAuthenticated } = useAuth();
  const { register, watch, reset } = useForm();
  const { data: employeeGroups } = useGetAllEmployeeGroups({ enabled: isAuthenticated });
  const { data: allEmployees } = useGetAllEmployees(1, 1000, { enabled: isAuthenticated });
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

  const { data: categoryEmployees } = useGetEmployeesByGroup(getCategoryId() || 0, 1, 1000);

  // Use appropriate data source based on active tab
  const addressBooks = activeTab === "all" ? (allEmployees?.data ?? []) : (categoryEmployees?.data ?? []);

  // Filter address books by search term
  const filteredAddressBooks = useMemo(() => {
    if (!search || !addressBooks) return addressBooks || [];
    const term = search.toLowerCase();
    return addressBooks.filter((ab: CompanyContactResponseDto) => {
      return ab.name.toLowerCase().includes(term) || ab.walletAddress.toLowerCase().includes(term);
    });
  }, [addressBooks, search]);

  // Get category names for tabs
  const groupNames = useMemo(() => {
    if (!employeeGroups) return [];
    return employeeGroups.map(groups => groups.name);
  }, [employeeGroups]);

  //*******************************************************
  //******************* Effects ***************************
  //*******************************************************

  // Set default active tab
  useEffect(() => {
    if (groupNames.length > 0 && activeTab === "all") {
      setActiveTab("all");
    }
  }, [groupNames, activeTab]);

  useEffect(() => {
    if (isConnected) {
      // When connected, rely on react-query freshness; no manual refetch needed
      return;
    }

    // Clear data and reset all state when disconnected
    queryClient.removeQueries({ queryKey: ["employees"] });
    queryClient.removeQueries({ queryKey: ["employees", "groups"] });
    setActiveTab("all");
    setSelectedAddress("");
    setSelectedName("");
    reset(); // Clear search form
  }, [isConnected, queryClient, reset]);

  //*******************************************************
  //******************* Handlers ***************************
  //*******************************************************

  // Handle address selection (auto-return on click)
  const handleSelectAddress = (employee: CompanyContactResponseDto) => {
    setSelectedAddress(employee.walletAddress);
    setSelectedName(employee.name);
    // Automatically save and close when a recipient is selected
    if (onSave) {
      onSave(employee);
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
      <ModalHeader title="Select employee from contact" onClose={onClose} />
      <div className="flex flex-col items-start rounded-b-2xl border-2 bg-background border-primary-divider h-[580px] w-[650px] p-3">
        {/* Search Input */}
        <section className="flex flex-row items-center justify-between p-3 rounded-xl bg-app-background w-full">
          <input
            type="text"
            placeholder="Search name, email or wallet address"
            className="text-text-primary outline-none placeholder-text-secondary w-full"
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
              <span className={`${activeTab === "all" ? "text-white" : "text-text-primary"}`}>All groups</span>
            </button>
            {employeeGroups?.map((groups: CompanyGroupResponseDto, idx: number) => {
              const group = employeeGroups?.find(c => c.id === groups.id);
              return (
                <button
                  type="button"
                  key={groups.id}
                  onClick={() => handleTabChange(groups.id.toString())}
                  className={`flex gap-2.5 items-center px-5 py-2 rounded-3xl cursor-pointer font-semibold ${
                    activeTab === groups.id.toString()
                      ? "bg-black text-white"
                      : "text-text-primary border border-primary-divider bg-transparent"
                  }`}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    {groups && createShapeElement(groups.shape, groups.color)}
                  </div>
                  <span className={`${activeTab === groups.id.toString() ? "text-white" : "text-text-primary"}`}>
                    {groups.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {filteredAddressBooks && filteredAddressBooks.length > 0 ? (
            <div className="flex flex-col items-start h-full w-full">
              {filteredAddressBooks.map((employee: CompanyContactResponseDto, idx: number) => (
                <AddressItem
                  key={`${employee.walletAddress}-${employee.name}`}
                  name={employee.name}
                  address={employee.walletAddress}
                  email={employee.email || ""}
                  isSelected={selectedAddress === employee.walletAddress}
                  onSelect={() => handleSelectAddress(employee)}
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

export default SelectEmployeeModal;
