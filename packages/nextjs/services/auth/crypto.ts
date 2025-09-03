import { DeviceType } from "@/types/authentication";

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class WalletCrypto {
  /**
   * Generate a new key pair for wallet authentication using Web Crypto API
   */
  static async generateKeyPair(): Promise<KeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    );

    const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: Array.from(new Uint8Array(publicKeyBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join(""),
      privateKey: Array.from(new Uint8Array(privateKeyBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join(""),
    };
  }

  /**
   * Sign a message with the private key using Web Crypto API
   */
  static async sign(message: string, privateKey: string): Promise<string> {
    try {
      const privateKeyBuffer = new Uint8Array(privateKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      const key = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
          name: "RSA-PSS",
          hash: "SHA-256",
        },
        false,
        ["sign"],
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const signature = await crypto.subtle.sign(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        key,
        data,
      );

      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw new Error("Failed to sign message");
    }
  }

  /**
   * Verify a signature using Web Crypto API
   */
  static async verify(message: string, signature: string, publicKey: string): Promise<boolean> {
    try {
      const publicKeyBuffer = new Uint8Array(publicKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      const key = await crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
          name: "RSA-PSS",
          hash: "SHA-256",
        },
        false,
        ["verify"],
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const signatureBuffer = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

      return await crypto.subtle.verify(
        {
          name: "RSA-PSS",
          saltLength: 32,
        },
        key,
        signatureBuffer,
        data,
      );
    } catch (error) {
      console.error("Failed to verify signature:", error);
      return false;
    }
  }

  /**
   * Generate a challenge response using Web Crypto API
   */
  static async generateChallengeResponse(challengeCode: string, walletAddress: string): Promise<string> {
    const message = `${challengeCode}:${walletAddress}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Create a signature for authentication using Web Crypto API
   */
  static async createAuthSignature(walletAddress: string, timestamp: string, publicKey: string): Promise<string> {
    const message = `${walletAddress}:${timestamp}`;
    const encoder = new TextEncoder();

    // First hash the message
    const messageData = encoder.encode(message);
    const messageHashBuffer = await crypto.subtle.digest("SHA-256", messageData);
    const messageHash = Array.from(new Uint8Array(messageHashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Then hash the messageHash with publicKey
    const finalMessage = `${messageHash}:${publicKey}`;
    const finalData = encoder.encode(finalMessage);
    const finalHashBuffer = await crypto.subtle.digest("SHA-256", finalData);

    return Array.from(new Uint8Array(finalHashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Generate device fingerprint using Web Crypto API
   */
  static async generateDeviceFingerprint(): Promise<string> {
    const navigator = typeof window !== "undefined" ? window.navigator : null;
    if (!navigator) return "server";

    const components = [
      navigator.userAgent || "",
      navigator.language || "",
      navigator.platform || "",
      navigator.hardwareConcurrency?.toString() || "",
      (typeof screen !== "undefined" ? screen.width : 0).toString(),
      (typeof screen !== "undefined" ? screen.height : 0).toString(),
      new Date().getTimezoneOffset().toString(),
    ];

    const encoder = new TextEncoder();
    const data = encoder.encode(components.join("|"));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return hashHex.substring(0, 32);
  }

  /**
   * Get device type based on user agent
   */
  static getDeviceType(): DeviceType {
    if (typeof window === "undefined") return DeviceType.UNKNOWN;

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("mobile")) return DeviceType.MOBILE;
    if (userAgent.includes("tablet") || userAgent.includes("ipad")) return DeviceType.TABLET;
    if (userAgent.includes("desktop")) return DeviceType.DESKTOP;

    return DeviceType.UNKNOWN;
  }
}
