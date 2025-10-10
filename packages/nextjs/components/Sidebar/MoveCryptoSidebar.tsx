"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MOVE_CRYPTO_SIDEBAR_OFFSET } from "./Sidebar";

interface AccountSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const moveCryptoItems = [
  {
    icon: "/sidebar/send.svg",
    filledIcon: "/sidebar/filled-send.svg",
    label: "Send",
    link: "/move-crypto?tab=send",
    isActive: false,
    disabled: false,
  },
  {
    icon: "/sidebar/swap.svg",
    filledIcon: "/sidebar/filled-swap.svg",
    label: "Swap",
    link: "/move-crypto?tab=swap",
    isActive: false,
    disabled: false,
  },
  {
    icon: "/sidebar/gift.svg",
    filledIcon: "/sidebar/filled-gift.svg",
    label: "Gift",
    link: "/gift",
    isActive: false,
    disabled: false,
  },
  // {
  //   icon: "/sidebar/crypto-ramp.svg",
  //   filledIcon: "/sidebar/filled-crypto-ramp.svg",
  //   label: "Crypto on/off-ramps",
  //   link: "/crypto-ramp",
  //   isActive: false,
  //   disabled: false,
  // },
];

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
    "flex gap-1.5 items-center h-11 p-2.5 w-full whitespace-nowrap rounded-xl transition-all duration-200 ease-in-out";
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
        className={`${baseClasses} ${cursorClasses} gap-3 focus:outline-none focus:ring-0 focus:border-0 active:outline-none active:ring-0 active:border-0`}
        style={{
          borderRadius: showActiveState ? "8px" : "12px",
          borderBottom: showActiveState ? "1px solid var(--primary-divider)" : "1px solid transparent",
          background: showActiveState ? "var(--app-background)" : "transparent",
          transition: "all 200ms ease-in-out",
        }}
        aria-label={label}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
      >
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
        {hasSubmenu && (
          <img
            src="/arrow/chevron-right.svg"
            className="w-4 aspect-square transition-all duration-200 ease-in-out"
            alt="filled arrow right icon"
          />
        )}
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

export default function MoveCryptoSidebar({ isOpen, onClose }: AccountSidebarProps) {
  const [items, setItems] = useState(moveCryptoItems);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update active states based on URL and sidebar state
  useEffect(() => {
    if (!isOpen) {
      setItems(prev => prev.map(item => ({ ...item, isActive: false })));
      return;
    }

    setItems(prev =>
      prev.map(item => {
        let isActive = false;

        if (item.link) {
          // Handle query parameter matching for move-crypto tabs
          if (item.link.includes("move-crypto?tab=")) {
            const currentTab = searchParams.get("tab");
            const itemTab = item.link.split("tab=")[1];
            isActive = pathname === "/move-crypto" && currentTab === itemTab;
          } else {
            // Handle direct path matching for other items
            isActive = pathname === item.link;
          }
        }

        return {
          ...item,
          isActive,
        };
      }),
    );
  }, [isOpen, pathname, searchParams]);

  // Close sidebar when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  const handleItemClick = (itemIndex: number) => {
    // Navigate using the link from the item
    const item = items[itemIndex];
    if (item.link) {
      router.push(item.link);
    }
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
        className="absolute top-0 h-[100%] w-[280px] bg-background z-10 rounded-tr-lg rounded-br-lg p-3 flex flex-col gap-2 transition-all duration-300 ease-in-out"
        style={{
          left: isOpen ? `${MOVE_CRYPTO_SIDEBAR_OFFSET}px` : "-20px",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          pointerEvents: isOpen ? "auto" : "none",
          boxShadow: isOpen ? "50px 0 50px rgba(0,0,0,0.15)" : "none",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mt-13">
          <NavSections sections={items} onItemClick={handleItemClick} />
        </div>
      </div>
    </>
  );
}
