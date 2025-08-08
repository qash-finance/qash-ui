"use client";
import * as React from "react";
import { MemberStatus } from "@/types/group-payment";
import { useGetAddressBooks } from "@/services/api/address-book";

interface MemberStatusItemProps {
  memberStatus: MemberStatus;
  amount: number;
  tokenSymbol: string;
}

export const MemberStatusItem: React.FC<MemberStatusItemProps> = ({ memberStatus, amount, tokenSymbol }) => {
  const { data: addressBooks } = useGetAddressBooks();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "paid":
        return "text-[#6CFF85] bg-[#304B36] bg-opacity-20";
      case "denied":
        return "text-white bg-red-500 bg-opacity-20";
      case "pending":
        return "text-white bg-[#4D4D4D] bg-opacity-20";
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Find the address name from address book
  const getAddressDisplayName = (address: string) => {
    if (!addressBooks) return formatAddress(address);

    // Search through all categories and address books
    for (const category of addressBooks) {
      const foundAddress = category.addressBooks?.find(addr => addr.address === address);
      if (foundAddress) {
        return foundAddress.name;
      }
    }

    // If not found in address book, return formatted address
    return formatAddress(address);
  };

  const addressName = getAddressDisplayName(memberStatus.memberAddress);
  const isNamedUser = addressName !== formatAddress(memberStatus.memberAddress);

  return (
    <div className="grid grid-cols-12 items-center px-3 py-2 w-full rounded-xl bg-neutral-700 gap-3">
      {/* Left side - Amount with Token Icon */}
      <div className="col-span-1 flex items-center gap-1 text-base font-medium text-white">
        <img src="/token/qash.svg" className="w-6 h-6" alt={tokenSymbol} />
        <span>{amount.toFixed(2)}</span>
      </div>

      {/* Middle - Member Address (longest width) */}
      <div className="col-span-9 flex items-center gap-2">
        <span className="text-sm text-[#787878]">From</span>
        {isNamedUser ? (
          <div className="flex justify-center items-center self-stretch px-3 my-auto text-sm tracking-tight leading-loose text-white rounded-full bg-[#7C7C7C]">
            <span className="self-stretch my-auto text-white">{addressName}</span>
          </div>
        ) : (
          <span className="self-stretch my-auto text-base font-medium text-white">{addressName}</span>
        )}
      </div>

      {/* Right side - Status */}
      <div className="col-span-2 flex items-center justify-end">
        <div
          className={`px-2 py-1 text-xs font-medium tracking-tight rounded-2xl w-[60px] text-center ${getStatusStyles(
            memberStatus.status,
          )}`}
        >
          {memberStatus.status === "paid" ? "Paid" : memberStatus.status === "denied" ? "Denied" : "Pending"}
        </div>
      </div>
    </div>
  );
};
