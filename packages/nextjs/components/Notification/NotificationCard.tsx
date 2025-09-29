import { MIDEN_EXPLORER_URL } from "@/services/utils/constant";
import { formatAddress } from "@/services/utils/miden/address";
import { NotificationType } from "@/types/notification";
import React from "react";

export interface NotificationCardProps {
  type: NotificationType;
  title: string;
  subtitle?: string;
  time: string;
  amount?: string;
  tokenAddress?: string;
  tokenName?: string;
  address?: string;
  payee?: string;
  recipientCount?: number;
  isRead?: boolean;
  txId?: string;
  giftOpener?: string;
  onClick?: () => void;
}

const ViewOnExplorer = ({ txId }: { txId: string | undefined }) => {
  if (!txId) return null;

  return (
    <a
      href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2  text-sm border-2 border-primary-divider rounded-lg p-2 w-fit cursor-pointer"
    >
      <span className="text-text-primary">View on Explorer</span>
      <img src="/misc/external-link-icon.svg" alt="send" className="w-4 h-4" />
    </a>
  );
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  subtitle,
  time,
  amount,
  tokenAddress,
  tokenName,
  address,
  payee,
  recipientCount,
  isRead = false,
  txId,
  giftOpener,
  onClick,
}) => {
  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case NotificationType.SEND:
        return <img src="/arrow/thin-arrow-up-right.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.GIFT_SEND:
        return <img src="/arrow/thin-arrow-up-right.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.GIFT_OPEN:
        return <img src="/arrow/thin-arrow-up-right.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.CLAIM:
        return <img src="/arrow/thin-arrow-down-short.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.REFUND:
        return <img src="/arrow/thin-arrow-curved-left.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.BATCH_SEND:
        return <img src="/arrow/thin-double-arrow-up-right.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.WALLET_CREATE:
        return <img src="/notification/wallet.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.REQUEST_PAYMENT:
        return <img src="/notification/request-payment.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.GIFT_CLAIM:
        return <img src="/notification/gift-claim.svg" alt="send" className="w-5 h-5" />;
      default:
        return null;
    }
  };

  // Render content based on notification type
  const renderContent = () => {
    switch (type) {
      case NotificationType.SEND:
        return (
          <div>
            <span className="text-text-primary tracking-[-0.16px] leading-[20px]">
              {title} for{" "}
              <span className="text-[#1e8fff]">
                {amount} {tokenName} ({formatAddress(tokenAddress || "")})
              </span>{" "}
              to {formatAddress(address || "")}
            </span>
            <div className="my-1.5">
              <ViewOnExplorer txId={txId} />
            </div>
          </div>
        );
      case NotificationType.GIFT_SEND:
        return (
          <div>
            <span className="text-text-primary tracking-[-0.16px] leading-[20px]">
              {title} for{" "}
              <span className="text-[#1e8fff]">
                {amount} {tokenName}
              </span>{" "}
            </span>
            <div className="my-1.5">
              <ViewOnExplorer txId={txId} />
            </div>
          </div>
        );
      case NotificationType.GIFT_OPEN:
        return (
          <div>
            <span className="text-text-primary tracking-[-0.16px] leading-[20px]">
              Gift worth{" "}
              <span className="text-primary-blue">
                {amount} {tokenName}
              </span>{" "}
              opened by {formatAddress(giftOpener || "")}
            </span>
            <div className="my-1.5">
              <ViewOnExplorer txId={txId} />
            </div>
          </div>
        );
      case NotificationType.CLAIM:
        return (
          <div>
            <span className="text-text-primary leading-[20px]">
              {title}{" "}
              <span className="text-primary-blue">
                {amount} {tokenName} ({formatAddress(tokenAddress || "")})
              </span>{" "}
            </span>
            <div className="my-1.5">
              <ViewOnExplorer txId={txId} />
            </div>
          </div>
        );
      case NotificationType.REFUND:
        return (
          <div>
            <span className="text-text-primary leading-[20px]">
              {title}{" "}
              <span className="text-primary-blue">
                {amount} {tokenName} ({formatAddress(tokenAddress || "")})
              </span>{" "}
              to your wallet
            </span>
            <div className="my-1.5">
              <ViewOnExplorer txId={txId} />
            </div>
          </div>
        );
      case NotificationType.BATCH_SEND:
        return (
          <span className="text-text-primary leading-[20px]">
            {title}{" "}
            <span className="text-primary-blue">
              {amount} {tokenName} ({formatAddress(tokenAddress || "")})
            </span>{" "}
            in total to <span className="text-white">{recipientCount} accounts</span>
          </span>
        );
      case NotificationType.REQUEST_PAYMENT:
        // Use the address prop which contains the payee from metadata
        const payeeAddress = payee || "";
        const isPayeeAddress = payeeAddress.length > 20; // Assume addresses are longer than names
        const formattedPayee = isPayeeAddress ? formatAddress(payeeAddress) : payeeAddress;

        return (
          <span className="text-text-primary leading-[20px]">
            <span className="text-text-primary">{formattedPayee}</span> has requested you to transfer{" "}
            <span className="text-primary-blue">
              {amount} {tokenName}
            </span>
          </span>
        );
      case NotificationType.WALLET_CREATE:
        return (
          <div className="flex flex-col gap-1 w-full">
            <span className="text-text-primary leading-[20px]">{title}</span>
            {subtitle && <span className="text-text-secondary leading-[20px]">{subtitle}.</span>}
          </div>
        );
      case NotificationType.GIFT_CLAIM:
        return (
          <>
            <span className="text-text-primary leading-[20px]">{title}</span>
            <span className="text-text-secondary leading-[20px]">
              You've successfully claimed{" "}
              <span className="text-primary-blue">
                {amount} {tokenName}.
              </span>
            </span>
          </>
        );
      default:
        return <span className="text-text-primary leading-[20px]">{title}</span>;
    }
  };

  return (
    <div
      className={`bg-background flex items-center justify-between p-4 rounded-xl w-full border-b-2 border-primary-divider cursor-pointer`}
      onClick={onClick}
    >
      <div className={`flex gap-3 items-start ${type === NotificationType.WALLET_CREATE ? "w-[295px]" : "w-[350px]"}`}>
        <div
          className=" rounded-full size-10 relative shrink-0 border-b-2 border-primary-divider"
          style={{
            backgroundColor: "var(--app-background)",
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 overflow-hidden">
            <div className="filter invert-0 brightness-0 saturate-100">{getIcon()}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1 grow text-left leading-none min-w-0">
          {renderContent()}
          <p className="text-text-secondary text-[13px] tracking-[-0.13px] leading-[1.1]">{time}</p>
        </div>
      </div>
      {!isRead && <div className="w-2.5 h-2.5 bg-[#3EE089] rounded-full"></div>}
    </div>
  );
};

export default NotificationCard;
