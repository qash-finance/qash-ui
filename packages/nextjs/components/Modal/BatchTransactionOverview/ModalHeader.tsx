import React from "react";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  icon?: string;
  onBack?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, icon, onBack }) => {
  return (
    <header className="flex justify-between items-center self-stretch pt-2.5 pr-2.5 pb-2 pl-4 border-b border-solid bg-zinc-800 rounded-t-2xl border-b-neutral-900 max-sm:py-2 max-sm:pr-2 max-sm:pl-3">
      <div className="flex gap-1.5 items-center">
        <div
          onClick={onBack}
          className="cursor-pointer flex justify-center items-center p-0.5 w-5 h-5 rounded-md bg-neutral-900"
        >
          <img src={icon} alt="" className="shrink-0 w-4 h-4 grayscale" />
        </div>
        <h1 className="text-base font-medium tracking-tight leading-4 text-white max-md:text-base max-sm:text-sm">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-5">
        <img src="/dark-close-icon.svg" alt="dark-close-icon" className="w-6 h-6 cursor-pointer" onClick={onClose} />
      </div>
    </header>
  );
};
