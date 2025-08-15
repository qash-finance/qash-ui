export enum NotificationType {
  SEND = "SEND",
  CLAIM = "CLAIM",
  REFUND = "REFUND",
  BATCH_SEND = "BATCH_SEND",
  WALLET_CREATE = "WALLET_CREATE",
  REQUEST_PAYMENT = "REQUEST_PAYMENT",
  GIFT_SEND = "GIFT_SEND",
  GIFT_OPEN = "GIFT_OPEN",
  GIFT_CLAIM = "GIFT_CLAIM",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export interface NotificationResponseDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  metadata: Record<string, any> | null;
  actionUrl: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
}

export interface NotificationResponse {
  notifications: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationCardType {
  id: number;
  type: NotificationType;
  title: string;
  subtitle: string;
  time: string;
  amount: string;
  tokenAddress: string;
  tokenName: string;
  address: string;
  payee: string;
  recipientCount: number;
  isRead: boolean;
  transactionId: string;
  giftOpener: string;
}
