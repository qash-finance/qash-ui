"use client";
import { useWalletState } from "@/services/store";
import { LAST_CONNECTED_KEY, WALLET_ADDRESSES_KEY } from "@/services/utils/constant";
import { deployAccount, importAccount } from "@/services/utils/miden/account";
import toast from "react-hot-toast";

const getStoredWalletAddresses = (): string[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(WALLET_ADDRESSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addWalletAddress = (address: string) => {
  const addresses = getStoredWalletAddresses();
  if (!addresses.includes(address)) {
    addresses.push(address);
    localStorage.setItem(WALLET_ADDRESSES_KEY, JSON.stringify(addresses));
  }
};

const replaceWalletAddresses = (addresses: string[]) => {
  localStorage.setItem(WALLET_ADDRESSES_KEY, JSON.stringify(addresses));
};

const setLastConnectedAddress = (address: string) => {
  localStorage.setItem(LAST_CONNECTED_KEY, address);
};

export const getLastConnectedAddress = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_CONNECTED_KEY);
};

export const getWalletAddresses = (): string[] => {
  return getStoredWalletAddresses();
};

export const importWalletFromJson = async (jsonData: any): Promise<string[]> => {
  try {
    // Validate JSON structure - check for accounts array
    if (!jsonData.accounts || !Array.isArray(jsonData.accounts)) {
      throw new Error("Invalid wallet file format - missing accounts array");
    }

    const importedAddresses: string[] = [];

    // Import AccountId for conversion
    const { AccountId, AccountInterface, NetworkId } = await import("@demox-labs/miden-sdk");

    // Process each account in the accounts array
    for (const account of jsonData.accounts) {
      // Check if accountSeed is not null (means we own this account)
      if (account.accountSeed !== null && account.id) {
        const accountId = account.id;

        // Validate account ID format
        if (typeof accountId === "string" && accountId.length > 0) {
          // Convert hex account ID to bech32 format
          const bech32Address = AccountId.fromHex(accountId).toBech32(NetworkId.Testnet, AccountInterface.BasicWallet);
          importedAddresses.push(bech32Address);
        }
      }
    }

    if (importedAddresses.length === 0) {
      throw new Error("No valid accounts with seeds found in the file");
    }

    // Replace all current localStorage accounts with the imported ones
    replaceWalletAddresses(importedAddresses);

    return importedAddresses;
  } catch (error) {
    console.error("Import failed:", error);
    throw error;
  }
};

export const useWalletConnect = () => {
  const { walletAddress, setWalletAddress, setIsConnected } = useWalletState(state => state);

  const handleConnect = async () => {
    try {
      // Check from local storage if account is deployed
      if (!walletAddress) {
        toast.loading("Deploying account...");
        const { AccountId, AccountInterface, NetworkId } = await import("@demox-labs/miden-sdk");

        const deployedAccount = await deployAccount(false);

        // Get account id (bech32)
        const accountId = deployedAccount.id().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet);

        // Store in local storage via zustand
        setWalletAddress(accountId);
        addWalletAddress(accountId);
        setLastConnectedAddress(accountId);

        toast.dismiss();
        toast.success("Account deployed");
      } else {
        console.log("Account already deployed");
        // If already deployed, just proceed
        setWalletAddress(walletAddress);
        addWalletAddress(walletAddress);
        setLastConnectedAddress(walletAddress);
        setIsConnected(true);
        toast.success("Account connected");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to connect wallet");
      console.error("Wallet connection error:", error);
    }
  };

  const handleCreateWallet = async () => {
    try {
      if (!walletAddress) {
        const { AccountId, AccountInterface, NetworkId } = await import("@demox-labs/miden-sdk");

        const deployedAccount = await deployAccount(true);
        const accountId = deployedAccount.id().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet);

        setWalletAddress(accountId);
        addWalletAddress(accountId);
        setLastConnectedAddress(accountId);

        return accountId;
      } else {
        setWalletAddress(walletAddress);
        addWalletAddress(walletAddress);
        setLastConnectedAddress(walletAddress);
        setIsConnected(true);
      }

      return walletAddress;
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to connect wallet");
      console.error("Wallet connection error:", error);
    }
  };

  const handleConnectExisting = async (address: string) => {
    try {
      setWalletAddress(address);
      addWalletAddress(address);
      setLastConnectedAddress(address);
      setIsConnected(true);
      toast.success("Wallet connected");
      return address;
    } catch (error) {
      toast.error("Failed to connect wallet");
      console.error("Wallet connection error:", error);
    }
  };

  const handleImportWallet = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const jsonString = e.target?.result as string;
          const jsonData = JSON.parse(jsonString);
          const addresses = await importWalletFromJson(jsonData);
          await importAccount(jsonString);
          resolve(addresses);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return {
    handleConnect,
    handleCreateWallet,
    handleConnectExisting,
    handleImportWallet,
    walletAddress,
    isConnected: useWalletState(state => state.isConnected),
    getWalletAddresses,
    getLastConnectedAddress,
  };
};
