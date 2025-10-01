import React from "react";
import { ActionButton } from "./ActionButton";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  icon?: string;
  onClickIcon?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, icon, onClickIcon }) => {
  return (
    <header className="flex justify-between items-center self-stretch px-3 py-4 bg-background rounded-t-2xl border-2 border-b-0 border-primary-divider">
      <div className="flex gap-3 items-center">
        {icon && <img src={icon} alt="" className="w-5 h-5" onClick={onClickIcon} />}
        <h1 className=" text-text-primary font-bold">{title}</h1>
      </div>
      <div
        className="w-[28px] h-[28px] bg-app-background rounded-lg flex justify-center items-center border-b-2 border-secondary-divider cursor-pointer"
        onClick={onClose}
      >
        <img src="/misc/close-icon.svg" alt="close icon" />
      </div>
    </header>
  );
};
