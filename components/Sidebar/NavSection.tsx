"use client";
import * as React from "react";

interface NavItemData {
  icon: string;
  label: string;
  isActive?: boolean;
}

interface NavSectionProps {
  title: string;
  items: NavItemData[];
  onItemClick?: (index: number) => void;
}

interface NavItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive = false, onClick }) => {
  const baseClasses =
    "flex gap-1.5 items-center p-2.5 w-full whitespace-nowrap rounded-lg cursor-pointer transition-colors";
  const activeClasses =
    "font-semibold text-white rounded-xl bg-[linear-gradient(90deg,_#2563eb_0%,_#181818_40%,_#181818_100%)]";
  const inactiveClasses = "text-neutral-500 hover:bg-neutral-800";

  return (
    <button className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} onClick={onClick} type="button">
      <img src={icon} alt="" className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square" />
      <span
        className={`flex-1 shrink self-stretch my-auto basis-0 text-left ${isActive ? "text-white" : "text-neutral-500"}`}
      >
        {label}
      </span>
    </button>
  );
};

export const NavSection: React.FC<NavSectionProps> = ({ title, items, onItemClick }) => {
  return (
    <section className="mt-1.5">
      <h2 className="text-base leading-none text-neutral-600 mb-1.5">{title}</h2>
      <div className="w-full leading-relaxed text-neutral-500">
        {items.map((item, index) => (
          <NavItem
            key={index}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            onClick={() => onItemClick?.(index)}
          />
        ))}
      </div>
    </section>
  );
};
