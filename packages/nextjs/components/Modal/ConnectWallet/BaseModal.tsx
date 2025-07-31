import React from "react";
import { ModalHeader } from "../../ConnectWallet/ModalHeader";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  actionButtonIcon?: string;
  zIndex?: number;
  children: React.ReactNode;
  handleCreateClick?: () => void;
  currentStep?: string;
};

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  actionButtonIcon,
  zIndex = 950,
  children,
  handleCreateClick,
  currentStep,
}) => {
  return (
    <div style={{ zIndex }} className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col gap-0">
        <ModalHeader
          title={title}
          onClose={onClose}
          icon={icon}
          actionButtonIcon={actionButtonIcon}
          handleCreateClick={handleCreateClick}
          currentStep={currentStep}
        />
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
