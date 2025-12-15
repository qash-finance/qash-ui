// Types and DTOs for Bill API (frontend, mirrors backend DTOs)
// Keep these lightweight interfaces for use in the Next.js app

import { InvoiceModel } from "./invoice";
import { CompanyInfo } from "./company";

export const BillStatusEnum = {
	PENDING: 'PENDING',
	PAID: 'PAID',
	OVERDUE: 'OVERDUE',
	CANCELLED: 'CANCELLED',
} as const;

export type BillStatusEnum = typeof BillStatusEnum[keyof typeof BillStatusEnum];

export interface BillModel {
	id: number;
	uuid: string;
	createdAt: string;
	updatedAt: string;
	companyId?: number;
	invoiceId?: number;
	status: BillStatusEnum;
	paidAt?: string | null;
	transactionHash?: string | null;
	metadata?: Record<string, any>;
	invoice?: InvoiceModel;
	company?: CompanyInfo;
}

export interface BillQueryDto {
	page?: number;
	limit?: number;
	status?: BillStatusEnum;
	groupId?: number;
	search?: string;
}

export interface BillStatsDto {
	totalBills: number;
	totalPending: number;
	totalPaid: number;
	totalOverdue: number;
	totalAmount: string;
	pendingAmount: string;
	paidAmount: string;
	overdueAmount: string;
}

export interface PayBillsDto {
	billUUIDs: string[];
	transactionHash?: string;
}

export interface BillTimelineDto {
	event: string;
	timestamp: string; // ISO date string
	metadata?: Record<string, any>;
}

export interface BatchPaymentResultDto {
	totalAmount: string;
}

export interface DeleteBillResponseDto {
	message?: string;
}

