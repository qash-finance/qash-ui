"use client";
import { NODE_ENDPOINT } from "@/services/utils/constant";
import { WebClient } from "@demox-labs/miden-sdk";

let client: WebClient | null = null;
let clientPromise: Promise<WebClient> | null = null;

const SYNC_HEIGHT_KEY = "miden_last_sync_height";

export function useClient() {
  async function getClient(): Promise<WebClient> {
    // If we're already in the process of creating a client, wait for it
    if (clientPromise) {
      return clientPromise;
    }

    // If we already have a client, check if we need to sync
    if (client) {
      await syncIfNeeded(client);
      return client;
    }

    // Create a new client
    clientPromise = (async () => {
      try {
        const { WebClient } = await import("@demox-labs/miden-sdk");
        client = await WebClient.createClient(NODE_ENDPOINT);

        // Initial sync for new client
        await syncIfNeeded(client, true);

        return client;
      } catch (error) {
        // Reset the client promise so we can retry
        clientPromise = null;
        throw error;
      }
    })();

    return clientPromise;
  }

  async function syncIfNeeded(client: WebClient, forceSync: boolean = false): Promise<void> {
    try {
      const currentHeight = await client.getSyncHeight();
      const lastSyncHeight = localStorage.getItem(SYNC_HEIGHT_KEY);

      // Sync if we don't have a stored height, if heights differ, or if forced
      if (forceSync || !lastSyncHeight || parseInt(lastSyncHeight) !== currentHeight) {
        console.log(`Syncing state: current height ${currentHeight}, last sync height ${lastSyncHeight}`);

        try {
          await client.syncState();
          localStorage.setItem(SYNC_HEIGHT_KEY, currentHeight.toString());
          console.log(`State synced successfully at height ${currentHeight}`);
        } catch (error) {
          // Handle the specific constraint error gracefully
          const errorMessage = String(error);
          if (errorMessage.includes("Key already exists") || errorMessage.includes("ConstraintError")) {
            console.warn("Account already exists in database, updating sync height anyway");
            localStorage.setItem(SYNC_HEIGHT_KEY, currentHeight.toString());
          } else {
            // For other errors, re-throw
            throw error;
          }
        }
      } else {
        console.log(`Skipping sync: already at height ${currentHeight}`);
      }
    } catch (error) {
      console.error("Error in syncIfNeeded:", error);
      // Don't throw here to avoid breaking the client initialization
    }
  }

  // Function to force sync state when needed (e.g., after transactions)
  async function forceSyncState(): Promise<void> {
    if (!client) {
      throw new Error("Client not initialized");
    }

    await syncIfNeeded(client, true);
  }

  return { getClient, forceSyncState };
}
