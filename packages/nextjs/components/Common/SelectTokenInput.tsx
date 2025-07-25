import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import React from "react";
import { getTokenAvatar } from "@/services/utils/tokenAvatar";
import { AssetWithMetadata, AnyToken } from "@/types/faucet";

interface SelectTokenInputProps {
  selectedToken: AssetWithMetadata | null;
  onTokenSelect: (token: AssetWithMetadata) => void;
  tokenAddress?: string; // Add token address to generate correct avatar
}

export const SelectTokenInput: React.FC<SelectTokenInputProps> = ({ selectedToken, onTokenSelect, tokenAddress }) => {
  const { openModal } = useModal();
  const token = selectedToken || AnyToken;

  return (
    <div className="flex gap-5 justify-between py-0.5 pr-0.5 pl-2 rounded-[10px] bg-neutral-900 text-sm font-medium leading-none">
      <input
        type="text"
        readOnly
        value={token.amount}
        placeholder="0.00"
        className="bg-transparent text-white outline-none w-20"
      />
      <button
        type="button"
        className="flex flex-col justify-center py-1 px-2 rounded-[10px] bg-zinc-800 hover:bg-zinc-700 transition-colors outline-none"
      >
        <div
          className="flex gap-1 items-center cursor-pointer"
          onClick={() => {
            openModal(MODAL_IDS.SELECT_TOKEN, { onTokenSelect });
          }}
        >
          <img src={getTokenAvatar(token.tokenAddress)} alt={token.metadata.symbol} className="w-5 h-5 rounded-full" />
          <span className="text-white">{token.metadata.symbol}</span>
          <img
            src="/arrow/filled-arrow-down.svg"
            alt="Dropdown arrow"
            className="object-contain shrink-0 aspect-[1.75] fill-white w-[7px]"
          />
        </div>
      </button>
    </div>
  );
};
