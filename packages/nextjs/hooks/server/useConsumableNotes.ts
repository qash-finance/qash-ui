/* eslint-disable react-hooks/rules-of-hooks */
import { getConsumable as getPrivateConsumableNotes } from "@/services/api/transaction";
import { useQuery } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { getConsumableNotes } from "@/services/utils/miden/note";
import { ConsumableNoteRecord } from "@demox-labs/miden-sdk";
import { getFaucetMetadata } from "@/services/utils/miden/faucet";
import { AssetWithMetadata } from "@/types/faucet";
import { ConsumableNote } from "@/types/transaction";
import { formatUnits } from "viem";

export function useConsumableNotes() {
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["consumable-notes", walletAddress],
    queryFn: async (): Promise<ConsumableNote[]> => {
      const privateNotes = await getPrivateConsumableNotes();

      const notes: ConsumableNoteRecord[] = await getConsumableNotes(walletAddress!);
      const consumableNotes: any[] = await Promise.all(
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
                faucetId: asset.faucetId().toString(),
                amount: asset.amount().toString(),
                metadata: metadata,
              } as AssetWithMetadata;
            });
          const assets: AssetWithMetadata[] = await Promise.all(assetPromises);
          const sender = noteMetadata?.sender().toBech32();

          return {
            id: id,
            sender: sender!,
            recipient: walletAddress!,
            assets: assets,
          };
        }),
      );

      const consumablePrivateNotes = privateNotes.map(note => ({
        id: note.noteId,
        sender: note.sender,
        recipient: note.recipient,
        assets: note.assets.map(asset => ({
          amount: Number(asset.amount) * 10 ** asset.metadata.decimals,
          faucetId: asset.faucetId,
          metadata: asset.metadata,
        })),
      }));

      console.log("consumablePrivateNotes", consumablePrivateNotes);
      return [...consumableNotes, ...consumablePrivateNotes];
    },
    enabled: !!walletAddress,
  });

  return {
    data,
    isLoading,
    error,
  };
}
