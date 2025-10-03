import { useModal } from "@/contexts/ModalManagerProvider";
import { AssetWithMetadata } from "@/types/faucet";
import { MODAL_IDS } from "@/types/modal";
import { title } from "process";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PrimaryButton } from "../Common/PrimaryButton";

interface CreatePaymentLinkFormData {
  title: string;
  description: string;
  amount: string;
}

interface FormInputProps {
  label: string;
  placeholder: string;
  type?: string;
  register: any;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const inputContainerClass = "bg-background rounded-xl p-3 border-b-2 border-primary-divider";

const FormInput = ({ label, placeholder, type = "text", register, error, disabled, required }: FormInputProps) => (
  <div className="flex flex-col gap-2">
    <div className="bg-background rounded-xl border-b-2 border-primary-divider">
      <div className="flex flex-col gap-1 px-4 py-2">
        <label className="text-text-secondary text-sm font-medium">{label}</label>
        <input
          {...register}
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary"
          autoFocus={label === "Name"}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
    </div>
    {error && (
      <div className="flex items-center gap-1 pl-2">
        <img src="/misc/red-circle-warning.svg" alt="warning" className="w-4 h-4" />
        <span className="text-[#E93544] text-sm">{error}</span>
      </div>
    )}
  </div>
);

const NetworkBadge = ({ networkId }: { networkId: string }) => {
  return (
    <div className="flex flex-row gap-1 items-center">
      <img alt="" className="w-4 h-4" src={`/chain/${networkId}.svg`} />
    </div>
  );
};

const CreatePaymentLinkContainer = () => {
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(null);
  const { openModal } = useModal();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
    watch,
  } = useForm<CreatePaymentLinkFormData>({
    defaultValues: {
      title: "",
      description: "",
      amount: "",
    },
  });

  const handleCreatePaymentLink = (data: CreatePaymentLinkFormData) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col w-full h-full p-4 items-center justify-start gap-10">
      {/* Header */}
      <div className="w-full flex flex-row gap-2 px-7">
        <img src="/misc/star-icon.svg" alt="Payment Link" />
        <h1 className="text-2xl font-bold">Create Payment Link</h1>
      </div>

      <div className="w-full h-full flex flex-row justify-between items-start gap-10 p-1 bg-[#E7E7E7] rounded-4xl">
        <div className="flex flex-col gap-4 w-[40%] rounded-4xl bg-app-background h-full border-t-2 border-background p-4">
          <span className="text-text-primary text-lg font-semibold leading-none">Informations</span>
          <FormInput
            label="Title"
            placeholder="i.e XYZ Donation"
            register={register("title")}
            error={errors.title?.message}
          />
          {/* Message Input */}
          <div className="flex flex-col gap-1">
            <div className={`${inputContainerClass} h-[175px] flex flex-col gap-2`}>
              <div className="flex flex-col gap-0.5 flex-1">
                <p className="text-text-secondary text-sm">Description</p>
                <textarea
                  {...register("description")}
                  className={`w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-secondary h-full resize-none`}
                  autoComplete="off"
                  placeholder="Hey there! Just a quick note to confirm your cryptocurrency transfer."
                  maxLength={250}
                />
              </div>
            </div>
            <div className="flex justify-between px-3">
              <p className="text-xs text-text-secondary">(Optional)</p>
              <p className="text-xs text-text-secondary">{watch("description")?.length || 0}/250</p>
            </div>
          </div>

          <div className={`${inputContainerClass} h-[120px] flex flex-col gap-2`}>
            <div className="flex justify-between items-center">
              <p className="text-sm text-text-primary">Accept payment on</p>
              <div className="flex flex-row gap-2 items-center">
                <img alt="" className="w-4 h-4" src="/misc/blue-setting-icon.svg" />
                <p className="text-primary-blue text-sm">Manage payment method</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 flex-1"></div>
          </div>

          {/* Token Selector */}
          <div
            className={`bg-background rounded-xl p-3 border-b-2 border-primary-divider flex items-center justify-between cursor-pointer`}
            onClick={() =>
              openModal(MODAL_IDS.SELECT_TOKEN, {
                selectedToken,
                onTokenSelect: (token: AssetWithMetadata) => {
                  setSelectedToken(token);
                },
              })
            }
          >
            <div className="flex gap-3 items-center">
              {selectedToken?.metadata.symbol ? (
                <>
                  <div className="relative w-10 h-10">
                    <img
                      alt=""
                      className="w-full h-full"
                      src={selectedToken.metadata.symbol === "QASH" ? "/token/qash.svg" : "/token/eth.svg"}
                    />
                    <img alt="" className="absolute bottom-0 right-0 w-5 h-5" src="/chain/miden.svg" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-text-primary text-sm">{selectedToken.metadata.symbol}</p>
                    <p className="text-text-secondary text-sm">Miden</p>
                  </div>
                </>
              ) : (
                <span className="text-text-primary py-2">Select token</span>
              )}
            </div>
            <img alt="" className="w-6 h-6" src="/arrow/chevron-down.svg" />
          </div>
          <FormInput
            label="Amount"
            placeholder="Enter amount"
            register={register("amount")}
            error={errors.amount?.message}
          />
          <PrimaryButton text="Create Payment Link" onClick={handleSubmit(handleCreatePaymentLink)} disabled={true} />
        </div>

        <span className="text-text-secondary text-sm leading-none w-[60%]">
          Create a payment link to receive payments.
        </span>
      </div>
    </div>
  );
};

export default CreatePaymentLinkContainer;
