import SelectTokenModal from "@/components/Modal/SelectTokenModal";
import SendModal from "@/components/Modal/SendModal";
import SelectRecipientModal from "@/components/Modal/SelectRecipientModal";
import SetupModulesModal from "@/components/Modal/SetupModulesModal";
import TransactionDetailModal from "@/components/Modal/TransactionDetailModal";
import CreateNewGroupModal from "@/components/Modal/CreateNewGroupModal";

export const MODAL_IDS = {
  SELECT_TOKEN: "SELECT_TOKEN",
  SEND: "SEND",
  SELECT_RECIPIENT: "SELECT_RECIPIENT",
  MODULES_SETUP: "MODULES_SETUP",
  TRANSACTION_DETAIL: "TRANSACTION_DETAIL",
  CREATE_NEW_GROUP: "CREATE_NEW_GROUP",
} as const;

export type ModalId = keyof typeof MODAL_IDS;

export interface BaseModalProps {
  onClose: () => void;
}

export interface SelectTokenModalProps extends BaseModalProps {}

export interface SendModalProps extends BaseModalProps {}

export interface SelectRecipientModalProps extends BaseModalProps {
  onSave?: () => void;
}

export interface ModulesSetupProps extends BaseModalProps {
  whitelistingEnabled?: boolean;
  onWhitelistingChange?: (enabled: boolean) => void;
  onRemoveSigner?: (id: number) => void;
  onAddNewAddress?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
}

export interface TransactionDetailModalProps extends BaseModalProps {
  onDeny?: () => void;
  onAccept?: () => void;
  onCopyLink?: () => void;
}

export interface CreateNewGroupModalProps extends BaseModalProps {
  onSave?: () => void;
}

export type ModalPropsMap = {
  [MODAL_IDS.SELECT_TOKEN]: SelectTokenModalProps;
  [MODAL_IDS.SEND]: SendModalProps;
  [MODAL_IDS.SELECT_RECIPIENT]: SelectRecipientModalProps;
  [MODAL_IDS.MODULES_SETUP]: ModulesSetupProps;
  [MODAL_IDS.TRANSACTION_DETAIL]: TransactionDetailModalProps;
  [MODAL_IDS.CREATE_NEW_GROUP]: CreateNewGroupModalProps;
};

export type ModalProps = ModalPropsMap[keyof ModalPropsMap];

export const modalRegistry = {
  [MODAL_IDS.SELECT_TOKEN]: SelectTokenModal,
  [MODAL_IDS.SEND]: SendModal,
  [MODAL_IDS.SELECT_RECIPIENT]: SelectRecipientModal,
  [MODAL_IDS.MODULES_SETUP]: SetupModulesModal,
  [MODAL_IDS.TRANSACTION_DETAIL]: TransactionDetailModal,
  [MODAL_IDS.CREATE_NEW_GROUP]: CreateNewGroupModal,
} as const;
