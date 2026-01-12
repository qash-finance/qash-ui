"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BaseContainer } from "../Common/BaseContainer";
import { Table } from "../Common/Table";
import { TabContainer } from "../Common/TabContainer";
import { Badge, BadgeStatus } from "../Common/Badge";
import { useTitle } from "@/contexts/TitleProvider";
import { useRouter } from "next/navigation";
import { useGetPayrollDetails } from "@/services/api/payroll";
import toast from "react-hot-toast";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { CategoryShapeEnum } from "@/types/employee";
import { InvoiceStatusEnum } from "@/types/invoice";
import { useModal } from "@/contexts/ModalManagerProvider";
import { InvoiceModalProps } from "@/types/modal";
import { useInvoice } from "@/hooks/server/useInvoice";

const labelStyles = "py-1 text-base font-medium text-text-secondary";

const PayrollDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();
  const { openModal } = useModal();

  const payrollId = parseInt(searchParams.get("id") || "0", 10);
  const { data: payrollData, isLoading, error } = useGetPayrollDetails(payrollId);
  const { data: groups } = useGetAllEmployeeGroups();
  const { fetchInvoiceByUUID } = useInvoice();

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter invoices based on active tab
  const getFilteredInvoices = () => {
    if (!payrollData?.invoices) return [];

    const invoices = payrollData.invoices;

    switch (activeTab) {
      case "awaiting":
        return invoices.filter(invoice => invoice.status === "SENT");
      case "paid":
        return invoices.filter(invoice => invoice.status === "PAID");
      case "all":
      default:
        return invoices;
    }
  };

  // Handle row click to open invoice modal
  const handleRowClick = async (_: Record<string, any>, index: number) => {
    const invoices = getFilteredInvoices();
    const invoiceIncomplete = invoices[index];

    const invoice = await fetchInvoiceByUUID(invoiceIncomplete.uuid);
    console.log("🚀 ~ handleRowClick ~ invoice:", invoice);
    if (invoice && payrollData) {
      //@ts-ignore
      const company = `${payrollData.company.companyName} ${payrollData.company.companyType} `;
      const subtotal = typeof invoice.subtotal === "string" ? parseFloat(invoice.subtotal) : invoice.subtotal || 0;
      const total = typeof invoice.total === "string" ? parseFloat(invoice.total) : invoice.total || 0;

      openModal<InvoiceModalProps>("INVOICE_MODAL", {
        invoice: {
          invoiceNumber: invoice.invoiceNumber || "",
          from: {
            name: invoice.fromDetails?.name || payrollData.employee.name || "",
            company: company,
            address: invoice.fromDetails?.address || "",
            email: invoice.fromDetails?.email || payrollData.employee.email || "",
          },
          billTo: {
            name: invoice.toDetails?.companyName || "",
            company: company,
            address: [
              invoice.toDetails?.address1,
              invoice.toDetails?.address2,
              invoice.toDetails?.city,
              invoice.toDetails?.country,
            ]
              .filter(Boolean)
              .join(", "),
            email: invoice.toDetails?.email || "",
          },
          date: invoice.createdAt,
          dueDate: invoice.dueDate || "",
          network: payrollData.network.name || "",
          paymentToken: payrollData.token,
          currency: invoice.currency || "",
          items: invoice.items.map((item: any) => {
            return {
              name: item?.description || "",
              rate: item?.unitPrice || 0,
              qty: item?.quantity || 0,
              amount: item?.total || 0,
            };
          }),
          subtotal,
          tax: 0,
          total,
          walletAddress: payrollData.employee.walletAddress || "",
          amountDue: total.toString(),
        },
      });
    }
  };

  useEffect(() => {
    const handleBack = () => {
      router.back();
    };

    if (payrollData?.employee) {
      setTitle(
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Payroll /</span>
          <span className="text-text-primary">{payrollData.employee.name}'s payroll</span>
        </div>,
      );
    }
    setShowBackArrow(true);
    setOnBackClick(() => handleBack);

    return () => {
      // clean up when component unmounts
      setOnBackClick(undefined);
      setShowBackArrow(false);
    };
  }, [router, payrollData]);

  if (isLoading) {
    return (
      <div className="p-5 flex flex-col items-center justify-center w-full h-full">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !payrollData) {
    return (
      <div className="p-5 flex flex-col items-center justify-center w-full h-full">
        <p className="text-red-500">Failed to load payroll details</p>
      </div>
    );
  }

  // Transform invoices to table data format
  const paymentHistoryData = getFilteredInvoices().map(invoice => ({
    "Creation date": new Date(invoice.createdAt).toLocaleDateString(),
    Invoice: `${invoice.invoiceNumber}`,
    Name: invoice.fromDetails?.name || payrollData.employee.name,
    Amount: (
      <div className="flex items-center gap-2 justify-center">
        <span>{invoice.total}</span>
        <img
          alt={invoice.paymentToken?.symbol}
          className="w-4"
          src={`/token/${invoice.paymentToken?.symbol?.toLowerCase()}.svg`}
        />
      </div>
    ),
    "Due Date": new Date(invoice.dueDate ?? "").toLocaleDateString(),
    Status: (
      <div className="w-full flex justify-center items-center">
        <Badge
          text={invoice.status}
          status={
            invoice?.status === InvoiceStatusEnum?.CANCELLED
              ? BadgeStatus.FAIL
              : invoice?.status === InvoiceStatusEnum.PAID
                ? BadgeStatus.SUCCESS
                : BadgeStatus.AWAITING
          }
          className="px-5"
        />
      </div>
    ),
  }));

  const renderHeader = () => {
    switch (activeTab) {
      case "all":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-2xl font-medium leading-none">Overview</span>
            <span className="text-text-secondary text-[14px] font-medium leading-none">
              Manage all the invoices you received from vendors
            </span>
          </div>
        );
      case "awaiting":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-2xl font-medium leading-none">Pending bills</span>
            <span className="text-text-secondary text-[14px] font-medium leading-none">
              Waiting for vendor to review and confirm their invoices.
            </span>
          </div>
        );
      case "paid":
        return (
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-2xl font-medium leading-none">Paid bills</span>
            <span className="text-text-secondary text-[14px] font-medium leading-none">
              All bills that have been fully paid.
            </span>
          </div>
        );
      default:
        return "Payments";
    }
  };

  return (
    <div className="p-5 flex flex-col items-start justify-start w-full h-full gap-2">
      <span className="font-bold text-3xl mb-4">{payrollData.employee.name}</span>
      <div className="flex gap-3 items-start w-full">
        {/* Employee Information Card */}
        <div className="flex-1 border border-primary-divider rounded-2xl px-4 py-3 flex gap-3 items-center">
          {/* Labels Column */}
          <div className="flex flex-col gap-1 w-[99px]">
            <div className={labelStyles}>Name</div>
            <div className={labelStyles}>Email</div>
            <div className={labelStyles}>Network</div>
            <div className={labelStyles}>Token</div>
            <div className={labelStyles}>Address</div>
          </div>

          {/* Values Column */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="py-1 text-base font-medium text-text-primary">{payrollData.employee.name}</div>
            <div className="py-1 text-base font-medium text-primary-blue">{payrollData.employee.email}</div>
            <div className=" py-1 flex items-center gap-2">
              <img
                className="w-5"
                alt={payrollData.network.name}
                src={`/chain/${payrollData.network.name.toLowerCase().replace(" ", "-")}.svg`}
              />
              <span className="text-base font-medium text-text-primary">
                {payrollData.network.name.charAt(0).toUpperCase() + payrollData.network.name.slice(1)}
              </span>
            </div>
            <div className=" py-1 flex items-center gap-2">
              <img
                alt={payrollData.token.symbol}
                className="w-5 h-5"
                src={`/token/${payrollData.token.symbol.toLowerCase()}.svg`}
              />
              <span className="text-base font-medium text-text-primary">{payrollData.token.symbol}</span>
            </div>
            <div className=" py-1 flex items-center gap-2 justify-start">
              <span className="text-base font-medium text-text-primary">{payrollData.employee.walletAddress}</span>
              <img
                alt="Copy"
                className="w-5 h-5 cursor-pointer"
                src="/misc/copy-icon.svg"
                onClick={async () => {
                  await navigator.clipboard.writeText(payrollData.employee.walletAddress);
                  toast.success("Address copied to clipboard");
                }}
              />
            </div>
          </div>
        </div>

        {/* Contract Information Card */}
        <div className="flex-1 border border-primary-divider rounded-2xl px-4 py-3 flex gap-3 items-center">
          {/* Labels Column */}
          <div className="flex flex-col gap-1 w-[99px]">
            <div className={labelStyles}>Created on</div>
            <div className={labelStyles}>Contract term</div>
            <div className={labelStyles}>Amount</div>
            <div className={labelStyles}>Payday</div>
            <div className={labelStyles}>Group</div>
          </div>

          {/* Values Column */}
          <div className="flex-1 flex flex-col gap-1">
            <div className=" py-1 text-base font-medium text-text-primary">
              {new Date(payrollData.createdAt).toLocaleString()}
            </div>
            <div className=" py-1 text-base font-medium text-text-primary">
              {`${new Date(payrollData.joiningDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} - ${new Date(payrollData.payEndDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`}
            </div>
            <div className=" py-1 flex items-center gap-1">
              <img
                alt={payrollData.token.symbol}
                className="w-5"
                src={`/token/${payrollData.token.symbol.toLowerCase()}.svg`}
              />
              <span className="text-base font-medium text-text-primary">
                {payrollData.amount} {payrollData.token.symbol} / month
              </span>
            </div>
            <div className=" py-1 text-base font-medium text-text-primary">{payrollData.paydayDay}th every month</div>
            <div className="flex justify-start items-center">
              <CategoryBadge
                shape={
                  groups?.find(cat => cat.id === payrollData?.employee?.groupId)?.shape || CategoryShapeEnum.CIRCLE
                }
                color={groups?.find(cat => cat.id === payrollData?.employee?.groupId)?.color || "#35ADE9"}
                name={groups?.find(cat => cat.id === payrollData?.employee?.groupId)?.name || "-"}
              />
            </div>
          </div>
        </div>
      </div>

      <BaseContainer
        header={
          <div className="flex w-full justify-between items-center py-3 px-5">
            <div className="flex flex-col gap-1">
              <TabContainer
                tabs={[
                  { id: "all", label: "All" },
                  { id: "awaiting", label: "Awaiting" },
                  { id: "paid", label: "Paid" },
                ]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        }
        childrenClassName="p-5 gap-5"
        containerClassName="w-full h-full bg-[#F6F6F6]"
      >
        <div className="flex w-full justify-between items-center">
          {renderHeader()}

          {/* Filter Button */}
          <div className="flex items-center gap-2">
            {/* TODO: IMPLEMENT SORT AND FILTER */}
            {/* <SecondaryButton
              text="Sort"
              icon="/misc/sort-icon.svg"
              onClick={() => console.log("Sort button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            />
            <SecondaryButton
              text="Filter"
              icon="/wallet-analytics/setting-icon.gif"
              onClick={() => console.log("Filter button clicked")}
              iconPosition="left"
              variant="light"
              buttonClassName="px-2"
            /> */}
          </div>
        </div>
        <Table
          headers={["Creation date", "Invoice", "Name", "Amount", "Due Date", "Status"]}
          data={paymentHistoryData}
          className="w-full"
          rowClassName="py-5"
          headerClassName="py-3"
          showPagination={true}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowClick={handleRowClick}
        />
      </BaseContainer>
    </div>
  );
};

export default PayrollDetail;
