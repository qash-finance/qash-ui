"use client";
import React, { useCallback } from "react";
import { ActionButton } from "../Common/ActionButton";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, UseFormGetValues } from "react-hook-form";

interface RecipientInputProps {
  onChooseRecipient: () => void;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  recipientName?: string;
  setRecipientName: (name: string) => void;
  getValues: UseFormGetValues<any>;
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
  onChooseRecipient,
  register,
  errors,
  setValue,
  watch,
  recipientName,
  setRecipientName,
  getValues,
}) => {
  // Debounced address validation
  const validateAddress = useCallback((address: string) => {
    try {
      if (address.startsWith("mt")) {
        return true;
      }
      // address need to be at least 36 characters
      if (address.length < 36) {
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const handleChooseRecipient = () => {
    onChooseRecipient();
  };

  return (
    <>
      {/* Recipient Input */}
      {/* If recipient name is not set, show the input */}
      {!recipientName ? (
        <section className="flex flex-col flex-wrap py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-[#292929]">
          <div className="flex flex-wrap gap-2.5 items-center">
            <img
              src="/default-avatar-icon.png"
              alt="Recipient avatar"
              className="object-contain shrink-0 aspect-square w-[40px]"
            />
            <div className="flex flex-col flex-1 ">
              <div className="flex gap-2 items-center self-start whitespace-nowrap w-full">
                <label className="text-base leading-none text-center text-white">To</label>
                <input
                  {...register("recipientAddress", {
                    validate: (value: string) => {
                      if (!value) return true; // Don't show error when empty
                      if (!value.startsWith("mt")) return "Address must start with 'mt'";
                      if (value.length < 36) return "Address must be at least 36 characters";
                      return true;
                    },
                  })}
                  autoComplete="off"
                  type="text"
                  placeholder="Enter address or choose from your contacts book"
                  className=" flex-1 leading-none text-white bg-transparent outline-none placeholder:text-neutral-600 w-full"
                />
              </div>
            </div>
            {watch("recipientAddress") && validateAddress(watch("recipientAddress")) ? (
              <ActionButton
                text="Remove"
                type="deny"
                onClick={() => {
                  setRecipientName("");
                  setValue("recipientAddress", "");
                }}
              />
            ) : (
              <ActionButton text="Choose" onClick={handleChooseRecipient} />
            )}
          </div>

          {watch("recipientAddress") && !validateAddress(watch("recipientAddress")) && (
            <span className="text-sm text-red-500">Invalid recipient address</span>
          )}
        </section>
      ) : (
        <section className="flex flex-col flex-wrap py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-zinc-800">
          <div className="flex flex-wrap gap-2.5 items-center">
            <img
              src="/default-avatar-icon.png"
              alt="Recipient avatar"
              className="object-contain shrink-0 aspect-square w-[40px]"
            />
            <div className="flex flex-col flex-1 shrink justify-center basis-5 min-w-60">
              <div className="flex gap-2 items-center self-start whitespace-nowrap">
                <label className="text-base leading-none text-center text-white">From</label>
                <span className="text-base tracking-tight leading-none text-neutral-600">{recipientName}</span>
              </div>
              <span className="mt-2 text-base tracking-tight leading-none text-white bg-transparent outline-none">
                {getValues("recipientAddress")}
              </span>
            </div>
            <ActionButton
              text="Remove"
              type="deny"
              onClick={() => {
                setRecipientName("");
                setValue("recipientAddress", "");
              }}
            />
          </div>
        </section>
      )}
    </>
  );
};
