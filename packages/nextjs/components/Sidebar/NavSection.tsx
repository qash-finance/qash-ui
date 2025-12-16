"use client";
import React, { useState } from "react";
import ComingSoonBadge from "../Common/ComingSoonBadge";

interface NavItemData {
  icon: string;
  filledIcon?: string;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  link?: string;
  hasSubmenu?: boolean;
  submenuType?: string;
}

interface NavSectionsProps {
  sections: NavItemData[];
  onItemClick?: (itemIndex: number) => void;
  onSubmenuClick?: (itemIndex: number) => void;
}

interface NavItemProps {
  icon: string;
  filledIcon?: string;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  hasSubmenu?: boolean;
  onClick?: () => void;
  onSubmenuClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  filledIcon,
  label,
  isActive = false,
  disabled = false,
  hasSubmenu = false,
  onClick,
  onSubmenuClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const baseClasses =
    "flex gap-1.5 items-center h-11 p-2.5 w-full whitespace-nowrap rounded-xl transition-all duration-200 ease-in-out justify-between";
  const cursorClasses = disabled ? "cursor-not-allowed" : "cursor-pointer";

  const handleClick = () => {
    if (disabled) return;

    if (hasSubmenu) {
      onSubmenuClick?.();
    } else {
      onClick?.();
    }
  };

  const showActiveState = isActive || isHovered;
  const shouldShowFilledIcon = showActiveState && filledIcon;

  return (
    <div className="flex flex-row gap-2 w-full">
      <div
        className="self-center transition-all duration-200 ease-in-out"
        style={{
          borderRadius: "0 2px 2px 0",
          background: showActiveState ? "var(--bg-surface-blue-600, #066EFF)" : "transparent",
          width: "4px",
          height: "20px",
          transform: showActiveState ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "center",
        }}
      />
      <button
        className={`${baseClasses} ${cursorClasses} gap-3 focus:outline-none focus:ring-0 focus:border-0 active:outline-none active:ring-0 active:border-0 justify-between flex`}
        style={{
          borderRadius: showActiveState ? "8px" : "12px",
          borderBottom: showActiveState ? "1px solid var(--primary-divider)" : "1px solid transparent",
          background: showActiveState ? "var(--background)" : "transparent",
          transition: "all 200ms ease-in-out",
        }}
        aria-label={label}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
      >
        <>
          <img
            src={shouldShowFilledIcon ? filledIcon : icon}
            alt=""
            className={`object-contain shrink-0 transition-all duration-200 ease-in-out ${!showActiveState ? "w-5 h-5" : "w-6 h-6"}`}
          />
          <span
            className={`flex-1 shrink self-stretch my-auto basis-0 text-left transition-colors duration-200 ease-in-out ${
              showActiveState ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {label}
          </span>
        </>

        {/* {hasSubmenu && (
          <img
            src="/arrow/chevron-right.svg"
            className="w-4 aspect-square transition-all duration-200 ease-in-out"
            alt="filled arrow right icon"
          />
        )} */}
        {disabled && <ComingSoonBadge size="small" />}
      </button>
    </div>
  );
};

export const NavSections: React.FC<NavSectionsProps> = ({ sections, onItemClick, onSubmenuClick }) => {
  return (
    <div className="flex gap-1 flex-col w-full pr-3">
      {sections.map((item, itemIdx) => (
        <NavItem
          key={itemIdx}
          icon={item.icon}
          filledIcon={item.filledIcon}
          label={item.label}
          isActive={item.isActive}
          disabled={item.disabled}
          hasSubmenu={item.hasSubmenu}
          onClick={() => onItemClick?.(itemIdx)}
          onSubmenuClick={() => onSubmenuClick?.(itemIdx)}
        />
      ))}
    </div>
  );
};
