"use client";
import { useWalletState } from "@/services/store";
import { deployAccount } from "@/services/utils/account";
import toast from "react-hot-toast";

export const useWalletConnect = () => {
  const { walletAddress, setWalletAddress, setIsConnected } = useWalletState(state => state);

  const handleConnect = async () => {
    try {
      // Check from local storage if account is deployed
      if (!walletAddress) {
        toast.loading("Deploying account...");

        // Deploy account if not already deployed
        const deployedAccount = await deployAccount(true);

        // Get account id (bech32)
        const accountId = deployedAccount.id().toBech32();

        // Store in local storage via zustand
        setWalletAddress(accountId);

        toast.dismiss();
        toast.success("Account deployed");
      } else {
        console.log("Account already deployed");
        // If already deployed, just proceed
        setWalletAddress(walletAddress);
        setIsConnected(true);
        toast.success("Account connected");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to connect wallet");
      console.error("Wallet connection error:", error);
    }
  };

  return {
    handleConnect,
    walletAddress,
    isConnected: useWalletState(state => state.isConnected),
  };
};
