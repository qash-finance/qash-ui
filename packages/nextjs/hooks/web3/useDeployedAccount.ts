"use client";
import { useAccount } from "@/contexts/AccountProvider";
import { AccountId, NoteType } from "@demox-labs/miden-sdk";
import { createP2IDNote, createP2IDRNote, consumeAllNotes, getConsumableNotes } from "@/services/utils/note";
import { mintToken } from "@/services/utils/faucet";

export function useDeployedAccount() {
  const { deployedAccount, deployedAccountData, isDeploying, error, clearAllStoredAccounts } = useAccount();

  // Helper to check if account is available
  const hasAccount = !!(deployedAccount || deployedAccountData?.accountId);
  const isReady = hasAccount && !isDeploying;

  // Wrapper functions that automatically use the deployed account
  const createP2IDNoteWithDeployedAccount = async (
    receiver: AccountId,
    faucet: AccountId,
    amount: number,
    noteType: NoteType,
  ) => {
    // Return null if still loading or no account available
    if (isDeploying || !hasAccount) {
      return null;
    }

    // Only throw error if there's an actual deployment error
    if (error) {
      throw new Error(`Account deployment failed: ${error}`);
    }

    // If we have the full Account object, use it. Otherwise, use AccountId from string
    const senderAccountId = deployedAccount ? deployedAccount.id() : AccountId.fromHex(deployedAccountData?.accountId!);
    return createP2IDNote(senderAccountId, receiver, faucet, amount, noteType);
  };

  const createP2IDRNoteWithDeployedAccount = async (
    receiver: AccountId,
    faucet: AccountId,
    amount: number,
    noteType: NoteType,
    recallHeight: number,
  ) => {
    // Return null if still loading or no account available
    if (isDeploying || !hasAccount) {
      return null;
    }

    // Only throw error if there's an actual deployment error
    if (error) {
      throw new Error(`Account deployment failed: ${error}`);
    }

    // If we have the full Account object, use it. Otherwise, use AccountId from string
    const senderAccountId = deployedAccount ? deployedAccount.id() : AccountId.fromHex(deployedAccountData?.accountId!);
    return createP2IDRNote(senderAccountId, receiver, faucet, amount, noteType, recallHeight);
  };

  const consumeAllNotesWithDeployedAccount = async (noteIds: string[]) => {
    // Return null if still loading or no account available
    if (isDeploying || !deployedAccountData?.accountId) {
      return null;
    }

    // Only throw error if there's an actual deployment error
    if (error) {
      throw new Error(`Account deployment failed: ${error}`);
    }

    // return consumeAllNotes(deployedAccountData?.accountId, noteIds);
  };

  const getConsumableNotesWithDeployedAccount = async () => {
    // Return null if still loading or no account available
    if (isDeploying || !deployedAccountData?.accountId) {
      return null;
    }

    // Only throw error if there's an actual deployment error
    if (error) {
      throw new Error(`Account deployment failed: ${error}`);
    }

    return getConsumableNotes(deployedAccountData?.accountId);
  };

  const mintTokenWithDeployedAccount = async (faucetId: string, amount: number) => {
    // Return null if still loading or no account available
    if (isDeploying || !deployedAccountData?.accountId) {
      return null;
    }

    // Only throw error if there's an actual deployment error
    if (error) {
      throw new Error(`Account deployment failed: ${error}`);
    }

    return mintToken(deployedAccountData?.accountId, faucetId, amount);
  };

  return {
    // Account state
    deployedAccount,
    deployedAccountData,
    isDeploying,
    error,

    // Helper functions that use deployed account
    createP2IDNote: createP2IDNoteWithDeployedAccount,
    createP2IDRNote: createP2IDRNoteWithDeployedAccount,
    consumeAllNotes: consumeAllNotesWithDeployedAccount,
    getConsumableNotes: getConsumableNotesWithDeployedAccount,
    mintToken: mintTokenWithDeployedAccount,

    // Debug functions
    clearAllStoredAccounts,

    // Check if ready for transactions
    isReady,
    hasAccount,
  };
}
