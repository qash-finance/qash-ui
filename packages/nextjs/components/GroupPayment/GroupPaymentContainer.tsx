"use client";
import React, { useEffect, useState } from "react";
import { GroupCard } from "./GroupCard";
import { PaymentDetails } from "./PaymentDetails";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { useGetAllGroups } from "@/services/api/group-payment";
import { Group } from "@/types/group-payment";
import { ActionButton } from "../Common/ActionButton";
import { DEFAULT_AVATAR_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import { useGetAddressBooks } from "@/services/api/address-book";

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="w-full h-[110px] flex items-center justify-center bg-[#292929] rounded-xl flex-col gap-2">
    <img src="/sidebar/group-payment.gif" alt="No group" className="w-8 h-8" style={{ filter: "grayscale(1)" }} />
    <div className="text-[#7C7C7C]">{message}</div>
  </div>
);

const GroupPaymentContainer: React.FC = () => {
  const { openModal } = useModal();
  const { data: groups, isLoading, error } = useGetAllGroups();
  const { data: addressBooks } = useGetAddressBooks();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Auto-select "Quick Share" group when groups are loaded
  useEffect(() => {
    if (groups && groups.length > 0) {
      const quickShareGroup = groups.find(group => group.name === "Quick Share");
      if (quickShareGroup) {
        setSelectedGroup(quickShareGroup);
      }
    }
  }, [groups]);

  // Transform API groups data to match GroupCard props, excluding "Quick Share" group
  const groupsData =
    groups
      ?.filter(group => group.name !== "Quick Share")
      .map(group => ({
        id: group.id,
        imageSrc: blo(DEFAULT_AVATAR_ADDRESS),
        name: group.name,
        memberCount: group.members.length,
        members: group.members,
      })) || [];

  return (
    <main className="overflow-hidden self-stretch px-4 pt-5 pb-4 rounded-2xl bg-neutral-950 w-full">
      <div className="pb-4 w-full max-md:max-w-full">
        <header className="flex flex-wrap gap-10 justify-between items-start w-full max-md:max-w-full">
          <div className="flex gap-1.5 items-center text-white">
            <h1 className="self-stretch my-auto text-lg font-medium leading-none text-center text-white">Your group</h1>
            <div className=" bg-neutral-700 rounded-full">
              <span className="px-2 py-1 text-white">{groupsData.length}</span>
            </div>
          </div>
          <ActionButton
            text="New group"
            type="neutral"
            onClick={() => openModal(MODAL_IDS.CREATE_NEW_GROUP)}
            className="h-10"
          />
        </header>

        <section className="flex overflow-x-auto gap-2.5 items-start mt-2.5 w-full max-md:max-w-full">
          {isLoading ? (
            <EmptyState message="Loading groups..." />
          ) : error ? (
            <EmptyState message="Error loading groups" />
          ) : groupsData.length === 0 ? (
            <EmptyState message="No group" />
          ) : (
            groupsData.map(group => (
              <GroupCard
                key={group.id}
                imageSrc={group.imageSrc}
                title={group.name}
                memberCount={group.memberCount}
                selected={selectedGroup?.id === group.id}
                onClick={() => {
                  if (!groups) return;

                  // Toggle select/deselect
                  if (selectedGroup?.id === group.id) {
                    // Deselect to Quick Share (treated as no specific group)
                    const quickShare = groups.find(g => g.name === "Quick Share") || null;
                    setSelectedGroup(quickShare);
                    return;
                  }

                  const found = groups.find(g => g.id === group.id);
                  if (found) setSelectedGroup(found);
                }}
                onEdit={() => openModal(MODAL_IDS.EDIT_GROUP, { group: group })}
              />
            ))
          )}
        </section>
      </div>

      <section className="flex-1 mt-2 w-full max-md:max-w-full h-[74%]">
        <h2 className="text-lg font-medium leading-none text-white max-md:max-w-full">Quick share</h2>
        <PaymentDetails
          selectedGroup={selectedGroup}
          groups={groups || []}
          onGroupSelect={group => setSelectedGroup(group)}
        />
      </section>
    </main>
  );
};

export default GroupPaymentContainer;
