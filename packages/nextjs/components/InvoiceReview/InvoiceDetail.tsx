import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { InvoiceData } from "./EmployeeInvoiceReviewContainer";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { updateInvoice } from "@/services/api/invoice";
import { useSearchParams } from "next/navigation";
import { SecondaryButton } from "../Common/SecondaryButton";
import toast from "react-hot-toast";

const metaCard = "flex-1 bg-app-background rounded-2xl p-4 flex flex-col gap-1";
const cardBase = "border border-primary-divider rounded-2xl p-6 flex flex-col";
const titleBlue = "text-xl font-semibold text-primary-blue";
const labelClass = "text-sm text-text-secondary";
const valueClass = "text-base font-medium text-text-primary";
const smallValue = "text-sm text-text-primary";
const tokenRow = "flex items-center gap-2";
const editIconClass = "w-5 h-5 cursor-pointer hover:opacity-80";
const itemRow = "flex flex-row gap-2 justify-between items-start";

const InvoiceDetail = (
  props: InvoiceData & {
    onAddressUpdate?: (address: string) => void;
    onWalletAddressUpdate?: (walletAddress: string) => void;
  },
) => {
  const invoiceData = props;
  const onAddressUpdate = props.onAddressUpdate;
  const onWalletAddressUpdate = props.onWalletAddressUpdate;
  const searchParams = useSearchParams();
  const invoiceUUID = searchParams.get("uuid") || "";
  const { openModal } = useModal();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingWalletAddress, setIsEditingWalletAddress] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      address: invoiceData.from.address || "",
      walletAddress: invoiceData.from.walletAddress || "",
    },
  });

  const onAddressSubmit = async (data: any) => {
    setIsUpdating(true);

    try {
      const updatePayload: any = {
        address: data.address,
        walletAddress: invoiceData.from.walletAddress,
      };

      await updateInvoice(invoiceUUID, updatePayload);
      if (onAddressUpdate) {
        onAddressUpdate(data.address);
      }
      setIsEditingAddress(false);
      setIsUpdating(false);
      toast.success("Address updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update address";
      toast.error(errorMessage);
      setIsUpdating(false);
    }
  };

  const onWalletAddressSubmit = async (data: any) => {
    setIsUpdating(true);

    try {
      const updatePayload: any = {
        address: invoiceData.from.address,
        walletAddress: data.walletAddress,
      };

      await updateInvoice(invoiceUUID, updatePayload);
      if (onWalletAddressUpdate) {
        onWalletAddressUpdate(data.walletAddress);
      }
      setIsEditingWalletAddress(false);
      setIsUpdating(false);
      toast.success("Wallet address updated successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update wallet address";
      toast.error(errorMessage);
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col w-1/2 px-10 py-8 gap-4">
      {/* Title */}
      <h1 className="text-3xl font-semibold text-text-primary">Invoice details</h1>

      {/* Invoice Meta Information */}
      <div className="flex flex-row gap-3 w-full">
        <div className={metaCard}>
          <p className={labelClass}>Invoice number</p>
          <p className="text-base font-semibold text-text-primary">{invoiceData.invoiceNumber}</p>
        </div>
        <div className={metaCard}>
          <p className={labelClass}>Date</p>
          <p className="text-base font-semibold text-text-primary">{invoiceData.date}</p>
        </div>
        <div className={metaCard}>
          <p className={labelClass}>Due Date</p>
          <p className="text-base font-semibold text-text-primary">{invoiceData.dueDate}</p>
        </div>
      </div>

      {/* From Section */}
      <div className={`${cardBase} gap-2`}>
        <h2 className={titleBlue}>From</h2>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Name</p>
            <p className={valueClass}>{invoiceData.from.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Email</p>
            <p className={valueClass}>{invoiceData.from.email}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Company name</p>
            <p className={valueClass}>{invoiceData.from.company}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className={labelClass}>Address</p>
            {isEditingAddress ? (
              <form onSubmit={handleSubmit(onAddressSubmit)} className="flex flex-row w-100 gap-1">
                <input
                  {...register("address", { required: "Address cannot be empty" })}
                  type="text"
                  placeholder="Enter address"
                  className="flex-1 px-3 py-1 leading-none border border-primary-divider rounded-lg bg-[#F5F5F6] text-text-primary placeholder-text-secondary h-fit"
                  disabled={isUpdating}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                <SecondaryButton
                  text="Update"
                  onClick={handleSubmit(onAddressSubmit)}
                  disabled={isUpdating}
                  buttonClassName="w-20 !py-[1px]"
                />
              </form>
            ) : (
              <div className="flex items-center gap-2">
                {(invoiceData.status === "REVIEWED" || invoiceData.status === "SENT") &&
                  (invoiceData.from.address ? (
                    <p className={`${valueClass}`}>{invoiceData.from.address}</p>
                  ) : (
                    <p className={`${valueClass} italic`}>{"No address"}</p>
                  ))}

                <img
                  src="/misc/edit-icon.svg"
                  alt="Edit"
                  className={editIconClass}
                  onClick={() => setIsEditingAddress(true)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex flex-col gap-2">
              <p className={labelClass}>Network</p>
              <div className={tokenRow}>
                <img
                  src={`/chain/${invoiceData.from.network.toLowerCase().replace(" ", "-")}.svg`}
                  alt={invoiceData.from.network}
                  className="w-6 h-6 rounded-full"
                />
                <p className="font-semibold text-text-primary">{invoiceData.from.network}</p>
                {(invoiceData.status === "REVIEWED" || invoiceData.status === "SENT") && (
                  <img
                    src="/misc/edit-icon.svg"
                    alt="Edit"
                    className={editIconClass}
                    onClick={() => openModal(MODAL_IDS.SELECT_NETWORK)}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className={labelClass}>Token</p>
              <div className={tokenRow}>
                <img
                  src={`/token/${invoiceData.from.token.toLowerCase()}.svg`}
                  alt={invoiceData.from.token}
                  className="w-6 h-6 rounded-full"
                />
                <p className="font-semibold text-text-primary">{invoiceData.from.token}</p>
                {(invoiceData.status === "REVIEWED" || invoiceData.status === "SENT") && (
                  <img
                    src="/misc/edit-icon.svg"
                    alt="Edit"
                    className={editIconClass}
                    onClick={() => openModal(MODAL_IDS.SELECT_TOKEN)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <p className={labelClass}>Wallet address</p>
            {isEditingWalletAddress ? (
              <form onSubmit={handleSubmit(onWalletAddressSubmit)} className="flex flex-row w-130 gap-1">
                <input
                  {...register("walletAddress", { required: "Wallet address cannot be empty" })}
                  type="text"
                  placeholder="Enter wallet address"
                  className="flex-1 px-3 py-1 leading-none border border-primary-divider rounded-lg bg-[#F5F5F6] text-text-primary placeholder-text-secondary h-fit"
                  disabled={isUpdating}
                />
                {errors.walletAddress && <p className="text-sm text-red-600">{errors.walletAddress.message}</p>}
                <SecondaryButton
                  text="Update"
                  onClick={handleSubmit(onWalletAddressSubmit)}
                  disabled={isUpdating}
                  buttonClassName="w-20 !py-[1px]"
                />
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-text-primary">{invoiceData.from.walletAddress}</p>
                {(invoiceData.status === "REVIEWED" || invoiceData.status === "SENT") && (
                  <img
                    src="/misc/edit-icon.svg"
                    alt="Edit"
                    className={editIconClass + " flex-shrink-0"}
                    onClick={() => setIsEditingWalletAddress(true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className={`${cardBase} gap-2`}>
        <h2 className={titleBlue}>Bill to</h2>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <p className={labelClass}>Name</p>
            <p className={valueClass}>{invoiceData.billTo.name}</p>
          </div>
          <div className="flex flex-col">
            <p className={labelClass}>Email</p>
            <p className={valueClass}>{invoiceData.billTo.email}</p>
          </div>
          <div className="flex flex-col">
            <p className={labelClass}>Company name</p>
            <p className={valueClass}>{invoiceData.billTo.company}</p>
          </div>
          <div className="flex flex-col">
            <p className={labelClass}>Address</p>
            <p className={valueClass}>{invoiceData.billTo.address}</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className={`${cardBase} gap-6`}>
        <h2 className={titleBlue}>Details</h2>

        {/* Items Table */}
        <div className="flex flex-col gap-4">
          {invoiceData.items.map((item, idx) => (
            <div key={idx} className={itemRow}>
              <div className="flex-1">
                <p className={labelClass}>Item</p>
                <p className={smallValue}>{item.description}</p>
              </div>
              <div className="w-16 text-center">
                <p className={labelClass}>Qty</p>
                <p className={smallValue}>{item.qty}</p>
              </div>
              <div className="w-32 text-right">
                <p className={labelClass}>Price</p>
                <p className={smallValue}>
                  {item.price} {invoiceData.from.token.toUpperCase()}
                </p>
              </div>
              <div className="w-32 text-right">
                <p className={labelClass}>Amount</p>
                <p className={smallValue}>
                  {item.amount} {invoiceData.from.token.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex flex-col gap-3 border-t border-primary-divider pt-4">
        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-text-secondary">Subtotal</p>
          <p className="text-base font-semibold text-text-primary">
            {invoiceData.subtotal.toFixed(2)} {invoiceData.from.token.toUpperCase()}
          </p>
        </div>
        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-text-secondary">Total</p>
          <p className="text-base font-semibold text-text-primary">
            {invoiceData.total.toFixed(2)} {invoiceData.from.token.toUpperCase()}
          </p>
        </div>
        <div className="flex justify-end items-center gap-4">
          <p className="text-sm text-text-secondary">Amount due</p>
          <p className="text-base font-semibold text-text-primary">
            {invoiceData.amountDue.toFixed(2)} {invoiceData.from.token.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
