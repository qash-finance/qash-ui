"use client";
import * as React from "react";
import { ActionButton } from "../Common/ActionButton";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface RecipientInputProps {
  onChooseRecipient: () => void;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  recipientName?: string;
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
  onChooseRecipient,
  register,
  errors,
  setValue,
  watch,
  recipientName,
}) => {
  return (
    <section className="flex flex-col flex-wrap py-2.5 pr-4 pl-3 mt-1 mb-1 w-full rounded-lg bg-zinc-800">
      <div className="flex flex-wrap gap-2.5 items-center">
        <img
          src="/default-avatar-icon.png"
          alt="Recipient avatar"
          className="object-contain shrink-0 aspect-square w-[40px]"
        />
        <div className="flex flex-col flex-1 shrink justify-center basis-5 min-w-60">
          <div className="flex gap-2 items-center self-start whitespace-nowrap">
            <label className="text-base leading-none text-center text-white">To</label>
            <span className="text-base tracking-tight leading-none text-neutral-600">{recipientName}</span>
          </div>
          <input
            {...register("recipientAddress", {
              validate: (value: string) => {
                if (!value) return true; // Don't show error when empty
                if (!value.startsWith("mt")) return "Address must start with 'mt'";
                if (value.length < 36) return "Address must be at least 36 characters";
              },
            })}
            type="text"
            placeholder="Enter address or choose from your contacts book"
            className="mt-2 text-base tracking-tight leading-none text-neutral-600 bg-transparent outline-none placeholder:text-neutral-600"
          />
        </div>
        <ActionButton text="Choose" onClick={onChooseRecipient} />
      </div>

      {errors.recipientAddress && watch("recipientAddress") && (
        <span className="text-sm text-red-500">{errors?.recipientAddress?.message as string}</span>
      )}
    </section>
  );
};
