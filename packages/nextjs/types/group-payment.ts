import { AssetWithMetadata } from "./faucet";

export interface CreateGroupDto {
  name: string;
  members: string[];
}

export interface CreateDefaultGroupDto {
  name: string;
  members?: string[];
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
  members: string[];
  ownerAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberStatus {
  id: number;
  memberAddress: string;
  status: "pending" | "paid" | "denied";
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
  group: Group;
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
