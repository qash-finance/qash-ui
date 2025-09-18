"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ActionButton } from "../../Common/ActionButton";
import { CreateNewGroupModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { CustomCheckbox } from "@/components/Common/CustomCheckbox";
import { useGetAddressBooks } from "@/services/api/address-book";
import { AddressBook } from "@/types/address-book";
import { Empty } from "../../Common/Empty";
import { useForm } from "react-hook-form";
import { formatAddress } from "@/services/utils/miden/address";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useQueryClient } from "@tanstack/react-query";
import { Table, CellContent } from "@/components/Common/Table";
import { useCreateGroup } from "@/services/api/group-payment";
import { toast } from "react-hot-toast";
import { CreateGroupDto } from "@/types/group-payment";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";

interface AddressItemProps {
  name: string;
  address: string;
  isSelected?: boolean;
  onToggle?: () => void;
}

const tableHeaders = ["No", "Remembered Name", "Address"];

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

export function CreateNewGroupModal({ isOpen, onClose, zIndex }: ModalProp<CreateNewGroupModalProps>) {
  // **************** Custom Hooks *******************
  const { register, getValues, setValue } = useForm();
  const { data: addressBooks, refetch: refetchAddressBooks } = useGetAddressBooks();
  const { isConnected } = useWalletConnect();
  const queryClient = useQueryClient();
  const { mutate: createGroup } = useCreateGroup();
  const { walletAddress } = useWalletAuth();

  // **************** Local State *******************
  const [groupName, setGroupName] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [selectedAddressDetails, setSelectedAddressDetails] = useState<
    Map<string, { address: AddressBook; category: string }>
  >(new Map());

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

  // No search filter; use grouped address books directly
  const filteredGroupedAddressBooks = useMemo(() => groupedAddressBooks, [groupedAddressBooks]);

  // Tabs = categories (use filtered results when searching)
  const categories = useMemo(() => Object.keys(filteredGroupedAddressBooks), [filteredGroupedAddressBooks]);

  // Get selected addresses details for the table
  const selectedAddressesDetails = useMemo(() => {
    return Array.from(selectedAddressDetails.values()).map(item => item.address);
  }, [selectedAddressDetails]);

  //*******************************************************
  //******************* Effects ***************************
  //*******************************************************

  // Set default active tab
  useEffect(() => {
    if (categories.length > 0 && !activeTab) setActiveTab(categories[0]);
  }, [categories, activeTab]);

  useEffect(() => {
    if (categories.length > 0 && !activeTab) setActiveTab(categories[0]);
    if (categories.length > 0 && !categories.includes(activeTab)) setActiveTab(categories[0]);
  }, [categories, activeTab]);

  useEffect(() => {
    if (isConnected) {
      // Refetch address books when connected
      refetchAddressBooks();
    } else {
      // Clear data and reset all state when disconnected
      queryClient.removeQueries({ queryKey: ["address-book"] });
      setActiveTab("");
      setSelectedAddresses(new Set());
      setSelectedAddressDetails(new Map());
      setGroupName("");
      setValue("manualAddress", "");
    }
  }, [isConnected, refetchAddressBooks, queryClient, setValue]);

  // Add manual address handler
  const handleAddManualAddress = async () => {
    const { Address } = await import("@demox-labs/miden-sdk");

    const manualAddress = (getValues("manualAddress") as string | undefined)?.trim() || "";
    if (!manualAddress) {
      toast.error("Enter an address");
      return;
    }
    // Prevent duplicates by address
    const isDuplicate = Array.from(selectedAddressDetails.values()).some(
      item => item.address.address === manualAddress,
    );
    if (isDuplicate) {
      toast.error("Address already added");
      return;
    }

    if (walletAddress === manualAddress) {
      toast.error("You cannot add yourself to the group");
      return;
    }

    try {
      Address.fromBech32(manualAddress);
    } catch (error) {
      toast.error("Invalid address");
      return;
    }

    const randomName = "QashFam-" + Math.random().toString(36).substring(2, 15);

    const category = "Manual";
    const addressBookEntry: AddressBook = {
      name: randomName,
      address: manualAddress,
      userAddress: "",
    } as AddressBook;
    // Use a stable unique id that does NOT include the (editable) name
    const uniqueId = `${category}:${addressBookEntry.address}`;

    setSelectedAddresses(prev => {
      const next = new Set(prev);
      next.add(uniqueId);
      return next;
    });
    setSelectedAddressDetails(prev => {
      const next = new Map(prev);
      next.set(uniqueId, { address: addressBookEntry, category });
      return next;
    });

    setValue("manualAddress", "");
  };

  //*******************************************************
  //******************* Handlers ***************************
  //*******************************************************

  // Handle select toggle (multiple select for group creation)
  const handleToggleAddress = (addressBook: AddressBook, category: string) => {
    // Stable id: category + address
    const uniqueId = `${category}:${addressBook.address}`;

    setSelectedAddresses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uniqueId)) {
        newSet.delete(uniqueId);
      } else {
        newSet.add(uniqueId);
      }
      return newSet;
    });

    setSelectedAddressDetails(prev => {
      const newMap = new Map(prev);
      if (newMap.has(uniqueId)) {
        newMap.delete(uniqueId);
      } else {
        newMap.set(uniqueId, { address: addressBook, category });
      }
      return newMap;
    });
  };

  // Remove address from selected list
  const handleRemoveAddress = (uniqueId: string) => {
    setSelectedAddresses(prev => {
      const newSet = new Set(prev);
      newSet.delete(uniqueId);
      return newSet;
    });

    setSelectedAddressDetails(prev => {
      const newMap = new Map(prev);
      newMap.delete(uniqueId);
      return newMap;
    });
  };

  // Action renderer for the table
  const actionRenderer = (rowData: Record<string, CellContent>, index: number) => {
    const addressDetail = selectedAddressesDetails[index];
    // Find the unique ID for this address detail
    const uniqueId = Array.from(selectedAddressDetails.keys()).find(key => {
      const details = selectedAddressDetails.get(key);
      return details?.address === addressDetail;
    });
    return <ActionButton text="Remove" type="deny" onClick={() => uniqueId && handleRemoveAddress(uniqueId)} />;
  };

  // Format data for the table
  const tableData = selectedAddressesDetails.map((addressDetail, index) => {
    // Derive stable unique id for this row based on the stored map entry
    const uniqueId = Array.from(selectedAddressDetails.entries()).find(
      ([_key, value]) => value.address === addressDetail,
    )?.[0];
    return {
      No: <span className="text-white font-medium">{(index + 1).toString()}</span>,
      "Remembered Name": (
        <input
          type="text"
          placeholder="Enter name"
          className="text-white text-[16px] tracking-[-0.32px] leading-none w-full outline-none text-center"
          value={addressDetail.name}
          onChange={e =>
            setSelectedAddressDetails(
              prev =>
                new Map(
                  Array.from(prev.entries()).map(([key, value]) =>
                    key === uniqueId
                      ? [key, { ...value, address: { ...value.address, name: e.target.value } }]
                      : [key, value],
                  ),
                ),
            )
          }
        />
      ),
      Address: <span className="text-white font-medium truncate">{formatAddress(addressDetail.address)}</span>,
    };
  });

  // Save handler
  const handleSave = () => {
    if (groupName.trim() && selectedAddresses.size > 0) {
      // Build members from the selected details map to include the latest edited names
      const members = Array.from(selectedAddressDetails.values()).map(({ address }) => ({
        address: address.address,
        name: address.name,
      }));

      const groupData: CreateGroupDto = {
        name: groupName.trim(),
        members,
      };

      createGroup(groupData, {
        onSuccess: () => {
          toast.success("Group created successfully");
          setSelectedAddresses(new Set());
          setSelectedAddressDetails(new Map());
          setGroupName("");
          onClose();
        },
        onError: () => {
          toast.error("Failed to create group");
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create new group"
      icon="/sidebar/group-payment.gif"
      zIndex={zIndex}
    >
      <div
        className="
          flex flex-col items-center rounded-b-2xl border border-solid bg-[#1E1E1E] border-zinc-800
          max-h-[700px] w-[500px] overflow-y-auto
        "
      >
        {/* Main */}
        <main className="flex flex-col gap-3 items-start self-stretch p-1.5">
          <input
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="tracking-tight leading-5 text-3xl text-white max-md:text-base bg-transparent border-none outline-none placeholder-[#7C7C7C] w-full"
          />

          {/* Address Bar */}
          <section className="flex items-center gap-2 self-stretch px-4 py-2 rounded-xl bg-zinc-800">
            <input
              type="text"
              placeholder="Enter address"
              className="text-base tracking-tight leading-5 flex-[1_0_0] text-white max-md:text-base bg-transparent border-none outline-none placeholder-neutral-600"
              {...register("manualAddress")}
            />
            <ActionButton text="Add" onClick={handleAddManualAddress} />
          </section>

          {/* Address List */}
          <section className=" flex flex-col gap-2.5 items-start self-stretch flex-[1_0_0]">
            <h2 className="text-base tracking-tighter leading-5 text-white">
              Your address book ({(filteredGroupedAddressBooks[activeTab] as AddressBook[])?.length || 0})
            </h2>

            {/* Filter Tabs */}
            <nav className="flex gap-1.5 items-start self-stretch max-md:flex-wrap max-sm:flex-wrap max-sm:gap-1 overflow-x-auto">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                  }}
                  className={`outline-none flex gap-2.5 items-center px-4 py-2.5 rounded-3xl max-sm:px-3 max-sm:py-2 cursor-pointer ${
                    activeTab === cat ? "bg-[#066EFF] text-black" : "bg-zinc-800 text-white"
                  }`}
                >
                  <span className="text-sm leading-4 text-white max-sm:text-sm">{cat}</span>
                </button>
              ))}
            </nav>

            {(filteredGroupedAddressBooks[activeTab] as AddressBook[])?.length > 0 ? (
              <div className="flex flex-col gap-1.5 items-start self-stretch p-1 rounded-xl bg-[#313131] overflow-y-auto max-h-[133px]">
                {(filteredGroupedAddressBooks[activeTab] as AddressBook[])?.map((ab: AddressBook) => {
                  const uniqueId = `${activeTab}:${ab.address}`;
                  return (
                    <AddressItem
                      key={uniqueId}
                      name={ab.name}
                      address={ab.address}
                      isSelected={selectedAddresses.has(uniqueId)}
                      onToggle={() => handleToggleAddress(ab, activeTab)}
                    />
                  );
                })}
              </div>
            ) : (
              <Empty icon="/no-request-icon.svg" title="No addresses" className="h-full" />
            )}

            <h2 className="text-base tracking-tighter leading-5 text-white">Selected ({selectedAddresses.size})</h2>
            {selectedAddressesDetails.length > 0 ? (
              <div className="w-full max-h-[170px] overflow-y-auto min-h-[100px]">
                <Table headers={tableHeaders} data={tableData} actionColumn={true} actionRenderer={actionRenderer} />
              </div>
            ) : (
              <Empty icon="/no-request-icon.svg" title="No addresses selected" className="h-20" />
            )}
          </section>

          {/* Footer */}
          <footer className="flex gap-2 items-start self-stretch">
            <ActionButton
              text="Save"
              onClick={handleSave}
              className="w-full h-10"
              disabled={!groupName.trim() || selectedAddresses.size === 0}
            />
          </footer>
        </main>
      </div>
    </BaseModal>
  );
}

export default CreateNewGroupModal;
