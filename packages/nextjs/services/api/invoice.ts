import { apiServerWithAuth } from "./index";
import {
	CreateInvoiceDto,
	UpdateInvoiceDto,
	InvoiceQueryDto,
	InvoiceStatsDto,
	InvoiceScheduleResponseDto,
	CreateInvoiceScheduleDto,
	UpdateInvoiceScheduleDto,
	CreateB2BInvoiceDto,
	UpdateB2BInvoiceDto,
	B2BInvoiceQueryDto,
	B2BInvoiceStatsDto,
	CreateB2BScheduleDto,
	UpdateB2BScheduleDto,
	B2BScheduleResponseDto,
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

// =============================================================================
// B2B INVOICE API FUNCTIONS
// =============================================================================

// GET: Get all B2B invoices for company with filters
export const getB2BInvoices = async (query: B2BInvoiceQueryDto) => {
	const params = new URLSearchParams();
	Object.entries(query || {}).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			params.append(key, String(value));
		}
	});
	return apiServerWithAuth.getData<{ invoices: any[]; pagination: any }>(
		`/api/v1/invoice/b2b${params.toString() ? `?${params.toString()}` : ""}`
	);
};

// GET: Get B2B invoice statistics
export const getB2BInvoiceStats = async () => {
	return apiServerWithAuth.getData<B2BInvoiceStatsDto>(
		`/api/v1/invoice/b2b/stats`
	);
};

// GET: Get B2B invoice by UUID
export const getB2BInvoiceByUUID = async (invoiceUUID: string) => {
	return apiServerWithAuth.getData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}`
	);
};

// GET: Get B2B invoice by UUID (public access)
export const getB2BInvoiceByUUIDPublic = async (invoiceUUID: string) => {
	return apiServerWithAuth.getData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}/public`
	);
};

// GET: Download B2B invoice as PDF (returns Blob)
export const downloadB2BInvoicePdf = async (invoiceUUID: string) => {
	const response = await apiServerWithAuth.get(
		`/api/v1/invoice/b2b/${invoiceUUID}/pdf`,
		{ responseType: "blob" }
	);
	return response.data as Blob;
};

// POST: Create a new B2B invoice
export const createB2BInvoice = async (data: CreateB2BInvoiceDto) => {
	return apiServerWithAuth.postData<any>(`/api/v1/invoice/b2b`, data);
};

// PUT: Update B2B invoice (DRAFT only)
export const updateB2BInvoice = async (
	invoiceUUID: string,
	data: UpdateB2BInvoiceDto
) => {
	return apiServerWithAuth.putData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}`,
		data
	);
};

// PATCH: Send B2B invoice to recipient
export const sendB2BInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}/send`
	);
};

// PATCH: Confirm B2B invoice (public access for recipient)
export const confirmB2BInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}/confirm`
	);
};

// PATCH: Mark B2B invoice as paid
export const markB2BInvoiceAsPaid = async (
	invoiceUUID: string,
	transactionHash?: string
) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}/mark-paid`,
		{ transactionHash }
	);
};

// PATCH: Cancel B2B invoice
export const cancelB2BInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.patchData<any>(
		`/api/v1/invoice/b2b/${invoiceUUID}/cancel`
	);
};

// DELETE: Delete B2B invoice (DRAFT only)
export const deleteB2BInvoice = async (invoiceUUID: string) => {
	return apiServerWithAuth.deleteData<void>(
		`/api/v1/invoice/b2b/${invoiceUUID}`
	);
};

// =============================================================================
// B2B INVOICE SCHEDULE API FUNCTIONS
// =============================================================================

// GET: Get all B2B invoice schedules for company
export const getB2BSchedules = async () => {
	return apiServerWithAuth.getData<B2BScheduleResponseDto[]>(
		`/api/v1/invoice/b2b/schedules`
	);
};

// GET: Get B2B invoice schedule by UUID
export const getB2BScheduleByUUID = async (scheduleUUID: string) => {
	return apiServerWithAuth.getData<B2BScheduleResponseDto>(
		`/api/v1/invoice/b2b/schedules/${scheduleUUID}`
	);
};

// POST: Create a new B2B invoice schedule
export const createB2BSchedule = async (data: CreateB2BScheduleDto) => {
	return apiServerWithAuth.postData<B2BScheduleResponseDto>(
		`/api/v1/invoice/b2b/schedules`,
		data
	);
};

// PUT: Update B2B invoice schedule
export const updateB2BSchedule = async (
	scheduleUUID: string,
	data: UpdateB2BScheduleDto
) => {
	return apiServerWithAuth.putData<B2BScheduleResponseDto>(
		`/api/v1/invoice/b2b/schedules/${scheduleUUID}`,
		data
	);
};

// PATCH: Toggle B2B schedule active status
export const toggleB2BSchedule = async (scheduleUUID: string) => {
	return apiServerWithAuth.patchData<B2BScheduleResponseDto>(
		`/api/v1/invoice/b2b/schedules/${scheduleUUID}/toggle`
	);
};

// DELETE: Delete B2B invoice schedule
export const deleteB2BSchedule = async (scheduleUUID: string) => {
	return apiServerWithAuth.deleteData<void>(
		`/api/v1/invoice/b2b/schedules/${scheduleUUID}`
	);
};