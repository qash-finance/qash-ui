import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { blo } from "blo";
import { ActionButton } from "../Common/ActionButton";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { AssetWithMetadata } from "@/types/faucet";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { QASH_TOKEN_ADDRESS } from "@/services/utils/constant";

export const CreateAddressCard = ({
  onSave,
}: {
  onSave: (data: { name: string; address: string; token?: string }) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; address: string; token?: string }>();
  const { openModal } = useModal();
  const [selectedToken, setSelectedToken] = useState<AssetWithMetadata | null>(null);

  const onError = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors).find(err => err?.message);
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  };

  const handleSave = (data: { name: string; address: string; token?: string }) => {
    onSave({ ...data, token: selectedToken?.faucetId });
  };

  return (
    <div className="flex flex-col gap-2 w-[250px] bg-[#292929] rounded-2xl p-2">
      <div className="flex flex-row gap-2 items-center">
        <img src="/plus-icon.svg" alt="folder" className="w-12 h-12 rounded-xl" />
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Remember name"
            autoComplete="off"
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
            autoComplete="off"
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
        <div
          className="flex flex-2/6 flex-row gap-1 items-center bg-white rounded-full justify-between pr-2 cursor-pointer"
          onClick={() =>
            openModal(MODAL_IDS.SELECT_TOKEN, {
              onTokenSelect: (token: AssetWithMetadata) => {
                console.log("🚀 ~ token:", token);
                setSelectedToken(token);
              },
            })
          }
        >
          <img
            src={
              !selectedToken
                ? "/token/any-token.svg"
                : selectedToken.faucetId == QASH_TOKEN_ADDRESS
                  ? "/q3x-icon.png"
                  : blo(turnBechToHex(selectedToken.faucetId))
            }
            alt="token"
            className="w-8 h-8"
          />
          <img src="/arrow/filled-arrow-down.svg" alt="token" className="w-4 h-4" style={{ filter: "brightness(0)" }} />
        </div>
      </div>
    </div>
  );
};
