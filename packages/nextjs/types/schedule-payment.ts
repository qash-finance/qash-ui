import { AssetWithMetadata } from "./faucet";

export enum SchedulePaymentFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum SchedulePaymentStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface CreateSchedulePayment {
  payer: string;
  payee: string;
  amount: string;
  tokens: AssetWithMetadata[];
  message?: string;
  frequency: SchedulePaymentFrequency;
  endDate?: string;
  nextExecutionDate: string;
  maxExecutions?: number;
  transactionIds?: string[];
}

export interface UpdateSchedulePayment {
  status?: SchedulePaymentStatus;
  frequency?: SchedulePaymentFrequency;
  endDate?: string;
  nextExecutionDate?: string;
  maxExecutions?: number;
}

export interface SchedulePaymentQuery {
  status?: SchedulePaymentStatus;
  payer?: string;
  payee?: string;
}

export interface SchedulePayment extends CreateSchedulePayment {
  id: string;
  status: SchedulePaymentStatus;
  createdAt: string;
  updatedAt: string;
  lastExecutionDate?: string;
  executionCount: number;
}
