"use client";
import React, { useState } from "react";
import { useAuth } from "@/services/auth/context";
import { useUpdateTeamMember } from "@/services/api/team-member";
import { SecondaryButton } from "../Common/SecondaryButton";
import SettingHeader from "./SettingHeader";

export default function AccountSettings() {
  const { user } = useAuth();
  const updateMutation = useUpdateTeamMember();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState("");

  const displayName = user?.teamMembership ? `${user.teamMembership.firstName} ${user.teamMembership.lastName}` : "N/A";
  const email = user?.email || "N/A";

  const handleEditClick = () => {
    setName(displayName);
    setIsEditingName(true);
  };

  const handleUpdateName = async () => {
    if (!user?.teamMembership?.id) {
      console.error("Missing user information");
      return;
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      await updateMutation.mutateAsync({
        teamMemberId: user.teamMembership.id,
        updateDto: {
          firstName,
          lastName,
        },
      });
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setName("");
  };

  return (
    <div className="flex flex-col">
      <SettingHeader icon="/misc/user-hexagon-icon.svg" title="Account" />
      <div className="border border-primary-divider rounded-2xl p-5 flex flex-col gap-4 max-w-2xl">
        {/* Name Section */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-secondary leading-5 tracking-[-0.21px]">Name</label>

          {!isEditingName ? (
            <div className="flex items-start justify-between w-full">
              <p className="text-base font-medium text-text-primary leading-6 tracking-[-0.32px]">{displayName}</p>
              <button
                onClick={handleEditClick}
                className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
              >
                <img src="/misc/edit-icon.svg" alt="Edit" className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <div className="bg-[#F5F5F6] rounded-lg px-3 py-1 flex items-center gap-2 w-full relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-transparent text-sm font-medium text-text-primary leading-5 tracking-[-0.56px] outline-none w-full"
                  placeholder="Enter name"
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <SecondaryButton onClick={handleCancelEdit} text="Cancel" variant="light" buttonClassName="px-4" />
                  <SecondaryButton
                    onClick={handleUpdateName}
                    text={updateMutation.isPending ? "Updating..." : "Update"}
                    buttonClassName="px-4"
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Section */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-secondary leading-5 tracking-[-0.21px]">Email</label>
          <div className="flex items-start w-full">
            <p className="text-base font-medium text-text-primary leading-6 tracking-[-0.32px]">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
