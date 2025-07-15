"use client";
import * as React from "react";

interface GroupTabsProps {
  groups: string[];
  activeGroup: string;
  onGroupChange: (group: string) => void;
}

export const GroupTabs: React.FC<GroupTabsProps> = ({ groups, activeGroup, onGroupChange }) => {
  return (
    <nav className="flex flex-wrap gap-1.5 justify-center p-1 w-full text-base tracking-tight leading-tight text-center text-white rounded-xl bg-neutral-950 min-h-[34px] max-md:max-w-full">
      {groups.map((group, index) => (
        <button
          key={group}
          onClick={() => onGroupChange(group)}
          className={`flex overflow-hidden flex-1 shrink gap-1 justify-center items-center px-4 py-1.5 h-full rounded-lg basis-0 ${
            index === 0 ? "bg-zinc-800" : ""
          }`}
        >
          <span
            className={`flex-1 shrink self-stretch my-auto basis-0 text-ellipsis ${
              index === 0 ? "text-white" : "text-white opacity-50"
            }`}
          >
            {group}
          </span>
        </button>
      ))}
    </nav>
  );
};
