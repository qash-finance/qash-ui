"use client";
import * as React from "react";

interface NavItemData {
  icon: string;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
}

interface NavSectionData {
  title: string;
  items: NavItemData[];
}

interface NavSectionsProps {
  sections: NavSectionData[];
  onItemClick?: (sectionIndex: number, itemIndex: number) => void;
}

interface NavItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive = false, disabled = false, onClick }) => {
  const baseClasses = "flex gap-1.5 items-center p-2.5 w-full whitespace-nowrap rounded-xl transition-colors";
  const activeClasses = "font-semibold text-white rounded-xl";
  const inactiveClasses = "text-neutral-500 hover:bg-neutral-800";
  const cursorClasses = disabled ? "cursor-not-allowed" : "cursor-pointer";

  const [gifKey, setGifKey] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;

    setGifKey(prev => prev + 1); // force reload
    onClick?.();
  };

  const showActiveStyle = (isActive || hovered) && !disabled;

  return (
    <button
      className={`${baseClasses} ${cursorClasses} ${isActive ? activeClasses : inactiveClasses} focus:outline-none active:border-[#191919]`}
      style={
        showActiveStyle
          ? {
              boxShadow: "inset 0 0 10px #212121",
              background: "linear-gradient(90deg, #2563eb 0%, #181818 60%, #181818 100%)",
            }
          : undefined
      }
      onMouseEnter={() => {
        if (!disabled) {
          setHovered(true);
          setGifKey(prev => prev + 1); // force reload gif on hover
        }
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      type="button"
      disabled={disabled}
    >
      <img
        src={`${icon}?key=${gifKey}`}
        alt=""
        className={`object-contain shrink-0 self-stretch my-auto w-6 aspect-square transition-all`}
      />
      <span
        className={`flex-1 shrink self-stretch my-auto basis-0 text-left ${
          showActiveStyle ? "text-white" : "text-neutral-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export const NavSections: React.FC<NavSectionsProps> = ({ sections, onItemClick }) => {
  return (
    <div>
      {sections.map((section, sectionIdx) => (
        <section className="mt-1.5" key={sectionIdx}>
          <h2 className="text-base leading-none text-neutral-600 mb-1.5">{section.title}</h2>
          <div className="flex gap-1 flex-col w-full leading-relaxed text-neutral-500">
            {section.items.map((item, itemIdx) => (
              <NavItem
                key={itemIdx}
                icon={item.icon}
                label={item.label}
                isActive={item.isActive}
                disabled={item.disabled}
                onClick={() => onItemClick?.(sectionIdx, itemIdx)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
