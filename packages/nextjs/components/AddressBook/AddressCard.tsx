import React from "react";
import { ActionButton } from "../Common/ActionButton";
import { AddressBook } from "@/types/address-book";
import { formatAddress } from "@/services/utils/address";
import { useRouter } from "next/navigation";
import { generateTokenAvatar } from "@/services/utils/tokenAvatar";
import { qashTokenAddress } from "@/services/utils/constant";

interface AddressCardProps {
  addressBook: AddressBook;
}

export const AddressCard = ({ addressBook }: AddressCardProps) => {
  const { name, address, token } = addressBook || {};
  const tokenAvatar = token === qashTokenAddress ? "/q3x-icon.svg" : generateTokenAvatar(token || "");
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 w-[250px] bg-[#292929] rounded-xl p-2 overflow-hidden">
      <div className="flex flex-row gap-2 items-center">
        <img src="/default-avatar-icon.png" alt="folder" className="w-12 h-12 rounded-xl" />
        <div className="flex flex-col gap-1">
          <span className="text-base leading-5 text-white">{name}</span>
          <span className="text-sm leading-4 text-[#BDBDBD] max-w-full overflow-hidden text-ellipsis whitespace-nowrap ">
            {formatAddress(address)}
          </span>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <ActionButton
          text="Send"
          className="w-full"
          onClick={() => router.push(`/send?recipient=${address}&name=${encodeURIComponent(name)}`)}
        />
        <img src={tokenAvatar} alt="token" className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
};
