/* eslint-disable react-hooks/rules-of-hooks */
import { getRecallable } from "@/services/api/transaction";
import { useQuery } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { getConsumableNotes } from "@/services/utils/miden/note";
import { ConsumableNoteRecord } from "@demox-labs/miden-sdk";
import { getFaucetMetadata } from "@/services/utils/miden/faucet";
import { AssetWithMetadata } from "@/types/faucet";

export function useRecallableNotes() {
  const { walletAddress } = useWalletAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["consumable-notes", walletAddress],
    queryFn: async (): Promise<any> => {
      const recallableNotes = await getRecallable();

      // 1. get recallable notes from server (include public and private)
      // 2. get all consumable notes from client sdk
      // 3. loop through all consumable notes from client sdk, and check if the notes are P2IDE (only keep P2IDE)
      // 4. check the kept P2IDE notes if its contradicted with recallable notes from server
      //    - if contradicted, keep the one from server
      //    - if not contradicted, keep the one from client sdk (this should be the note happening outside of the app)
      //         -> We need to know the consumable block to render correctly on the UI
      // 5. merge the notes from server and client sdk

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
            private: false,
            sender: sender!,
            recipient: walletAddress!,
            assets: assets,
          };
        }),
      );

      return {};
    },
    enabled: !!walletAddress,
  });

  return {
    data,
    isLoading,
    error,
  };
}
