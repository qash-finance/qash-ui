/* eslint-disable react-hooks/rules-of-hooks */
import { getConsumable as getConsumableNotesFromServer } from "@/services/api/transaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { getConsumableNotes } from "@/services/utils/miden/note";
import { ConsumableNoteRecord } from "@demox-labs/miden-sdk";
import { getFaucetMetadata } from "@/services/utils/miden/faucet";
import { AssetWithMetadata, PartialConsumableNote } from "@/types/faucet";
import { ConsumableNote } from "@/types/transaction";

export function useConsumableNotes() {
  const { walletAddress } = useWalletAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["consumable-notes", walletAddress],
    queryFn: async (): Promise<PartialConsumableNote[]> => {
      let consumableNotesFromServer: ConsumableNote[] = [];
      try {
        consumableNotesFromServer = await getConsumableNotesFromServer();
      } catch (error) {
        console.log("ERROR GETTING PRIVATE NOTES", error);
      }

      const consumablePrivateNotes: PartialConsumableNote[] = consumableNotesFromServer.map(note => ({
        id: note.noteId,
        sender: note.sender,
        recipient: note.recipient,
        private: true,
        recallableHeight: note.recallableHeight,
        recallableTime: note.recallableTime,
        serialNumber: note.serialNumber,
        assets: note.assets.map(asset => ({
          amount: (Number(asset.amount) * 10 ** asset.metadata.decimals).toString(),
          faucetId: asset.faucetId,
          metadata: asset.metadata,
        })),
      }));

      const notes: ConsumableNoteRecord[] = await getConsumableNotes(walletAddress!);

      const consumableNotes: PartialConsumableNote[] = await Promise.all(
        notes.map(async note => {
          const id = note.inputNoteRecord().id().toString();
          const inputNoteRecord = note.inputNoteRecord();
          const noteMetadata = inputNoteRecord.metadata();
          const noteDetails = inputNoteRecord.details();
          const assetPromises = noteDetails
            .assets()
            .fungibleAssets()
            .map(async asset => {
              const metadata = await getFaucetMetadata(asset.faucetId());
              return {
                faucetId: asset.faucetId().toBech32(),
                amount: asset.amount().toString(),
                metadata: metadata,
              } as AssetWithMetadata;
            });
          const assets: AssetWithMetadata[] = await Promise.all(assetPromises);
          const sender = noteMetadata?.sender().toBech32();

          return {
            id: id,
            private: false,
            sender: sender!,
            recipient: walletAddress!,
            assets: assets,
            recallableHeight: -1,
            recallableTime: "",
            serialNumber: [],
          };
        }),
      );

      // check duplicate notes (should be public recallable notes, if the note is not able to consume yet, dont show it)
      const recallableTransactions = consumablePrivateNotes.filter(
        note => note.sender == walletAddress && note.recallableHeight > 0,
      );

      // from recallable transactions, we check with consumableNotes, to see if the note is ready to be consumed
      const readyToConsumeNotes = recallableTransactions.filter(transaction => {
        const note = consumableNotes.find(note => note.id === transaction.id);
        if (!note) return false;
        return note.recallableTime <= new Date().toISOString();
      });

      // also filter out the note from server that is private
      const privateNotes = consumablePrivateNotes.filter(note => note.private);

      return [...readyToConsumeNotes, ...privateNotes];
    },
    enabled: !!walletAddress,
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 5 * 60 * 1000, // Garbage collect after 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Force fresh fetch by invalidating cache
  const forceFetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["consumable-notes", walletAddress],
    });
  };

  return {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    forceFetch,
  };
}
