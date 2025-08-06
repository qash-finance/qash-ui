import SelectTokenModal from "@/components/Modal/SelectTokenModal";
import SendModal from "@/components/Modal/SendModal";
import SelectRecipientModal from "@/components/Modal/SelectRecipientModal";
import SetupModulesModal from "@/components/Modal/SetupModulesModal";
import TransactionDetailModal from "@/components/Modal/TransactionDetailModal";
import CreateNewGroupModal from "@/components/Modal/CreateNewGroupModal";
import NewRequestModal from "@/components/Modal/NewRequestModal";
import CreateCustomQRModal from "@/components/Modal/CreateCustomQRModal";
import Portfolio from "@/components/Portfolio/Portfolio";
import OnboardingModal from "@/components/Modal/OnboardingModal";
import ConnectWalletModal from "@/components/Modal/ConnectWallet/ConnectWalletModal";
import TransactionOverviewModal from "@/components/Modal/TransactionOverviewModal";
import Notification from "@/components/Notification/Notification";
import { AssetWithMetadata } from "./faucet";
import ImportWalletModal from "@/components/Modal/ConnectWallet/ImportWallet";
import BatchTransactionOverviewModal from "@/components/Modal/BatchTransactionOverviewModal";
import { BatchTransaction } from "@/services/store/batchTransactions";
import BatchTransactionsModal from "@/components/Modal/BatchTransactionsModal";
import GroupLinkModal from "@/components/Modal/GroupLinkModal";

export const MODAL_IDS = {
  SELECT_TOKEN: "SELECT_TOKEN",
  SEND: "SEND",
  SELECT_RECIPIENT: "SELECT_RECIPIENT",
  MODULES_SETUP: "MODULES_SETUP",
  TRANSACTION_DETAIL: "TRANSACTION_DETAIL",
  CREATE_NEW_GROUP: "CREATE_NEW_GROUP",
  NEW_REQUEST: "NEW_REQUEST",
  CREATE_CUSTOM_QR: "CREATE_CUSTOM_QR",
  PORTFOLIO: "PORTFOLIO",
  ONBOARDING: "ONBOARDING",
  CONNECT_WALLET: "CONNECT_WALLET",
  TRANSACTION_OVERVIEW: "TRANSACTION_OVERVIEW",
  IMPORT_WALLET: "IMPORT_WALLET",
  BATCH_TRANSACTION_OVERVIEW: "BATCH_TRANSACTION_OVERVIEW",
  NOTIFICATION: "NOTIFICATION",
  BATCH_TRANSACTIONS: "BATCH_TRANSACTIONS",
  GROUP_LINK: "GROUP_LINK",
} as const;

export type ModalId = keyof typeof MODAL_IDS;

export interface BaseModalProps {
  onClose: () => void;
  zIndex?: number;
}

export interface SelectTokenModalProps extends BaseModalProps {
  onTokenSelect?: (token: AssetWithMetadata | null) => void;
}

export interface SendModalProps extends BaseModalProps {
  pendingRequestId: number;

  recipient?: string;
  recipientName?: string;
  amount?: string;
  message?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  isGroupPayment?: boolean;
}

export interface SelectRecipientModalProps extends BaseModalProps {
  onSave?: (address: string, name: string) => void;
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

export interface CreateNewGroupModalProps extends BaseModalProps {}

export interface NewRequestModalProps extends BaseModalProps {
  recipient?: string;
}

export interface CreateCustomQRModalProps extends BaseModalProps {}

export interface PortfolioModalProps extends BaseModalProps {}

export interface OnboardingModalProps extends BaseModalProps {}

export interface ConnectWalletModalProps extends BaseModalProps {}

export interface TransactionOverviewModalProps extends BaseModalProps {
  amount?: string;
  accountName?: string;
  accountAddress?: string;
  recipientName?: string;
  recipientAddress?: string;
  transactionType?: string;
  cancellableTime?: string;
  message?: string;
  onConfirm?: () => void;
  tokenAddress?: string;
  tokenSymbol?: string;
}

export interface BatchTransactionOverviewModalProps extends BaseModalProps {
  sender: string;
  transactions: BatchTransaction[];
  onConfirm?: () => Promise<void>;
}

export interface ImportWalletModalProps extends BaseModalProps {}

export interface BatchTransactionsModalProps extends BaseModalProps {}

export interface NotificationModalProps extends BaseModalProps {}

export interface GroupLinkModalProps extends BaseModalProps {}

export type ModalPropsMap = {
  [MODAL_IDS.SELECT_TOKEN]: SelectTokenModalProps;
  [MODAL_IDS.SEND]: SendModalProps;
  [MODAL_IDS.SELECT_RECIPIENT]: SelectRecipientModalProps;
  [MODAL_IDS.MODULES_SETUP]: ModulesSetupProps;
  [MODAL_IDS.TRANSACTION_DETAIL]: TransactionDetailModalProps;
  [MODAL_IDS.CREATE_NEW_GROUP]: CreateNewGroupModalProps;
  [MODAL_IDS.NEW_REQUEST]: NewRequestModalProps;
  [MODAL_IDS.CREATE_CUSTOM_QR]: CreateCustomQRModalProps;
  [MODAL_IDS.PORTFOLIO]: PortfolioModalProps;
  [MODAL_IDS.ONBOARDING]: OnboardingModalProps;
  [MODAL_IDS.CONNECT_WALLET]: ConnectWalletModalProps;
  [MODAL_IDS.TRANSACTION_OVERVIEW]: TransactionOverviewModalProps;
  [MODAL_IDS.IMPORT_WALLET]: ImportWalletModalProps;
  [MODAL_IDS.BATCH_TRANSACTION_OVERVIEW]: BatchTransactionOverviewModalProps;
  [MODAL_IDS.NOTIFICATION]: NotificationModalProps;
  [MODAL_IDS.BATCH_TRANSACTIONS]: BatchTransactionsModalProps;
  [MODAL_IDS.GROUP_LINK]: GroupLinkModalProps;
};

export type ModalProps = ModalPropsMap[keyof ModalPropsMap];

export const modalRegistry = {
  [MODAL_IDS.SELECT_TOKEN]: SelectTokenModal,
  [MODAL_IDS.SEND]: SendModal,
  [MODAL_IDS.SELECT_RECIPIENT]: SelectRecipientModal,
  [MODAL_IDS.MODULES_SETUP]: SetupModulesModal,
  [MODAL_IDS.TRANSACTION_DETAIL]: TransactionDetailModal,
  [MODAL_IDS.CREATE_NEW_GROUP]: CreateNewGroupModal,
  [MODAL_IDS.NEW_REQUEST]: NewRequestModal,
  [MODAL_IDS.CREATE_CUSTOM_QR]: CreateCustomQRModal,
  [MODAL_IDS.PORTFOLIO]: Portfolio,
  [MODAL_IDS.ONBOARDING]: OnboardingModal,
  [MODAL_IDS.CONNECT_WALLET]: ConnectWalletModal,
  [MODAL_IDS.TRANSACTION_OVERVIEW]: TransactionOverviewModal,
  [MODAL_IDS.IMPORT_WALLET]: ImportWalletModal,
  [MODAL_IDS.BATCH_TRANSACTION_OVERVIEW]: BatchTransactionOverviewModal,
  [MODAL_IDS.NOTIFICATION]: Notification,
  [MODAL_IDS.BATCH_TRANSACTIONS]: BatchTransactionsModal,
  [MODAL_IDS.GROUP_LINK]: GroupLinkModal,
} as const;
