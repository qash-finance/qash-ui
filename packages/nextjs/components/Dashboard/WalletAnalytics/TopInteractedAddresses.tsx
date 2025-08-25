import { useModal } from "@/contexts/ModalManagerProvider";
import { useTopInteractedWallets } from "@/services/api/transaction";
import { formatAddress } from "@/services/utils/miden/address";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { AccountTransactionModalProps, MODAL_IDS } from "@/types/modal";
import { blo } from "blo";
import React from "react";

interface TopInteractedAddressesProps {
  walletAddress: string;
  accumulatedAmount: number;
  rank: number;
  transactionCount: number;
}

const TopInteractedAddresses = () => {
  const { data: topInteractedWallets } = useTopInteractedWallets();

  // Use actual data if available, otherwise show empty state
  const addresses = topInteractedWallets || [];

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
          <div className="bg-white flex flex-col gap-1 items-start p-2 rounded-[10px] shadow-[0px_0px_0px_1px_#0059ff,0px_1px_3px_0px_rgba(9,65,143,0.2)] w-full h-full">
            {addresses.length > 0 ? (
              addresses.map((address, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-3 items-center px-2 py-1.5 rounded-lg w-full cursor-pointer"
                >
                  <img src={blo(turnBechToHex(address.walletAddress))} alt="avatar" className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <div className="font-medium h-5 flex items-center text-[#292929] text-sm tracking-[-0.2px] w-full">
                      <span className="block leading-[20px]">{formatAddress(address.walletAddress)}</span>
                    </div>
                    <div className="flex flex-row gap-1 items-center">
                      <img src="/wallet-analytics/coin-icon.gif" alt="coin" className="w-4 h-4" />
                      <span className="font-semibold text-[#066eff] text-sm tracking-[-0.2px]">
                        {address.accumulatedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {address.rank === 1 ? (
                    <img src="/wallet-analytics/medal.svg" alt="medal" className="w-7 h-7" />
                  ) : (
                    <div className="font-medium text-[#464646] text-sm tracking-[-0.2px]">#{address.rank}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-black text-center w-full">
                <span>No top interacted addresses found!</span>
                <span>Can you be the first?</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopInteractedAddresses;
