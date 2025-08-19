import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { blo } from "blo";
import React from "react";

interface TopInteractedAddressesProps {
  address: string;
  points: number;
  rank: number;
  avatar: string;
}

const addresses: TopInteractedAddressesProps[] = [
  { address: "0x097...0fdb7", points: 4789000, rank: 1, avatar: blo(turnBechToHex("0x097...0fdb7")) },
  { address: "0x097...0fdb7", points: 3456000, rank: 2, avatar: blo(turnBechToHex("0x097...0fdb7")) },
  { address: "0x097...0fdb7", points: 1234000, rank: 3, avatar: blo(turnBechToHex("0x097...0fdb7")) },
];

const TopInteractedAddresses = () => {
  return (
    <div
      className="flex flex-col gap-6 h-[250px] items-center pb-2 pt-4 px-2 relative rounded-xl overflow-hidden flex-1"
      style={{
        background: "linear-gradient(180deg, #06ffb4 0%, #04AED9 100%)",
      }}
    >
      <div className="flex flex-col gap-4 flex-1 w-full relative">
        {/* Header */}
        <div className="flex flex-row gap-1 items-center w-full">
          <img src="/wallet-analytics/trophy-icon.gif" alt="trophy" className="w-5 h-5" />
          <span className="capitalize font-medium text-[#292929] text-base">top interacted address</span>
        </div>

        {/* Addresses List */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="bg-white flex flex-col gap-1 items-center justify-center p-2 rounded-[10px] shadow-[0px_0px_0px_1px_#0059ff,0px_1px_3px_0px_rgba(9,65,143,0.2)] w-full h-full">
            <div className="flex items-center justify-center w-full">
              <div className=" w-full">
                {addresses.map((address, index) => (
                  <div key={index} className="flex flex-row gap-3 items-center px-2 py-1.5 rounded-lg w-full">
                    <img src={address.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="font-medium h-5 flex items-center text-[#292929] text-sm tracking-[-0.2px] w-full">
                        <span className="block leading-[20px]">{address.address}</span>
                      </div>
                      <div className="flex flex-row gap-1 items-center">
                        <img src="/wallet-analytics/coin-icon.gif" alt="coin" className="w-4 h-4" />
                        <span className="font-semibold text-[#066eff] text-sm tracking-[-0.2px]">
                          {address.points.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {address.rank === 1 ? (
                      <img src="/wallet-analytics/medal.svg" alt="medal" className="w-7 h-7" />
                    ) : (
                      <div className="font-medium text-[#464646] text-sm tracking-[-0.2px]">#{address.rank}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInteractedAddresses;
