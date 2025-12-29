"use client";

import { NODE_ENDPOINT } from "@/services/utils/constant";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface MidenSdkConfig {
  endpoint?: string;
}

export interface MidenSdkState {
  isLoading: boolean;
  error: string | null;
  blockNum: number | null;
  config: MidenSdkConfig;
  account: string;
  client: unknown;
}

export interface MidenSdkActions {
  initializeSdk: (config: MidenSdkConfig) => Promise<void>;
  syncState: (client: any) => Promise<void>;
}

export type MidenSdkStore = MidenSdkState & MidenSdkActions;

export const createMidenSdkStore = () =>
  create<MidenSdkStore>()(
    immer((set, get) => ({
      isLoading: false,
      error: null,
      config: { endpoint: NODE_ENDPOINT },
      blockNum: null,
      account: "",
      client: null,
      setAccount: (account: string) => {
        set(state => {
          state.account = account;
        });
      },

      initializeSdk: async (config: MidenSdkConfig) => {
        if (typeof window === "undefined") {
          set(state => {
            state.error = "Cannot instantiate Miden SDK client outside of browser environment";
          });
          return;
        }

        set(state => {
          state.isLoading = true;
          state.error = null;
          state.config = { ...state.config, ...config };
        });

        try {
          const { WebClient } = await import("@demox-labs/miden-sdk");
          const client = await WebClient.createClient(NODE_ENDPOINT);
          console.log("Miden SDK client initialized:", client);

          set(state => {
            state.error = null;
            state.client = client;
          });

          await get().syncState(client);
          set(state => {
            state.isLoading = false;
          });
        } catch (error) {
          console.error("Miden SDK initialization error:", error);
          set(state => {
            state.error = error instanceof Error ? error.message : "Failed to initialize Miden SDK client";
            state.isLoading = false;
          });
        }
      },

      syncState: async (client: any) => {
        if (!client) {
          console.warn("Cannot sync state: client not initialized");
          return;
        }

        try {
          const value = await client.syncState();
          set(state => {
            state.blockNum = value.blockNum();
            state.error = null;
          });
        } catch (error) {
          console.error("Error syncing Miden SDK client state:", error);
          set(state => {
            state.error = error instanceof Error ? error.message : "Failed to sync state";
          });
        }
      },
    })),
  );
