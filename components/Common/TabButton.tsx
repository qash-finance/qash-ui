"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface TabButtonProps {
  className?: string;
}

interface TabProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

const Tab: React.FC<TabProps & { href: string }> = ({ children, isActive = false, className = "", href }) => {
  return (
    <Link href={href} passHref>
      <button
        className={`flex relative gap-0.5 justify-center items-center self-stretch py-1.5 rounded-lg flex-[1_0_0] max-md:px-3 max-md:py-2 max-sm:px-2 max-sm:py-1.5 max-sm:min-h-7 ${className} cursor-pointer`}
      >
        <span
          className={`relative text-base tracking-tight leading-5 text-white max-md:text-sm max-md:tracking-tight max-sm:text-xs max-sm:tracking-tight max-sm:leading-3 ${
            isActive ? "font-medium" : "opacity-50"
          } ${isActive && "bg-[#292929] py-0.5 w-45 rounded-lg"}`}
        >
          <span className={`text-base text-white max-sm:text-xs ${isActive ? "font-medium" : ""}`}>{children}</span>
        </span>
      </button>
    </Link>
  );
};

export const TabContainer: React.FC<TabButtonProps> = ({ className = "" }) => {
  const pathname = usePathname();
  return (
    <div
      className={`flex relative shrink-0 gap-1.5 justify-around items-center rounded-xl bg-neutral-950 h-[34px] w-[600px] max-md:p-1 max-md:w-full max-md:h-auto max-md:max-w-[600px] max-sm:p-0.5 max-sm:w-full max-sm:h-auto max-sm:rounded-lg ${className}`}
    >
      <Tab href="/dashboard/pending-recieve" isActive={pathname === "/dashboard/pending-recieve"}>
        Pending Receive
      </Tab>
      <Tab href="/dashboard/pending-request" isActive={pathname === "/dashboard/pending-request"}>
        Pending Request
      </Tab>
      <Tab href="/dashboard/recall-transaction" isActive={pathname === "/dashboard/recall-transaction"}>
        Recall transaction
      </Tab>
    </div>
  );
};

export default TabContainer;
