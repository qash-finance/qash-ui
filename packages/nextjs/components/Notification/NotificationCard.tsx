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
  recipientCount?: number;
  isRead?: boolean;
  txId?: string;
  onClick?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  subtitle,
  time,
  amount,
  tokenAddress,
  tokenName,
  address,
  recipientCount,
  isRead = false,
  txId,
  onClick,
}) => {
  // Common styles
  const notificationItemStyles = "bg-[#1e1e1e] flex items-center justify-between px-3 py-4 rounded-xl w-full relative";
  const iconContainerStyles = "bg-[#066eff] rounded-lg size-10 relative shrink-0";
  const iconWrapperStyles = "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 overflow-hidden";
  const contentStyles = "flex flex-col gap-1 grow text-left leading-none min-w-0";
  const titleStyles = "font-['Barlow:Medium',_sans-serif] text-white text-sm tracking-[-0.16px] leading-[20px]";
  const subtitleStyles = "font-['Barlow:Regular',_sans-serif] text-[#dcdcdc] leading-[20px]";
  const timeStyles = "font-['Barlow:Regular',_sans-serif] text-[#989898] text-[13px] tracking-[-0.13px] leading-[1.1]";
  const dotStyles = "size-2.5 shrink-0";

  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case NotificationType.SEND:
        return <img src="/arrow/thin-arrow-up-right.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.CLAIM:
        return <img src="/arrow/thin-arrow-down-short.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.REFUND:
        return <img src="/arrow/thin-arrow-curved-left.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.BATCH_SEND:
        return <img src="/arrow/thin-double-arrow-up-right.svg" alt="send" className="w-6 h-6" />;
      case NotificationType.WALLET_CREATE:
        return <img src="/notification/wallet.svg" alt="send" className="w-6 h-6" />;
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
            <span className={titleStyles}>
              {title}{" "}
              <span className="text-[#1e8fff]">
                {amount} {tokenName} ({formatAddress(tokenAddress || "")})
              </span>{" "}
              to {formatAddress(address || "")}
            </span>
            <div className="my-1.5">
              <a
                href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white text-sm"
              >
                <span>View on explorer</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        );
      case NotificationType.CLAIM:
        return (
          <div>
            <span className={titleStyles}>
              {title}{" "}
              <span className="text-[#1e8fff]">
                {amount} {tokenName} ({formatAddress(tokenAddress || "")})
              </span>{" "}
            </span>
            <div className="my-1.5">
              <a
                href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white text-sm"
              >
                <span>View on explorer</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        );
      case NotificationType.REFUND:
        return (
          <div>
            <span className={titleStyles}>
              {title}{" "}
              <span className="text-[#1e8fff]">
                {amount} {tokenName} ({formatAddress(tokenAddress || "")})
              </span>{" "}
              to your wallet
            </span>
            <div className="my-1.5">
              <a
                href={`${MIDEN_EXPLORER_URL}/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white text-sm"
              >
                <span>View on explorer</span>
                <svg
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        );
      case NotificationType.BATCH_SEND:
        return (
          <span className={titleStyles}>
            {title}{" "}
            <span className="text-[#1e8fff]">
              {amount} {tokenName} ({formatAddress(tokenAddress || "")})
            </span>{" "}
            in total to <span className="text-white">{recipientCount} accounts</span>
          </span>
        );
      case NotificationType.WALLET_CREATE:
        return (
          <div className="flex flex-col gap-1 w-full text-sm tracking-[-0.16px]">
            <span className="font-['Barlow:Medium',_sans-serif] text-white leading-[20px]">{title}</span>
            {subtitle && <span className={subtitleStyles}>{subtitle}</span>}
          </div>
        );
      default:
        return <span className={titleStyles}>{title}</span>;
    }
  };

  return (
    <div
      className={`${notificationItemStyles} ${onClick ? "cursor-pointer hover:bg-[#292929] transition-colors duration-200" : ""}`}
      onClick={onClick}
    >
      <div className="absolute inset-0 border-b border-[#3d3d3d] rounded-xl pointer-events-none" />
      <div className={`flex gap-3 items-start ${type === NotificationType.WALLET_CREATE ? "w-[295px]" : "w-[350px]"}`}>
        <div className={iconContainerStyles}>
          <div className={iconWrapperStyles}>{getIcon()}</div>
        </div>
        <div className={contentStyles}>
          {renderContent()}
          <p className={timeStyles}>{time}</p>
        </div>
      </div>
      {!isRead && (
        <div className={dotStyles}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="5" r="5" fill="#83CFFF" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
