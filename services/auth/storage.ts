import { KeyPair } from './crypto';

export interface StoredAuth {
  walletAddress: string;
  keyPair: KeyPair;
  sessionToken: string;
  expiresAt: string;
  deviceFingerprint: string;
}

export interface StoredKey {
  walletAddress: string;
  keyPair: KeyPair;
  publicKey: string;
  expiresAt: string;
  deviceFingerprint: string;
  createdAt: string;
}

export class AuthStorage {
  private static readonly STORAGE_KEY = 'miden_wallet_auth';
  private static readonly KEYS_STORAGE_KEY = 'miden_wallet_keys';

  /**
   * Store authentication data
   */
  static storeAuth(auth: StoredAuth): void {
    try {
      if (typeof window !== 'undefined') {
        const encrypted = this.encrypt(JSON.stringify(auth));
        localStorage.setItem(this.STORAGE_KEY, encrypted);
      }
    } catch (error) {
      console.error('Failed to store auth:', error);
    }
  }

  /**
   * Retrieve authentication data
   */
  static getAuth(): StoredAuth | null {
    try {
      if (typeof window !== 'undefined') {
        const encrypted = localStorage.getItem(this.STORAGE_KEY);
        if (encrypted) {
          const decrypted = this.decrypt(encrypted);
          return JSON.parse(decrypted);
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve auth:', error);
      this.clearAuth();
      return null;
    }
  }

  /**
   * Clear authentication data
   */
  static clearAuth(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  }

  /**
   * Store key pair for a wallet
   */
  static storeKey(walletAddress: string, keyData: StoredKey): void {
    try {
      if (typeof window !== 'undefined') {
        const keys = this.getKeys();
        keys[walletAddress] = keyData;
        const encrypted = this.encrypt(JSON.stringify(keys));
        localStorage.setItem(this.KEYS_STORAGE_KEY, encrypted);
      }
    } catch (error) {
      console.error('Failed to store key:', error);
    }
  }

  /**
   * Retrieve key pair for a wallet
   */
  static getKey(walletAddress: string): StoredKey | null {
    try {
      const keys = this.getKeys();
      return keys[walletAddress] || null;
    } catch (error) {
      console.error('Failed to retrieve key:', error);
      return null;
    }
  }

  /**
   * Get all stored keys
   */
  static getKeys(): Record<string, StoredKey> {
    try {
      if (typeof window !== 'undefined') {
        const encrypted = localStorage.getItem(this.KEYS_STORAGE_KEY);
        if (encrypted) {
          const decrypted = this.decrypt(encrypted);
          return JSON.parse(decrypted);
        }
      }
      return {};
    } catch (error) {
      console.error('Failed to retrieve keys:', error);
      return {};
    }
  }

  /**
   * Remove key for a wallet
   */
  static removeKey(walletAddress: string): void {
    try {
      if (typeof window !== 'undefined') {
        const keys = this.getKeys();
        delete keys[walletAddress];
        const encrypted = this.encrypt(JSON.stringify(keys));
        localStorage.setItem(this.KEYS_STORAGE_KEY, encrypted);
      }
    } catch (error) {
      console.error('Failed to remove key:', error);
    }
  }

  /**
   * Clear all stored keys
   */
  static clearKeys(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.KEYS_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to clear keys:', error);
    }
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(expiresAt: string): boolean {
    try {
      const expiry = new Date(expiresAt);
      const now = new Date();
      // Add 1 minute buffer for network delays
      const buffer = 60 * 1000;
      return now.getTime() > expiry.getTime() - buffer;
    } catch (error) {
      console.error('Failed to check session expiry:', error);
      return true;
    }
  }

  /**
   * Simple encryption for local storage (in production, use proper encryption)
   */
  private static encrypt(data: string): string {
    try {
      // Simple base64 encoding - in production, use proper encryption
      return btoa(data);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      return data;
    }
  }

  /**
   * Simple decryption for local storage
   */
  private static decrypt(data: string): string {
    try {
      // Simple base64 decoding - in production, use proper decryption
      return atob(data);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return data;
    }
  }
}
