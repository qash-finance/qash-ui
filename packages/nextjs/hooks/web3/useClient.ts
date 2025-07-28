"use client";
import { NODE_ENDPOINT } from "@/services/utils/constant";
import { WebClient } from "@demox-labs/miden-sdk";

let client: WebClient | null = null;

export function useClient() {
  async function getClient(): Promise<WebClient> {
    if (!client) {
      const { WebClient } = await import("@demox-labs/miden-sdk");
      client = await WebClient.createClient(NODE_ENDPOINT);
    }
    await client.syncState();
    return client;
  }

  return { getClient };
}
