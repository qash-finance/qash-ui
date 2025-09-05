"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ActionButton } from "@/components/Common/ActionButton";
import { toast } from "react-hot-toast";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useModal } from "@/contexts/ModalManagerProvider";
import { MODAL_IDS } from "@/types/modal";
import { MIDEN_EXPLORER_URL } from "@/services/utils/constant";
import { createGiftNote, stringToSecretArray, consumeUnauthenticatedGiftNote } from "@/services/utils/miden/note";
import { formatUnits } from "viem";

const ClaimEmailContainer: React.FC = () => {
  // **************** URL Params *******************
  const searchParams = useSearchParams();
  const encodedCode = searchParams.get("code");
  const code = encodedCode ? decodeURIComponent(encodedCode) : "";
  const serialParam = searchParams.get("sn");
  const senderParam = searchParams.get("s");
  const faucetParam = searchParams.get("f");
  const amountParam = searchParams.get("amt");
  const decimalsParam = searchParams.get("dec");
  const symbolParam = searchParams.get("sym");

  // **************** Hooks *******************
  const router = useRouter();
  const { isConnected, walletAddress } = useWalletConnect();
  const { openModal, closeModal } = useModal();
  // const { data: giftDetail, isLoading } = useGiftDetail(code);
  // const { mutateAsync: openGift } = useOpenGift();

  // **************** Local State *******************
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedTxId, setClaimedTxId] = useState<string>("");

  const isParamsValid = useMemo(() => {
    return !!(code && serialParam && senderParam && faucetParam && amountParam);
  }, [code, serialParam, senderParam, faucetParam, amountParam]);

  const decimalsNum = useMemo(() => {
    try {
      const d = decimalsParam ? parseInt(decimalsParam) : 0;
      return Number.isNaN(d) ? 0 : d;
    } catch {
      return 0;
    }
  }, [decimalsParam]);

  const amountBigInt = useMemo(() => {
    try {
      return amountParam ? BigInt(amountParam) : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [amountParam]);

  const formattedAmount = useMemo(() => {
    try {
      return formatUnits(amountBigInt, decimalsNum);
    } catch {
      return amountParam || "0";
    }
  }, [amountBigInt, decimalsNum, amountParam]);

  const handleClaim = async () => {
    if (!isParamsValid) {
      toast.error("Invalid claim link");
      return;
    }

    if (!isConnected) {
      openModal(MODAL_IDS.CONNECT_WALLET);
      return;
    }

    setIsClaiming(true);
    openModal(MODAL_IDS.VALIDATING);
    try {
      const secret = stringToSecretArray(code);
      const serial = serialParam!.split(",").map(Number) as number[] as [number, number, number, number];
      const sender = decodeURIComponent(senderParam!);
      const faucetId = decodeURIComponent(faucetParam!);
      const amount = BigInt(amountParam!);

      const [note] = await createGiftNote(sender, faucetId, amount, secret, serial);

      const txId = await consumeUnauthenticatedGiftNote(walletAddress, note, secret);

      closeModal(MODAL_IDS.VALIDATING);
      toast.success(
        <div>
          Transaction sent successfully, view transaction on{" "}
          <a href={`${MIDEN_EXPLORER_URL}/tx/${txId}`} target="_blank" rel="noopener noreferrer" className="underline">
            Miden Explorer
          </a>
        </div>,
      );

      // No server call; claim is trustless via URL data
      setClaimedTxId(txId);
    } catch (err) {
      console.error(err);
      closeModal(MODAL_IDS.VALIDATING);
      toast.error("Failed to claim transfer");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
      <div className="w-full max-w-xl">
        <div className="bg-[#1E1E1E] border border-[#3d3d3d] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#2D2D2D] px-4 py-3">
            <h1 className="text-white text-xl font-semibold">{claimedTxId ? "Transfer Claimed" : "Claim Transfer"}</h1>
          </div>
          <div className="p-5">
            {claimedTxId ? (
              <div className="flex flex-col gap-4">
                <div className="text-white">Your transfer has been successfully claimed.</div>
                <a
                  href={`${MIDEN_EXPLORER_URL}/tx/${claimedTxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#066eff]"
                >
                  View on Miden Explorer
                </a>
              </div>
            ) : !isParamsValid ? (
              <div className="text-red-400">Invalid or incomplete claim link.</div>
            ) : (
              <>
                <div className="bg-[#292929] rounded-lg px-4 py-6 mb-4 flex items-center justify-between">
                  <span className="text-[#989898] text-sm">Total Amount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-3xl font-medium leading-none">{formattedAmount}</span>
                    <span className="text-white text-xl font-medium leading-none">{symbolParam}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#292929] rounded-md px-3 py-2">
                    <div className="text-[#989898] text-sm">From</div>
                    <div className="text-white text-sm break-all">{senderParam}</div>
                  </div>
                  <div className="bg-[#292929] rounded-md px-3 py-2">
                    <div className="text-[#989898] text-sm">Faucet</div>
                    <div className="text-white text-sm break-all">{faucetParam}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!claimedTxId && !isConnected && (
        <div className="bg-[#3d3d3d] text-white rounded p-3">Connect your wallet to claim this transfer.</div>
      )}

      {!claimedTxId ? (
        <div className="flex gap-2 w-full max-w-xl">
          <ActionButton text="Cancel" type="neutral" className="flex-1" onClick={() => router.push("/")} />
          <ActionButton
            text="Claim"
            className="flex-1"
            loading={isClaiming}
            disabled={!isParamsValid}
            onClick={handleClaim}
          />
        </div>
      ) : (
        <div className="flex gap-2 w-full max-w-xl">
          <ActionButton text="Done" className="flex-1" onClick={() => router.push("/")} />
          <a
            href={`${MIDEN_EXPLORER_URL}/tx/${claimedTxId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <ActionButton text="View on Explorer" />
          </a>
        </div>
      )}
    </div>
  );
};

export default ClaimEmailContainer;
