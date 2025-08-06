"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ActionButton } from "../Common/ActionButton";
import { SelectTokenInput } from "../Common/SelectTokenInput";
import { AssetWithMetadata } from "@/types/faucet";
import { MemberStatusItem } from "./MemberStatusItem";
import { MODAL_IDS } from "@/types/modal";
import { useModal } from "@/contexts/ModalManagerProvider";
import {
  QASH_TOKEN_ADDRESS,
  QASH_TOKEN_MAX_SUPPLY,
  QASH_TOKEN_DECIMALS,
  QASH_TOKEN_SYMBOL,
} from "@/services/utils/constant";
import { Group } from "@/types/group-payment";
import { useCreateGroupPayment, useGetGroupPayments } from "@/services/api/group-payment";
import { toast } from "react-hot-toast";

interface GroupPaymentFormData {
  amount?: number;
  numberOfPeople?: number;
}

interface PaymentDetailsProps {
  selectedGroup: Group | null;
  groups: Group[];
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ selectedGroup, groups }) => {
  //*************** Local State ***************
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata>({
    amount: "0",
    faucetId: QASH_TOKEN_ADDRESS,
    metadata: {
      symbol: QASH_TOKEN_SYMBOL,
      decimals: QASH_TOKEN_DECIMALS,
      maxSupply: QASH_TOKEN_MAX_SUPPLY,
    },
  });
  const [generateLink, setGenerateLink] = useState(false);

  //*************** React Hook Form ***************
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GroupPaymentFormData>({
    defaultValues: {
      amount: undefined,
      numberOfPeople: undefined,
    },
  });

  const watchedAmount = watch("amount");
  const watchedNumberOfPeople = watch("numberOfPeople");

  //*************** React Hooks ***************
  const { mutate: createGroupPayment } = useCreateGroupPayment();
  const { data: groupPayments, isLoading: isGroupPaymentsLoading } = useGetGroupPayments(selectedGroup?.id || 0);
  console.log("🚀 ~ PaymentDetails ~ groupPayments:", groupPayments);
  const { openModal } = useModal();

  //*************** Effects ***************
  useEffect(() => {
    if (selectedGroup) {
      setValue("numberOfPeople", selectedGroup.members.length);
    } else {
      setValue("numberOfPeople", undefined);
    }
  }, [selectedGroup, setValue]);

  //*************** Calculations ***************
  const numberOfPeople = selectedGroup ? selectedGroup.members.length : watchedNumberOfPeople;
  const amountPerPerson =
    watchedAmount && numberOfPeople && numberOfPeople > 0 ? (watchedAmount / numberOfPeople).toFixed(2) : "0.00";

  //*************** Handlers ***************
  const onSubmit = (data: GroupPaymentFormData) => {
    if (!selectedGroup) return;
    if (!amountPerPerson) return;
    if (!data.amount) return;

    const { amount } = data;
    const groupId = selectedGroup.id;
    const tokens = [selectedToken];

    createGroupPayment(
      {
        amount: amount.toString(),
        groupId,
        perMember: Number(amountPerPerson),
        tokens,
      },
      {
        onSuccess: () => {
          toast.success("Group payment created successfully");
          setValue("amount", undefined);
        },
        onError: () => {
          toast.error("Failed to create group payment");
        },
      },
    );
  };

  const handleGenerateLink = () => {
    openModal(MODAL_IDS.GROUP_LINK);
  };

  return (
    <div className="flex flex-1 gap-2.5 mt-2.5 rounded-xl h-full max-md:max-w-full">
      {/* Left Panel - Payment Details */}
      <div className="flex flex-col p-2 rounded-xl bg-zinc-900 flex-1 min-w-60">
        {/* Header */}
        <div className="flex gap-5 justify-between items-center px-3.5 py-2 w-full text-white bg-[#2D2D2D] rounded-t-xl">
          <span className="text-base leading-none">{selectedGroup ? "Group sharing" : "Quick sharing"}</span>
          <SelectTokenInput selectedToken={selectedToken} onTokenSelect={setSelectedToken} />
        </div>
        {/* Main Payment Display */}
        <div
          className=" flex-1 w-full rounded-b-xl bg-zinc-800 flex flex-col justify-center items-center"
          style={{
            backgroundImage: "url('/group-payment/input-background.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Amount Display */}
          <div className="flex flex-col justify-center items-center w-full text-center">
            <input
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be greater than 0" },
                max: { value: 999999999, message: "Amount is too large" },
              })}
              type="number"
              inputMode="decimal"
              step="0.000000000000000001"
              placeholder="0.00"
              autoComplete="off"
              className="text-white text-5xl font-medium leading-none bg-transparent border-none text-center w-full focus:outline-none"
              onKeyDown={e => {
                if (e.key === "-" || e.key === "+" || e.key === "=") e.preventDefault();
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
            />
            {errors.amount && <div className="text-red-500 text-sm mt-2 text-center">{errors.amount.message}</div>}
          </div>
        </div>

        {/* Group Info Card */}
        <div className="flex items-center gap-2.5 py-2.5 px-3 mt-1 w-full text-base leading-none text-white rounded-xl bg-zinc-800">
          {selectedGroup ? (
            <>
              <img
                className="rounded-full w-10 h-10"
                src="/group-payment/default-group-payment-avatar.svg"
                alt="Group icon"
              />
              <div className="flex-1">
                <span className="text-white ">{selectedGroup.name}</span>
              </div>
              <span className="text-right text-white text-lg">{selectedGroup.members.length}</span>
            </>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <img
                  className="rounded-full w-10 h-10"
                  src="/group-payment/default-group-payment-avatar.svg"
                  alt="Group icon"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-white">Members sharing</span>
                  <span className="text-[#656565]">Number of people to split the bill.</span>
                </div>
                {/* Input number of people */}
                <div className="bg-white box-border content-stretch flex flex-row gap-2 items-center justify-center px-[9px] py-1.5 relative rounded-lg">
                  <input
                    {...register("numberOfPeople", {
                      required: "Number of people is required",
                      min: { value: 2, message: "Must be at least 2 people" },
                      max: { value: 999, message: "Cannot exceed 999 people" },
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="2"
                    className="flex flex-col text-[#066eff] text-[16px] text-center text-nowrap tracking-[-0.48px] bg-transparent border-none focus:outline-none w-15"
                    min="1"
                    max="999"
                    onKeyDown={e => {
                      if (
                        e.key === "-" ||
                        e.key === "+" ||
                        e.key === "=" ||
                        e.key === "." ||
                        e.key === "e" ||
                        e.key === "E"
                      )
                        e.preventDefault();
                    }}
                  />
                </div>
              </div>

              {errors.numberOfPeople && (
                <div className="text-red-500 text-right text-sm">{errors.numberOfPeople.message}</div>
              )}
            </div>
          )}
        </div>

        {/* Payment Per Person Card */}
        <div className="flex items-center gap-2.5 py-2.5 px-3 mt-1 w-full text-base leading-none text-white rounded-xl bg-zinc-800">
          <div className="bg-white rounded-full p-1 flex items-center justify-center w-10 h-10">
            <img
              src="/group-payment/group-payment-money-icon.gif"
              className="object-contain w-6 h-6"
              alt="Payment icon"
            />
          </div>
          <span className="flex-1 text-white">Each member pays</span>
          <span className="text-right text-white">
            {amountPerPerson} {selectedToken.metadata.symbol}
          </span>
        </div>

        {/* Link Generation Section */}
        {generateLink ? (
          <div className="pt-2 mt-1 w-full">
            <div className="flex items-center gap-2 px-2 py-2 w-full bg-blue-600 rounded-xl">
              <span className="flex-1 text-base font-medium leading-none text-white truncate">
                https://qash.io/group/1234567890
                {/* Payment Per Person Card */}
              </span>
              <button className="flex items-center gap-1.5 px-2 py-1 text-sm font-semibold tracking-tight leading-tight bg-white rounded-[10px] text-zinc-800 hover:bg-gray-100 transition-colors">
                <span>Copy link</span>
                <img src="copy-icon.svg" className="w-3.5 h-3.5 object-contain" alt="Copy icon" />
              </button>
            </div>
          </div>
        ) : selectedGroup ? (
          <ActionButton
            onClick={handleSubmit(onSubmit)}
            text="Create group payment"
            className="h-[45px] mt-2 text-md"
          />
        ) : (
          <ActionButton onClick={handleSubmit(onSubmit)} text="Generate link" className="h-[45px] mt-2 text-md" />
        )}
      </div>

      {/* Right Panel - Payment Container */}
      <div className="flex-2/6 p-4 rounded-xl bg-zinc-800 min-w-60 h-full overflow-y-auto">
        {/* <TabContainer tabs={groups.map(group => ({ id: group, label: group }))} className="w-full" /> */}

        {/* Header Section */}
        <div className="flex flex-row gap-2">
          <div className="w-full">
            <h2 className="text-lg font-medium leading-none text-white">Paying Progress</h2>
            <p className="mt-2 text-base tracking-tight leading-none text-neutral-500">
              Below is the list of addresses that have paid the split amount.
            </p>
          </div>
          {/* Payment Progress */}
          {!selectedGroup && (
            <div
              className="bg-[#7c7c7c] flex items-center gap-1 px-2 py-1 pr-4 rounded-full w-fit"
              data-name="Payment Progress Container"
            >
              <div className="bg-[#0c0c0c] flex items-center px-2 py-1 rounded-full" data-name="Progress Counter">
                <span className=" text-white text-xs leading-5">0/12</span>
              </div>
              <span className=" font-medium text-white text-[15px] leading-5">Transferred</span>
            </div>
          )}
        </div>

        {/* Transaction Sections */}
        {isGroupPaymentsLoading ? (
          <div className=" w-full h-full p-2 justify-center items-center flex flex-col gap-2">
            <img src="/modal/qr-icon.gif" alt="Loading" className="w-16 h-16 grayscale" />
            <span className="text-[#7C7C7C] text-lg">Loading payments...</span>
          </div>
        ) : groupPayments && Object.keys(groupPayments).length > 0 ? (
          Object.entries(groupPayments).map(([date, payments]) => (
            <section key={date} className="mt-3 w-full bg-[#1E1E1E] p-2 rounded-xl">
              {payments.map(payment => (
                <div key={payment.id}>
                  <div className="flex flex-row justify-between items-center mb-2">
                    <time className="text-white text-base leading-none">
                      {(() => {
                        // Convert UTC time to local time
                        const utcDate = new Date(date + ":00.000Z");
                        return utcDate.toLocaleString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()}
                    </time>
                    <ActionButton
                      text="Copy link"
                      onClick={() => {
                        const link = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pending-request?isGroupPayment=true&groupPaymentId=${payment.id}`;
                        navigator.clipboard.writeText(link);
                        toast.success("Link copied to clipboard");
                      }}
                    />
                  </div>
                  {/* Member Statuses */}
                  {payment.memberStatuses && payment.memberStatuses.length > 0 && (
                    <div className=" space-y-1">
                      {payment.memberStatuses.map(memberStatus => (
                        <MemberStatusItem
                          key={memberStatus.id}
                          memberStatus={memberStatus}
                          amount={payment.perMember}
                          tokenSymbol={payment.tokens[0]?.metadata?.symbol || "QASH"}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))
        ) : (
          <div className=" w-full h-full p-2 justify-center items-center flex flex-col gap-2">
            <img src="/modal/qr-icon.gif" alt="No payment" className="w-16 h-16 grayscale" />
            <span className="text-[#7C7C7C] text-lg">No payment</span>
          </div>
        )}
      </div>
    </div>
  );
};
