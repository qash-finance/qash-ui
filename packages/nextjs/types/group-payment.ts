import { AssetWithMetadata } from "./faucet";

export enum MemberStatusEnum {
  PENDING = "PENDING",
  PAID = "PAID",
  DENIED = "DENIED",
}

export interface CreateGroupDto {
  name: string;
  members: {
    address: string;
    name: string;
  }[];
}

export interface CreateDefaultGroupDto {
  name: string;
  members?: {
    address: string;
    name?: string;
  }[];
}

export interface CreateGroupPaymentDto {
  tokens: AssetWithMetadata[];
  amount: string;
  perMember: number;
  groupId: number;
}

export interface Group {
  id: number;
  name: string;
  members: {
    address: string;
    name: string;
  }[];
  ownerAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberStatus {
  id: number;
  memberAddress: string;
  memberName: string;
  status: MemberStatusEnum;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupPayment {
  id: number;
  groupId: number;
  tokens: AssetWithMetadata[];
  amount: string;
  perMember: number;
  linkCode: string;
  status: "pending" | "completed";
  ownerAddress: string;
  createdAt: string;
  updatedAt: string;
  group: Group;
  memberStatuses: MemberStatus[];
}

export interface GroupPaymentsResponse {
  [date: string]: GroupPayment[];
}

export interface PaymentByLinkResponse {
  id: number;
  groupId: number;
  groupPaymentGroup: Group;
  tokens: AssetWithMetadata[];
  amount: string;
  perMember: number;
  linkCode: string;
  status: "pending" | "completed";
  ownerAddress: string;
  memberStatuses: MemberStatus[];
  totalMembers: number;
  paidMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickSharePaymentDto {
  tokens: AssetWithMetadata[];
  amount: string;
  memberCount: number;
}

export interface UpdateQuickShareMemberDto {
  userAddress: string;
}
