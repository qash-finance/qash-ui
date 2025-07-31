import React from "react";
import { ModalHeader } from "../Common/ModalHeader";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  actionButtonIcon?: string;
  zIndex?: number;
  children: React.ReactNode;
};

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, icon, zIndex = 950, children }) => {
  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col gap-0">
        <ModalHeader title={title} onClose={onClose} icon={icon} />
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
