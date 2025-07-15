"use client";
import * as React from "react";
import { AccountSidebar } from "./AccountSidebar";
import { AccountDetails } from "./AccountDetails";

export function AccountManagement() {
  return (
    <div className="flex gap-2 items-start self-stretch p-2 rounded-2xl bg-neutral-950 flex-[1_0_0] max-md:flex-col max-md:p-3 max-sm:p-2">
      <AccountSidebar />
      <AccountDetails />
    </div>
  );
}

export default AccountManagement;
