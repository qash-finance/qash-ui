import React, { useEffect, useState } from "react";
import { ModalHeader } from "../Common/ModalHeader";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: string;
  zIndex?: number;
  onClickIcon?: () => void;
  children: React.ReactNode;
};

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, zIndex = 950, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to ensure DOM is ready before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center bg-app-background/60 backdrop-blur-sm"
    >
      <div
        className={`flex flex-col gap-0 transition-all duration-150 ease-out transform ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
