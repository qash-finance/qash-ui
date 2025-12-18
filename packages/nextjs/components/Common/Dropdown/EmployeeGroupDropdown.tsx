"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { createShapeElement } from "../ToolTip/ShapeSelectionTooltip";
import { CompanyGroupResponseDto } from "@/types/employee";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";

interface EmployeeGroupDropdownProps {
  groups?: CompanyGroupResponseDto[];
  selectedGroup?: CompanyGroupResponseDto;
  onGroupSelect: (group: CompanyGroupResponseDto) => void;
  disabled?: boolean;
}

export const EmployeeGroupDropdown = ({
  groups,
  selectedGroup,
  onGroupSelect,
  disabled = false,
}: EmployeeGroupDropdownProps) => {
  const { openModal } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGroupClick = (group: any) => {
    onGroupSelect(group);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 h-full w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed justify-between"
        disabled={disabled}
      >
        <div className="flex flex-col">
          <span className="text-text-secondary text-sm">Select group</span>
          <p className="text-text-primary font-semibold">{selectedGroup?.name || "Select a group"}</p>
        </div>
        <img
          src="/arrow/chevron-down.svg"
          alt="dropdown"
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-5 shadow-lg bg-background border-2 border-primary-divider rounded-xl z-50 overflow-hidden p-2 h-fit overflow-y-auto">
          <div className="px-2 py-1">
            <p className="text-text-secondary text-xs">Select a group</p>
          </div>

          <div className="flex flex-col">
            {groups &&
              groups.length > 0 &&
              groups.map((group, index) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupClick(group)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-app-background transition-colors cursor-pointer ${
                    selectedGroup?.id === group.id ? "bg-app-background" : ""
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {createShapeElement(group.shape, group.color)}
                  </div>
                  <span className="text-text-primary font-semibold">{group.name}</span>
                </button>
              ))}
            <button
              type="button"
              onClick={() => openModal(MODAL_IDS.CREATE_GROUP, { onGroupCreated: handleGroupClick })}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-app-background transition-colors cursor-pointer"
            >
              <img src="/misc/blue-circle-plus-icon.svg" alt="create new group" className="w-5 h-5" />
              <span className="text-primary-blue ">Add a new group</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
