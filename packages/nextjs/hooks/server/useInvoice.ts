import { useState, useCallback } from "react";
import {
  getInvoices,
  getInvoiceByUUID,
  sendInvoice,
  reviewInvoice,
  confirmInvoice,
  cancelInvoice,
  downloadInvoicePdf,
  createPayrollInvoice,
  getInvoiceStats,
} from "@/services/api/invoice";
import { CreateInvoiceDto, InvoiceQueryDto } from "@/types/invoice";

export const useInvoice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchInvoices = useCallback(
    async (query: InvoiceQueryDto) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getInvoices(query);
        setIsLoading(false);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch invoices";
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const fetchInvoiceByUUID = useCallback(async (invoiceUUID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getInvoiceByUUID(invoiceUUID);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch invoice";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const fetchInvoiceStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getInvoiceStats();
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch invoice stats";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const sendInvoiceEmail = useCallback(async (invoiceUUID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendInvoice(invoiceUUID);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send invoice";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const reviewInvoiceData = useCallback(async (invoiceUUID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await reviewInvoice(invoiceUUID);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to review invoice";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const confirmInvoiceData = useCallback(async (invoiceUUID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await confirmInvoice(invoiceUUID);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to confirm invoice";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const cancelInvoiceData = useCallback(async (invoiceUUID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cancelInvoice(invoiceUUID);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel invoice";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const createInvoice = useCallback(async (data: CreateInvoiceDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createPayrollInvoice(data);
      setIsLoading(false);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create invoice";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const downloadPdf = useCallback(async (invoiceUUID: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await downloadInvoicePdf(invoiceUUID);
      setIsLoading(false);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download invoice PDF";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    fetchInvoices,
    fetchInvoiceByUUID,
    fetchInvoiceStats,
    sendInvoiceEmail,
    reviewInvoiceData,
    confirmInvoiceData,
    cancelInvoiceData,
    createInvoice,
    downloadPdf,
  };
};
