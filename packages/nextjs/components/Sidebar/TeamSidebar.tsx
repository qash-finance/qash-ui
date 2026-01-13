"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MOVE_CRYPTO_SIDEBAR_OFFSET } from "./Sidebar";
import { PrimaryButton } from "../Common/PrimaryButton";
import { SecondaryButton } from "../Common/SecondaryButton";

interface TeamSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Image constants from Figma
const imgAva3 = "https://www.figma.com/api/mcp/asset/c389d8bd-5645-4ba5-8773-0ff071c3c94c";
const imgAva4 = "https://www.figma.com/api/mcp/asset/24f9c5d4-4d77-43e5-9b57-f34f365187d7";
const imgAva5 = "https://www.figma.com/api/mcp/asset/28ae59ea-40ef-4d38-b276-c5e15a1e2b85";

export default function TeamSidebar({ isOpen, onClose }: TeamSidebarProps) {
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  const handleCreateNewAccount = () => {
    // TODO: Implement create new account logic
    console.log("Create new account");
  };

  const handleAddMember = () => {
    // TODO: Implement add member logic
    console.log("Add member");
  };

  return (
    <>
      {/* Backdrop overlay for click outside detection */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[5] bg-transparent"
          onClick={onClose}
          style={{
            pointerEvents: isOpen ? "auto" : "none",
          }}
        />
      )}
      <div
        className="absolute top-0 h-[100%] w-[400px] z-5 rounded-tr-lg rounded-br-lg p-4 flex flex-col gap-4 transition-all duration-300 ease-in-out overflow-y-auto bg-background"
        style={{
          left: isOpen ? `${MOVE_CRYPTO_SIDEBAR_OFFSET}px` : "-20px",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          pointerEvents: isOpen ? "auto" : "none",
          boxShadow: isOpen ? "50px 0 50px rgba(0,0,0,0.15)" : "none",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4 mt-8">
          {/* Team Avatar and Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <img alt="Team Avatar" className="w-10" src="/logo/qash-icon-dark.svg" />
              <img alt="cheveron Left" className="w-5" src="/arrow/double-chevron-left.svg" onClick={onClose} />
            </div>

            <h2 className="text-[24px] font-medium leading-[24px] text-text-primary">Qash Team</h2>

            {/* Team Members Tab */}
            <div className="flex gap-2 items-center">
              {/* <div className="flex items-center -space-x-2">
                <div className="relative rounded-full w-5 h-5 border-2 border-app-background">
                  <img alt="Team member 1" className="w-full h-full object-cover rounded-full" src={imgAva3} />
                </div>
                <div className="relative rounded-full w-5 h-5 border-2 border-app-background">
                  <img alt="Team member 2" className="w-full h-full object-cover rounded-full" src={imgAva4} />
                </div>
                <div className="relative rounded-full w-5 h-5 border-2 border-app-background">
                  <img alt="Team member 3" className="w-full h-full object-cover rounded-full" src={imgAva5} />
                </div>
              </div> */}
              <span className="text-xs font-medium text-text-secondary">30 members</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-2">
          <PrimaryButton
            text="Create new account"
            icon="/misc/circle-plus-icon.svg"
            iconPosition="left"
            onClick={handleCreateNewAccount}
          />
          <SecondaryButton text="Add member" icon="/misc/plus-icon.svg" iconPosition="left" onClick={handleAddMember} />
        </div>

        {/* Multisig Accounts Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-text-primary">Multisig Accounts</h3>
            <span className="text-sm font-medium text-text-secondary">0</span>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
            <img alt="Empty State Icon" className="w-32" src="/misc/hexagon-multisig-icon.svg" />
            <p className="text-center text-text-secondary max-w-xs leading-none">
              You don't have a multisig account yet.
            </p>
            <p className="text-center text-text-secondary max-w-xs leading-none">Create one now.</p>
          </div>
        </div>
      </div>
    </>
  );
}
