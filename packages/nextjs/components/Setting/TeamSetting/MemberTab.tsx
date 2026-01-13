"use client";
import React from "react";
import MemberCard from "./MemberCard";

type Role = "Owner" | "Admin";

interface Member {
  id: string;
  name: string;
  email: string;
  companyRole: string;
  role: Role[];
}

const members: Member[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "mail@mail.com",
    companyRole: "Finance Manager",
    role: ["Owner", "Admin"],
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "mail@mail.com",
    companyRole: "Accountant",
    role: ["Admin"],
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "mail@mail.com",
    companyRole: "HR Specialist",
    role: ["Admin"],
  },
];

const Chip = ({ label }: { label: Role }) => (
  <div className="px-3 py-1 rounded-full w-fit flex items-center gap-1 border-b border-primary-divider bg-background">
    {label === "Owner" && <img src="/misc/purple-crown-icon.svg" alt="Owner" className="w-5" />}
    {label === "Admin" && <img src="/misc/green-shield-icon.svg" alt="Admin" className="w-5" />}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

interface MemberTabProps {
  onMenuClick: (memberId: string) => void;
}

const MemberTab: React.FC<MemberTabProps> = ({ onMenuClick }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search and Create Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Search Input */}
        <section className="flex flex-row items-center justify-between px-3 py-2 border border-primary-divider rounded-xl bg-app-background w-[200px]">
          <input
            type="text"
            placeholder="Search by name"
            className="text-sm text-text-primary outline-none placeholder-text-secondary w-full"
          />
          <img src="/misc/blue-search-icon.svg" alt="search" className="w-5 h-5" />
        </section>
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {members.map(member => (
          <MemberCard key={member.id} member={member} onMenuClick={onMenuClick} />
        ))}
      </div>
    </div>
  );
};

export default MemberTab;
