import SelectTokenModal from "@/components/Modal/SelectTokenModal";
import SendModal from "@/components/Modal/SendModal";

export const MODAL_IDS = {
  SELECT_TOKEN: "SELECT_TOKEN",
  SEND: "SEND",
} as const;

export type ModalId = keyof typeof MODAL_IDS;

export interface BaseModalProps {
  onClose: () => void;
}

export interface SelectTokenModalProps extends BaseModalProps {}

export interface SendModalProps extends BaseModalProps {}

export type ModalPropsMap = {
  [MODAL_IDS.SELECT_TOKEN]: SelectTokenModalProps;
  [MODAL_IDS.SEND]: SendModalProps;
};

export type ModalProps = ModalPropsMap[keyof ModalPropsMap];

export const modalRegistry = {
  [MODAL_IDS.SELECT_TOKEN]: SelectTokenModal,
  [MODAL_IDS.SEND]: SendModal,
} as const;
