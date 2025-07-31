import React from "react";
import { ModalHeader } from "./ModalHeader";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  actionButtonIcon?: string;
  zIndex?: number;
  children: React.ReactNode;
  onBack?: () => void;
};

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, icon, zIndex = 950, children, onBack }) => {
  return (
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-0 py-1 bg-[#1E1E1E] rounded-2xl">
        <ModalHeader title={title} onClose={onClose} icon={icon} onBack={onBack} />
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
