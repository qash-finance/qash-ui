"use client";

import React, { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

interface MenuItemProps {
  icon: string;
  label: string;
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  router: ReturnType<typeof useRouter>;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, href, isActive = false, onClick, router }) => {
  const [gifKey, setGifKey] = useState(0);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    setGifKey(prev => prev + 1); // force reload
    onClick?.();
    // Navigate to href using Next.js router (client-side navigation)
    router.push(href);
  };

  const showActiveStyle = isActive || hovered;

  return (
    <button
      className="flex gap-1.5 items-center h-11 p-2.5 w-full whitespace-nowrap cursor-pointer font-semibold text-white rounded-xl focus:outline-none active:border-[#191919]"
      style={
        showActiveStyle
          ? {
              background: "#282828",
            }
          : undefined
      }
      aria-label={label}
      onMouseEnter={() => {
        setHovered(true);
        setGifKey(prev => prev + 1); // force reload gif on hover
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      type="button"
    >
      <img
        src={`${icon}?key=${gifKey}`}
        alt=""
        className={`object-contain shrink-0 w-7 h-7 min-w-[28px] min-h-[28px] transition-all ${
          showActiveStyle ? "" : "grayscale"
        }`}
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
interface DashboardMenuProps {
  // Remove activeSection prop since we'll determine it automatically
}

const DashboardMenu: React.FC<DashboardMenuProps> = () => {
  const pathname = usePathname();
  const router = useRouter();

  // More efficient path extraction - just get the last segment
  const activeSection = useMemo(() => {
    const segments = pathname.split("/");
    const dashboardIndex = segments.indexOf("dashboard");
    return dashboardIndex !== -1 && segments[dashboardIndex + 1] ? segments[dashboardIndex + 1] : "wallet-analytics";
  }, [pathname]);

  const menuItems = useMemo(
    () => [
      {
        icon: "/sidebar/dashboard/wallet-analytics.gif",
        label: "Overview",
        href: "/dashboard/wallet-analytics",
        isActive: activeSection === "wallet-analytics",
      },
      {
        icon: "/sidebar/dashboard/pending-request.gif",
        label: "Payment Request",
        href: "/dashboard/pending-request",
        isActive: activeSection === "pending-request",
      },
      {
        icon: "/sidebar/dashboard/pending-receive.gif",
        label: "Receive",
        href: "/dashboard/pending-receive",
        isActive: activeSection === "pending-receive",
      },
      {
        icon: "/sidebar/dashboard/cancel-payment.gif",
        label: "Cancel Payment",
        href: "/dashboard/cancel-payment",
        isActive: activeSection === "cancel-payment",
      },
      {
        icon: "/sidebar/dashboard/schedule-payment.gif",
        label: "Schedule Payment",
        href: "/dashboard/schedule-payment",
        isActive: activeSection === "schedule-payment",
      },
      // {
      //   icon: "/sidebar/dashboard/stream-receive.gif",
      //   label: "Stream Receive",
      //   href: "/dashboard/stream-receive",
      //   isActive: activeSection === "stream-receive",
      // },
    ],
    [activeSection],
  );

  return (
    <div className="bg-[#1a1a1a] h-screen w-[250px]">
      <div className="px-3.5 pt-[68px] flex flex-col gap-2 justify-center items-start">
        <span className="text-white text-base text-center whitespace-pre leading-none">Dashboard menu</span>
      </div>

      {/* Menu Items */}
      <div className="px-2 mt-5 flex flex-col gap-[5px]">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={item.isActive}
            router={router}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardMenu;
