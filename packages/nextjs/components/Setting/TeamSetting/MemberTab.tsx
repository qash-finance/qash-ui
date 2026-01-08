"use client";
import React from "react";

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

      {/* Account Cards Grid */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {members.map(member => (
          <div
            key={member.id}
            className="border border-primary-divider rounded-[16px] p-4 flex flex-col gap-4 bg-app-background"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              {/* Account Info */}
              <div className="flex flex-col gap-4 flex-1">
                {/* Avatar */}
                <img src={"/client-invoice/accounting-icon.svg"} className="w-10" />

                {/* Account Details */}
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-medium leading-none">{member.name}</h3>
                  <p className="text-sm font-normal text-text-secondary leading-none">{member.email}</p>
                </div>

                {/* Company Role */}
                <span className="text-primary-blue font-bold">{member.companyRole}</span>

                {/* Roles */}
                <div className="flex gap-2">
                  {member.role.map((role, index) => (
                    <Chip key={index} label={role} />
                  ))}
                </div>
              </div>

              {/* Menu Button */}
              <img
                src="/misc/vertical-three-dot-icon.svg"
                alt="Menu"
                className="w-6 cursor-pointer"
                onClick={() => onMenuClick(member.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberTab;
