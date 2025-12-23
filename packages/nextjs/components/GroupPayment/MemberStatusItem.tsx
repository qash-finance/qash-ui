"use client";
import * as React from "react";
import { MemberStatus, MemberStatusEnum } from "@/types/group-payment";
import { useGetAddressBooks } from "@/services/api/address-book";

interface MemberStatusItemProps {
  memberStatus: MemberStatus;
  amount: number;
  tokenSymbol: string;
  isQuickShare: boolean;
}

/**
 * Display Name Priority Order:
 * 1. Address book name (if the member's address exists in address book)
 * 2. For quick share groups: show "-" until payment is made, then show address book name/address
 * 3. Member name (if available), otherwise formatted address
 */

export const MemberStatusItem: React.FC<MemberStatusItemProps> = ({
  memberStatus,
  amount,
  tokenSymbol,
  isQuickShare,
}) => {
  const { data: addressBooks } = useGetAddressBooks();

  const getStatusStyles = (status: MemberStatusEnum) => {
    switch (status) {
      case MemberStatusEnum.PAID:
        return "text-[#6CFF85] bg-[#304B36] bg-opacity-20";
      case MemberStatusEnum.DENIED:
        return "text-white bg-red-500 bg-opacity-20";
      case MemberStatusEnum.PENDING:
        return "text-white bg-[#4D4D4D] bg-opacity-20";
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Get display name with clear priority order
  const getDisplayName = (): string => {
    // Priority 1: Address book name (if available)
    if (addressBooks) {
      for (const category of addressBooks) {
        const foundAddress = (category as any).addressBooks?.find(
          (addr: any) => addr.address === memberStatus.memberAddress,
        );
        if (foundAddress) {
          return foundAddress.name;
        }
      }
    }

    // Priority 2: Member name (for quick share groups, only show after payment)
    if (isQuickShare) {
      switch (memberStatus.status) {
        case MemberStatusEnum.PAID:
          return formatAddress(memberStatus.memberAddress);
        default:
          return "-";
      }
    }

    // Priority 3: Use member name if available, otherwise format the address
    return memberStatus.memberName || formatAddress(memberStatus.memberAddress);
  };

  const displayName = getDisplayName();
  const isNamedUser = displayName !== formatAddress(memberStatus.memberAddress) && displayName !== "-";

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
            <span className="self-stretch my-auto text-white">{displayName}</span>
          </div>
        ) : (
          <span className="self-stretch my-auto text-base font-medium text-white">{displayName}</span>
        )}
      </div>

      {/* Right side - Status */}
      <div className="col-span-2 flex items-center justify-end">
        <div
          className={`px-2 py-1 text-xs font-medium tracking-tight rounded-2xl w-[60px] text-center ${getStatusStyles(
            memberStatus.status,
          )}`}
        >
          {memberStatus.status === MemberStatusEnum.PAID
            ? "Paid"
            : memberStatus.status === MemberStatusEnum.DENIED
              ? "Denied"
              : "Pending"}
        </div>
      </div>
    </div>
  );
};
