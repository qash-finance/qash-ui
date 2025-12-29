/* eslint-disable react-hooks/rules-of-hooks */
import { getConsumable as getConsumableNotesFromServer } from "@/services/api/transaction";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWalletAuth } from "./useWalletAuth";
import { getConsumableNotes } from "@/services/utils/miden/note";
import { getFaucetMetadata } from "@/services/utils/miden/faucet";
import { AssetWithMetadata, PartialConsumableNote } from "@/types/faucet";
import { ConsumableNote } from "@/types/transaction";
import { useMidenSdkStore } from "@/contexts/MidenSdkProvider";

export function useConsumableNotes() {
  const { walletAddress } = useWalletAuth();
  const queryClient = useQueryClient();
  const blockNum = useMidenSdkStore(state => state.blockNum);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["consumable-notes", walletAddress],
    queryFn: async (): Promise<PartialConsumableNote[]> => {
      // // sender can get
      // // 1. p2id note
      // // 2. p2ide note as receiver
      // // 3. p2ide note as sender

      // // Basically I dont want to put recallable transactions in consumable note to prevent sender recall transactions

      // // So in this hook, we will only get
      // // 1. p2id note as receiver
      // // 2. p2ide note as receiver

      // // Problem here is getConsumableNotes will give p2ide note as sender as well, so we need to filter it out
      // const { NetworkId, AccountInterface } = await import("@demox-labs/miden-sdk");

      // const latestBlockHeight = blockNum || 0;

      // let consumableNotesFromServer: { consumableTxs: ConsumableNote[]; recallableTxs: ConsumableNote[] } = {
      //   consumableTxs: [],
      //   recallableTxs: [],
      // };

      // try {
      //   consumableNotesFromServer = await getConsumableNotesFromServer(latestBlockHeight);
      // } catch (error) {
      //   console.log("ERROR GETTING PRIVATE NOTES", error);
      // }

      // const consumablePrivateNotes: PartialConsumableNote[] = consumableNotesFromServer.consumableTxs.map(note => ({
      //   id: note.noteId,
      //   sender: note.sender,
      //   recipient: note.recipient,
      //   private: note.private,
      //   recallableHeight: note.recallableHeight,
      //   recallableTime: note.recallableTime,
      //   serialNumber: note.serialNumber,
      //   requestPaymentId: note.requestPaymentId,
      //   assets: note.assets.map(asset => ({
      //     amount: (Number(asset.amount) * 10 ** asset.metadata.decimals).toString(),
      //     faucetId: asset.faucetId,
      //     metadata: asset.metadata,
      //   })),
      // }));

      // const notes: any[] = await getConsumableNotes(walletAddress!);

      // const consumableNotes: PartialConsumableNote[] = await Promise.all(
      //   notes.map(async note => {
      //     // if note is in recallableTxs, dont include it

      //     const id = note.inputNoteRecord().id().toString();
      //     const inputNoteRecord = note.inputNoteRecord();
      //     const noteMetadata = inputNoteRecord.metadata();
      //     const noteDetails = inputNoteRecord.details();
      //     const assetPromises = noteDetails
      //       .assets()
      //       .fungibleAssets()
      //       .map(async (asset: any) => {
      //         const metadata = await getFaucetMetadata(
      //           asset.faucetId().toBech32(NetworkId.Testnet, AccountInterface.Unspecified),
      //         );
      //         return {
      //           faucetId: asset.faucetId().toBech32(NetworkId.Testnet, AccountInterface.Unspecified),
      //           amount: asset.amount().toString(),
      //           metadata: metadata,
      //         } as AssetWithMetadata;
      //       });
      //     const assets: AssetWithMetadata[] = await Promise.all(assetPromises);
      //     const sender = noteMetadata?.sender().toBech32(NetworkId.Testnet, AccountInterface.BasicWallet);

      //     return {
      //       id: id,
      //       private: false,
      //       sender: sender!,
      //       recipient: walletAddress!,
      //       assets: assets,
      //       recallableHeight: -1,
      //       recallableTime: "",
      //       serialNumber: [],
      //       requestPaymentId: note.requestPaymentId,
      //     };
      //   }),
      // );

      // // filterout the sender and recipient are the same
      // const filteredConsumableNotes = consumableNotes.filter(note => note.sender !== note.recipient);

      // // Prefer server-enriched notes (which include recallable metadata) when IDs collide
      // const returnNotes = [...consumablePrivateNotes, ...filteredConsumableNotes];

      // // remove the same note.id
      // const filteredNotes = returnNotes.filter(
      //   (note, index, self) => index === self.findIndex(t => t.id.toLowerCase() === note.id.toLowerCase()),
      // );
      // return filteredNotes;
      return [];
    },
    enabled: !!walletAddress,
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 5 * 60 * 1000, // Garbage collect after 5 minutes
    refetchInterval: 25000, // Refetch every 25 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Force fresh fetch by invalidating cache
  const forceFetch = async () => {
    // repeat 3 times, each with 3 seconds delay
    for (let i = 0; i < 5; i++) {
      queryClient.invalidateQueries({ queryKey: ["consumable-notes", walletAddress] });
      await refetch();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
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
