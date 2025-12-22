// Payroll related DTOs and types

import { InvoiceItemDto, InvoiceModel } from "./invoice";

export enum ContractTermEnum {
  PERMANENT = "PERMANENT",
  CONTRACTOR = "CONTRACTOR",
}

export interface NetworkDto {
  name: string;
  chainId: number;
  metadata?: Record<string, any>;
  description?: string;
}

export interface TokenDto {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  metadata?: Record<string, any>;
}

export interface CreatePayrollDto {
  employeeId: number;
  network: NetworkDto;
  token: TokenDto;
  contractTerm: ContractTermEnum;
  payrollCycle: number;
  amount: string;
  payStartDate: string;
  joiningDate: string;
  payEndDate: string;
  description: string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface CreatePayroll {
  employeeId: number;
  network: NetworkDto;
  token: TokenDto;
  contractTerm: ContractTermEnum;
  payrollCycle: number;
  amount: string;
  joiningDate: string;
  payday: string;
  generateDaysBefore: number;
  description: string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePayrollDto {
  description?: string;
  paydayDay?: number;
  network?: NetworkDto;
  token?: TokenDto;
  contractTerm?: ContractTermEnum;
  payrollCycle?: number;
  amount?: string;
  note?: string;
  metadata?: Record<string, any>;
}

export interface PayrollQueryDto {
  page?: number;
  limit?: number;
  employeeId?: number;
  contractTerm?: ContractTermEnum;
  search?: string;
}

export interface PayrollStatsDto {
  totalActive: number;
  totalPaused: number;
  totalCompleted: number;
  totalMonthlyAmount: string;
  dueThisMonth: number;
}

export interface PayrollModel {
  id: number;
  employeeId: number;
  companyId: number;
  network: NetworkDto;
  token: TokenDto;
  contractTerm: ContractTermEnum;
  payrollCycle: number;
  amount: string;
  payStartDate: string;
  joiningDate: string;
  payEndDate: string;
  description?: string;
  employee: {
    id: number;
    name: string;
    walletAddress: string;
    email: string;
    groupId?: number;
    token: {
      address: string;
      symbol: string;
    };
    uuid: string;
    network: NetworkDto;
    order: number;
    companyId: number;
  };
  invoices: InvoiceModel[];
  note?: string;
  metadata?: Record<string, any>;
  status: string;
  createdAt: string;
  updatedAt: string;
  paydayDay: number;
}

export interface PaginatedPayrollsResponseDto {
  payrolls: PayrollModel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PendingInvoiceReviewsDto {
  hasPendingReviews: boolean;
  pendingCount?: number;
  pendingInvoiceUuids?: string[];
}
