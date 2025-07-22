import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import React from "react";

interface SelectTokenInputProps {
  selectedToken: string;
  onTokenSelect: (token: string) => void;
}

export const SelectTokenInput: React.FC<SelectTokenInputProps> = ({ selectedToken, onTokenSelect }) => {
  const { openModal } = useModal();
  return (
    <div className="flex gap-5 justify-between py-0.5 pr-0.5 pl-2 rounded-[10px] bg-neutral-900 text-sm font-medium leading-none">
      <input
        type="text"
        readOnly
        value={selectedToken}
        onChange={e => onTokenSelect(e.target.value)}
        placeholder="0.00"
        className="bg-transparent text-white outline-none w-20"
      />
      <button className="flex flex-col justify-center py-1 px-2 rounded-[10px] bg-zinc-800 hover:bg-zinc-700 transition-colors outline-none">
        <div
          className="flex gap-1 items-center cursor-pointer"
          onClick={() => {
            openModal(MODAL_IDS.SELECT_TOKEN);
          }}
        >
          <img src="/token/usdt.svg" alt="Token" className="w-5 h-5" />
          <span className="text-white">{selectedToken}</span>
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
