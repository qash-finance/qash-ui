import React from "react";

type Role = "Owner" | "Admin";

interface Member {
  id: string;
  name: string;
  email: string;
  companyRole: string;
  role: Role[];
}

interface MemberCardProps {
  member: Member;
  onMenuClick: (memberId: string) => void;
}

const Chip = ({ label }: { label: Role }) => (
  <div className="px-3 py-1 rounded-full w-fit flex items-center gap-1 border-b border-primary-divider bg-background">
    {label === "Owner" && <img src="/misc/purple-crown-icon.svg" alt="Owner" className="w-5" />}
    {label === "Admin" && <img src="/misc/green-shield-icon.svg" alt="Admin" className="w-5" />}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const MemberCard: React.FC<MemberCardProps> = ({ member, onMenuClick }) => {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuClick(member.id);
  };

  return (
    <div className="border border-primary-divider rounded-[16px] p-4 flex flex-col gap-4 bg-app-background">
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
          onClick={handleMenuClick}
        />
      </div>
    </div>
  );
};

export default MemberCard;
