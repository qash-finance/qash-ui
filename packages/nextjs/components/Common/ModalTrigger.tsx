"use client";
// This component is used to trigger a modal from outside the modal manager
import { forwardRef, useImperativeHandle } from "react";
import { useModal } from "@/contexts/ModalManagerProvider";
import { ModalId } from "@/types/modal";

export interface ModalTriggerRef {
  openModal: (modalId: ModalId) => void;
}

export const ModalTrigger = forwardRef<ModalTriggerRef>((props, ref) => {
  const { openModal } = useModal();

  useImperativeHandle(ref, () => ({
    openModal: (modalId: ModalId) => {
      openModal(modalId);
    },
  }));

  return null; // This component doesn't render anything
});

ModalTrigger.displayName = "ModalTrigger";
