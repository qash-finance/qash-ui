import { apiServerWithAuth } from "./index";
import {
	CreateInvoiceDto,
	UpdateInvoiceDto,
	InvoiceQueryDto,
	InvoiceStatsDto,
	InvoiceScheduleResponseDto,
	CreateInvoiceScheduleDto,
	UpdateInvoiceScheduleDto,
} from "@/types/invoice";

// GET: Get all invoices for company with pagination
export const getInvoices = async (query: InvoiceQueryDto) => {
	const params = new URLSearchParams();
	Object.entries(query || {}).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			params.append(key, String(value));
		}
	});
	return apiServerWithAuth.getData<{ invoices: any[]; pagination: any }>(
		`/api/v1/invoice${params.toString() ? `?${params.toString()}` : ""}`
	);
};

// GET: Get invoice statistics
export const getInvoiceStats = async () => {
	return apiServerWithAuth.getData<InvoiceStatsDto>(`/api/v1/invoice/stats`);
};

// GET: Get invoice by invoice uuid
export const getInvoiceByUUID = async (invoiceUUID: string) => {
	return apiServerWithAuth.getData<any>(`/api/v1/invoice/number/${invoiceUUID}`);
};

// GET: Download invoice as PDF (returns Blob)
export const downloadInvoicePdf = async (invoiceUUID: string) => {
	const response = await apiServerWithAuth.get(
		`/api/v1/invoice/${invoiceUUID}/pdf`,
		{ responseType: "blob" }
	);
	return response.data as Blob;
};

// POST: Create a new payroll invoice manually
export const createPayrollInvoice = async (data: CreateInvoiceDto) => {
	return apiServerWithAuth.postData<any>(`/api/v1/invoice`, data);
};

// POST: Generate invoice from payroll
export const generateInvoice = async (payrollId: number) => {
	return apiServerWithAuth.postData<any>(
		`/api/v1/invoice/generate/${payrollId}`
	);
};

// PUT: Update invoice (employee can update their details)
export const updateInvoice = async (
	invoiceUUID: string,
	data: UpdateInvoiceDto
) => {
	return apiServerWithAuth.putData<any>(
		`/api/v1/invoice/${invoiceUUID}`,
		data
	);
};

// PATCH: Send invoice to employee
export const sendInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/${invoiceUUID}/send`
	);
};

// PATCH: Employee reviews invoice
export const reviewInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/${invoiceUUID}/review`
	);
};

// PATCH: Employee confirms invoice
export const confirmInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/${invoiceUUID}/confirm`
	);
};

// PATCH: Cancel invoice
export const cancelInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/${invoiceUUID}/cancel`
	);
};