"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import { SelectClientModalProps } from "@/types/modal";
import { ModalProp } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../../Common/ModalHeader";
import BaseModal from "../BaseModal";
import { CustomCheckbox } from "@/components/Common/CustomCheckbox";
import { SecondaryButton } from "@/components/Common/SecondaryButton";
import { CustomBlueCheckbox } from "@/components/Common/Checkbox/CustomBlueCheckbox";
import { MemberRoleTooltip } from "@/components/Common/ToolTip/MemberRoleTooltip";

interface MemberData {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Viewer" | "Owner";
  companyRole?: string;
  avatar?: string;
  isSelected?: boolean;
}

// Mock data for members - replace with real data from API
const mockMembers: MemberData[] = [
  {
    id: "1",
    name: "Kaito Yamamoto",
    email: "kaitoyamato@gmail.com",
    role: "Admin",
    companyRole: "CFO",
    isSelected: true,
  },
  {
    id: "2",
    name: "Yuki Nakamura",
    email: "yuki@gmail.com",
    role: "Admin",
    companyRole: "CTO",
    isSelected: true,
  },
  {
    id: "3",
    name: "Kristin Watson",
    email: "yuki@gmail.com",
    role: "Admin",
    companyRole: "HR",
    isSelected: true,
  },
  {
    id: "4",
    name: "Jacob Jones",
    email: "yuki@gmail.com",
    role: "Viewer",
    companyRole: "Employee",
    isSelected: true,
  },
  {
    id: "5",
    name: "Albert Flores",
    email: "yuki@gmail.com",
    role: "Viewer",
    companyRole: "Employee",
    isSelected: true,
  },
  {
    id: "6",
    name: "Cody Fisher",
    email: "yuki@gmail.com",
    role: "Viewer",
    companyRole: "Employee",
    isSelected: false,
  },
];

const MemberRow = ({
  member,
  onSelect,
  onRoleChange,
}: {
  member: MemberData;
  onSelect: (id: string) => void;
  onRoleChange: (id: string, role: "Admin" | "Viewer") => void;
}) => {
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

  const tooltipId = `role-tooltip-${member.id}`;

  return (
    <div className="flex items-center justify-between py-3 px-2 hover:bg-app-background rounded-lg transition-colors w-full">
      <div className="flex gap-2 items-center flex-1">
        <CustomBlueCheckbox checked={member.isSelected ?? false} onChange={() => onSelect(member.id)} />
        <div className="flex gap-3 items-center flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {member.name.charAt(0)}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <p className="text-sm font-medium text-text-primary leading-none">{member.name}</p>
              {member.companyRole && (
                <span className="text-xs font-semibold text-primary-blue">{member.companyRole}</span>
              )}
            </div>
            <p className="text-xs font-medium text-text-secondary leading-none">{member.email}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-app-background transition-colors"
          data-tooltip-id={tooltipId}
          data-tooltip-place="top"
        >
          {getRoleIcon(member.role) && <img src={getRoleIcon(member.role)} alt={member.role} className="w-5 h-5" />}
          <p className="text-sm font-medium text-text-primary">{member.role}</p>
          <img src="/arrow/chevron-down.svg" alt="expand" className="w-4 rotate-180" />
        </div>
        <Tooltip
          id={tooltipId}
          clickable
          style={{
            zIndex: 20,
            borderRadius: "16px",
            padding: "0",
          }}
          place="bottom"
          noArrow
          border="none"
          opacity={1}
          render={({ content }) => (
            <MemberRoleTooltip
              currentRole={member.role as "Admin" | "Viewer"}
              onRoleChange={role => {
                onRoleChange(member.id, role);
              }}
            />
          )}
        />
      </div>
    </div>
  );
};

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMembersSelected?: (members: MemberData[]) => void;
}

export function AddMemberModal({ isOpen, onClose, onMembersSelected }: AddMemberModalProps) {
  const [members, setMembers] = useState<MemberData[]>(mockMembers);
  const [search, setSearch] = useState("");

  const selectedCount = members.filter(m => m.isSelected).length;
  const totalCount = members.length;

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    const term = search.toLowerCase();
    return members.filter(
      member => member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term),
    );
  }, [members, search]);

  const handleSelectMember = (id: string) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, isSelected: !m.isSelected } : m)));
  };

  const handleRoleChange = (id: string, role: "Admin" | "Viewer") => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, role } : m)));
  };

  const handleSelectAll = () => {
    setMembers(prev => prev.map(m => ({ ...m, isSelected: true })));
  };

  const handleDeselectAll = () => {
    setMembers(prev => prev.map(m => ({ ...m, isSelected: false })));
  };

  const handleAddMembers = () => {
    const selectedMembers = members.filter(m => m.isSelected);
    if (onMembersSelected) {
      onMembersSelected(selectedMembers);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Add Members" onClose={onClose} />
      <div className="flex flex-col rounded-b-2xl border-2 bg-background border-primary-divider w-[650px] gap-3 py-4">
        {/* Search bar */}
        <div className="w-full px-6">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-app-background border border-primary-divider ">
            <input
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-text-primary placeholder-text-secondary outline-none text-sm"
            />
            <img src="/misc/blue-search-icon.svg" alt="search" className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Members list */}
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto px-6">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <MemberRow
                key={member.id}
                member={member}
                onSelect={handleSelectMember}
                onRoleChange={handleRoleChange}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary">No members found</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-primary-divider pt-4 px-6">
          <div className="flex gap-4 items-center">
            <div className="flex gap-1 items-center px-3 py-2">
              <p className="text-sm font-medium text-text-primary">
                {selectedCount}
                <span className="text-text-secondary">/{totalCount}</span>
              </p>
              <p className="text-sm font-medium text-text-secondary">Selected</p>
            </div>
            <button
              onClick={selectedCount === totalCount ? handleDeselectAll : handleSelectAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-app-background transition-colors"
            >
              <p className="text-sm font-medium text-primary-blue">
                {selectedCount === totalCount ? "Deselect all" : "Select all"}
              </p>
            </button>
          </div>
          <SecondaryButton
            onClick={handleAddMembers}
            disabled={selectedCount === 0}
            text="Add"
            buttonClassName="w-fit px-6"
          />
        </div>
      </div>
    </BaseModal>
  );
}

export default AddMemberModal;
