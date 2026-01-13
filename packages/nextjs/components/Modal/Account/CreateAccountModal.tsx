"use client";
import React, { useState } from "react";
import { CreateAccountModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../../Common/ModalHeader";
import BaseModal from "../BaseModal";
import InputFilled from "@/components/Common/Input/InputFilled";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { PrimaryButton } from "@/components/Common/PrimaryButton";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Viewer" | "Owner";
  companyRole?: string;
  avatar?: string;
}

const TabHeader = ({ activeTab }: { activeTab: "detail" | "member" | "review" }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-row border-b border-primary-divider relative w-[600px]">
        <div className="flex items-center justify-center px-5 py-3 w-[200px] cursor-pointer group transition-colors duration-300">
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeTab === "detail" ? "" : "text-text-secondary"
            }`}
          >
            Account Details
          </p>
        </div>
        <div className="flex items-center justify-center px-5 py-3 w-[200px] cursor-pointer transition-colors duration-300">
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeTab === "member" ? "" : "text-text-secondary"
            }`}
          >
            Choose Members
          </p>
        </div>
        <div className="flex items-center justify-center px-5 py-3 w-[200px] cursor-pointer transition-colors duration-300">
          <p
            className={`font-medium text-base leading-6 transition-colors duration-300 ${
              activeTab === "review" ? "" : "text-text-secondary"
            }`}
          >
            Review
          </p>
        </div>
        <div
          className="absolute bottom-0 h-[3px] bg-primary-blue transition-all duration-300"
          style={{
            width: activeTab === "detail" ? "200px" : activeTab === "member" ? "400px" : "600px",
          }}
        />
      </div>
    </div>
  );
};

const MemberRow = ({
  initials,
  avatarGradient,
  name,
  email,
  companyRole,
  role,
}: {
  initials?: string;
  avatarGradient?: string;
  name: string;
  email: string;
  companyRole: string;
  role: "Owner" | "Admin" | "Viewer";
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex gap-2 items-center">
        <div
          className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatarGradient ?? "from-gray-400 to-gray-600"} flex items-center justify-center text-white text-xs font-bold`}
        >
          {initials}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-1 items-center">
            <p className="text-sm font-medium text-text-primary">{name}</p>
            {companyRole && <span className="text-xs font-semibold text-primary-blue">{companyRole}</span>}
          </div>
          <p className="text-xs font-medium text-text-secondary">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {role === "Owner" && <img src="/misc/purple-crown-icon.svg" alt="Owner" className="w-5" />}
        {role === "Admin" && <img src="/misc/green-shield-icon.svg" alt="Admin" className="w-5" />}
        {role === "Viewer" && <img src="/misc/orange-eye-icon.svg" alt="Viewer" className="w-5" />}
        {role && <p className="text-sm font-medium text-text-primary">{role}</p>}
      </div>
    </div>
  );
};

export function CreateAccountModal({ isOpen, onClose }: ModalProp<CreateAccountModalProps>) {
  const { openModal } = useModal();
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "member" | "review">("detail");
  const [thresholdDropdownOpen, setThresholdDropdownOpen] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<MemberItem[]>([]);
  const tabOrder = ["detail", "member", "review"] as const;

  const goNext = () => {
    const idx = tabOrder.indexOf(activeTab);
    if (idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
  };

  const goBack = () => {
    const idx = tabOrder.indexOf(activeTab);
    if (idx === 0) return onClose();
    setActiveTab(tabOrder[idx - 1]);
  };

  const handleThresholdChange = (value: number) => {
    setThresholdValue(value);
    setThresholdDropdownOpen(false);
  };

  const handleOpenAddMemberModal = () => {
    openModal("ADD_MEMBER", {
      onMembersSelected: (members: any) => {
        setSelectedMembers(members as MemberItem[]);
      },
    });
  };

  const handleRemoveMember = (id: string) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== id));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return "/misc/green-shield-icon.svg";
      case "Viewer":
        return "/misc/orange-eye-icon.svg";
      case "Owner":
        return "/misc/purple-crown-icon.svg";
      default:
        return "";
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "detail":
        return (
          <>
            <span className="text-3xl">Create new account</span>

            <div className="flex justify-center items-center w-20 h-20 rounded-full border border-primary-divider">
              <img src="/setting/new-account.svg" alt="Create Account Illustration" className="w-full h-full" />
            </div>

            <div className="w-[600px] flex flex-col gap-2">
              <InputFilled label="Set account name" placeholder="Enter account name" />
              <InputFilled label="Description" placeholder="Enter description" optional type="textarea" />
            </div>
          </>
        );
      case "member":
        return (
          <>
            <span className="text-3xl">Member and threshold configuration</span>

            {/* Members Section */}
            <div className="w-[600px] flex flex-col gap-3">
              {/* Members Tab */}
              <div className="bg-app-background rounded-2xl p-0 overflow-hidden">
                {/* Tab Header */}
                <div className="border-b border-primary-divider flex items-center justify-between px-4 py-3">
                  <div className="flex gap-4 items-center">
                    <p className="text-base font-medium text-text-primary">Members</p>
                    <span className="text-base font-medium text-text-secondary">{selectedMembers.length}</span>
                  </div>

                  <button
                    onClick={handleOpenAddMemberModal}
                    className="flex gap-2 items-center px-4 py-1.5 bg-background shadow-md rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <span className="leading-none mb-0.5 text-lg">+</span>
                    <p className="text-sm">Add</p>
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex flex-col px-2 py-2">
                  {selectedMembers.length === 0 ? (
                    <div
                      className="flex flex-col gap-2 items-center justify-center h-[250px] cursor-pointer"
                      onClick={handleOpenAddMemberModal}
                    >
                      <div className="w-12 h-12 rounded-full border border-primary-divider flex items-center justify-center bg-background shadow-md">
                        <span className="leading-none text-4xl mb-1 text-text-secondary">+</span>
                      </div>
                      <p className="text-sm font-semibold text-text-secondary text-center">Choose members from Qash</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {selectedMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-3 px-2 hover:bg-background rounded-lg transition-colors"
                        >
                          <div className="flex gap-3 items-center flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {member.name.charAt(0)}
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                              <div className="flex gap-2 items-center">
                                <p className="text-sm font-medium text-text-primary leading-none">{member.name}</p>
                                {member.companyRole && (
                                  <span className="text-xs font-semibold text-primary-blue">{member.companyRole}</span>
                                )}
                              </div>
                              <p className="text-xs font-medium text-text-secondary leading-none">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg">
                              {getRoleIcon(member.role) && (
                                <img src={getRoleIcon(member.role)} alt={member.role} className="w-5 h-5" />
                              )}
                              <p className="text-sm font-medium text-text-primary">{member.role}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Threshold Section */}
              <div className="flex gap-4 items-start">
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-base font-medium text-text-primary leading-none">Threshold</p>
                  <p className="text-xs font-medium text-text-secondary leading-none">
                    Any transaction requires the confirmation of
                  </p>
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="relative">
                    <button
                      onClick={() => setThresholdDropdownOpen(!thresholdDropdownOpen)}
                      className="bg-background border border-primary-divider border-solid flex gap-2 items-center px-4 py-2 relative rounded-lg cursor-pointer"
                    >
                      <p className="font-medium leading-6 text-base text-text-primary">{thresholdValue}</p>
                      <img alt="dropdown" className="w-4" src="/arrow/chevron-down.svg" />
                    </button>

                    {thresholdDropdownOpen && selectedMembers.length > 0 && (
                      <div className="absolute bottom-full right-0 mb-1 bg-background border border-primary-divider rounded-lg shadow-lg z-10">
                        {Array.from({ length: selectedMembers.length }, (_, i) => i + 1).map((option, index) => (
                          <button
                            key={option}
                            onClick={() => handleThresholdChange(option)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              option === thresholdValue ? "bg-blue-50 font-medium" : ""
                            } ${index === 0 ? "rounded-t-lg" : ""}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-text-primary whitespace-nowrap">
                    out of {selectedMembers.length} admin members
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      case "review":
        return (
          <>
            <div className="flex flex-col gap-2 items-center">
              <span className="text-3xl leading-none">Review your account</span>
              <span className="text-sm text-text-secondary leading-none">
                Make sure everything looks correct before you proceed.
              </span>
            </div>

            {/* Account Info Card */}
            <div className="w-[600px] flex flex-col gap-2 bg-app-background rounded-2xl p-4 overflow-hidden">
              {/* Header with Avatar and Title */}
              <div className="flex flex-col gap-2 border-b border-primary-divider pb-2">
                <div className="w-16 h-16 rounded-full border border-primary-divider flex items-center justify-center bg-background">
                  <img src="/setting/new-account.svg" alt="Account" className="w-full h-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-4xl font-medium text-text-primary">Payroll</h3>
                  <p className="text-base font-medium text-text-secondary">
                    Handles salary distribution and automates payroll transactions.
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-2.5 py-1">
                {/* Members Card */}
                <div className="flex-1 bg-background rounded-lg px-4 py-2 flex flex-col gap-1 justify-center shadow-sm">
                  <p className="text-2xl font-semibold text-text-primary">30</p>
                  <p className="text-base font-medium text-text-secondary">Members</p>
                </div>

                {/* Threshold Card */}
                <div className="flex-1 bg-background rounded-lg px-4 py-2 flex flex-col gap-1 justify-center shadow-sm">
                  <p className="text-2xl font-semibold text-text-primary">
                    {thresholdValue}/{selectedMembers.length || 10}
                  </p>
                  <p className="text-base font-medium text-text-secondary">Threshold</p>
                </div>

                {/* Deploy Fee Card */}
                <div className="flex-1 bg-background rounded-lg px-4 py-2 flex flex-col gap-1 justify-center shadow-sm">
                  <p className="text-2xl font-semibold text-text-primary">~0.004</p>
                  <p className="text-base font-medium text-text-secondary">Deploy fee</p>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-background rounded-lg p-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
                {selectedMembers.length > 0 ? (
                  selectedMembers.map(member => (
                    <MemberRow
                      key={member.id}
                      initials={member.name.substring(0, 2).toUpperCase()}
                      avatarGradient="from-blue-400 to-blue-600"
                      name={member.name}
                      companyRole={member.companyRole || ""}
                      email={member.email}
                      role={member.role as "Owner" | "Admin" | "Viewer"}
                    />
                  ))
                ) : (
                  <p className="text-text-secondary text-center py-4">No members selected</p>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  if (!isOpen) return null;
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Create new account" onClose={onClose} icon="/misc/create-account-icon.svg" />
      <div className="flex flex-col w-[800px] p-4 justify-center  rounded-b-2xl items-center border-2  border-primary-divider bg-background gap-5">
        {!isSuccess ? (
          <>
            <TabHeader activeTab={activeTab} />
            {renderTabContent()}
            <div className="w-[600px] flex flex-row gap-2">
              <SecondaryButton
                text="Back"
                onClick={goBack}
                buttonClassName="flex-1"
                icon="/arrow/chevron-left.svg"
                iconPosition="left"
                variant="light"
                disabled={activeTab === "detail"}
              />
              <PrimaryButton
                text={activeTab === "review" ? "Create" : "Next"}
                onClick={() => {
                  if (activeTab === "review") {
                    setIsSuccess(true);
                    return;
                  }

                  goNext();
                }}
                containerClassName={`flex-1`}
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center flex-col rounded-3xl border border-primary-divider relative overflow-hidden w-[600px]">
            <div
              className="absolute inset-0 w-full h-full z-0"
              style={{
                background: "url('/onboarding/complete-background.svg')",
                backgroundSize: "cover",
                filter: "blur(8px)",
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full py-10 gap-4">
              <img src="/onboarding/hexagon-avatar.svg" alt="Onboarding Complete" className="w-[180px] h-[180px]" />

              <div className="w-full flex items-center justify-center gap-2 flex-col">
                <span className="font-bold text-2xl leading-none">Your account is ready!</span>
                <span className="text-sm text-text-secondary leading-none">
                  Below are the wallet details and the transaction that created it.
                </span>
              </div>

              <div className="w-fit bg-background rounded-xl border border-primary-divider shadow-md px-2 py-4 flex flex-row items-center justify-between gap-2 ">
                <span className="text-text-secondary text-sm">Wallet address:</span>
                <span>0x3aF91b27dC8E44E5f0C8D1A7F5B923cA7F1E9dB2</span>
                <img src="/misc/copy-icon.svg" alt="Copy" className="w-4 cursor-pointer" />
              </div>

              <div className="w-full flex items-center justify-center gap-2 flex-row px-20">
                <SecondaryButton
                  text="View on Explorer"
                  buttonClassName="flex-1"
                  icon="/misc/globe.svg"
                  variant="light"
                  iconPosition="left"
                />
                <PrimaryButton
                  text="View Account"
                  containerClassName="flex-1"
                  onClick={() => {
                    onClose();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
}

export default CreateAccountModal;
