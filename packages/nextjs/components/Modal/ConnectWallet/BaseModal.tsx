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
  handleCreateClick?: () => void;
  currentStep?: string;
  showCreateButton?: boolean;
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
  showCreateButton = false,
}) => {
  return (
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center bg-app-background/10 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-0">
        <ModalHeader
          title={title}
          onClose={onClose}
          icon={icon}
          actionButtonIcon={actionButtonIcon}
          handleCreateClick={handleCreateClick}
          currentStep={currentStep}
          showCreateButton={showCreateButton}
        />
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
