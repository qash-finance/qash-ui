import React, { useEffect } from "react";
import { ActionButton } from "../Common/ActionButton";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export const CreateAddressCard = ({ onSave }: { onSave: (data: { name: string; address: string }) => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ name: string; address: string }>();

  const onError = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors).find(err => err?.message);
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const handleSave = (data: { name: string; address: string }) => {
    onSave(data);
    reset();
  };

  return (
    <form className="flex flex-col gap-2 w-[250px] bg-[#292929] rounded-2xl p-2">
      <div className="flex flex-row gap-2 items-center">
        <img src="/plus-icon.svg" alt="folder" className="w-12 h-12 rounded-xl" />
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Remember name"
            className="w-full bg-transparent border-none outline-none text-white text-base leading-5"
            {...register("name", {
              required: {
                value: true,
                message: "Name is required",
              },
            })}
          />
          <input
            type="text"
            placeholder="Address"
            className="w-full bg-transparent border-none outline-none text-white text-sm leading-4"
            {...register("address", {
              required: {
                value: true,
                message: "Address is required",
              },
            })}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 w-full">
        <ActionButton
          text="Save"
          type="neutral"
          className="w-full flex-4/5"
          onClick={handleSubmit(handleSave, onError)}
        />
        <div className="flex flex-2/6 flex-row gap-1 items-center bg-white rounded-full justify-between pr-2">
          <img src="/token/usdt.svg" alt="token" className="w-8 h-8" />
          <img src="/arrow/filled-arrow-down.svg" alt="token" className="w-4 h-4" style={{ filter: "brightness(0)" }} />
        </div>
      </div>
    </form>
  );
};
