const EMAIL_STORAGE_KEY = "user_email";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class AuthStorage {
  /**
   * Store user email
   */
  static storeEmail(email: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(EMAIL_STORAGE_KEY, email);
      }
    } catch (error) {
      console.error("Failed to store email:", error);
    }
  }

  /**
   * Retrieve user email
   */
  static getEmail(): string | null {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(EMAIL_STORAGE_KEY);
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve email:", error);
      return null;
    }
  }

  /**
   * Store access token
   */
  static storeAccessToken(token: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      }
    } catch (error) {
      console.error("Failed to store access token:", error);
    }
  }

  /**
   * Retrieve access token
   */
  static getAccessToken(): string | null {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  static storeRefreshToken(token: string): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
    } catch (error) {
      console.error("Failed to store refresh token:", error);
    }
  }

  /**
   * Retrieve refresh token
   */
  static getRefreshToken(): string | null {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
      }
      return null;
    } catch (error) {
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  /**
   * Clear all auth data
   */
  static clearAuth(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(EMAIL_STORAGE_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error("Failed to clear auth:", error);
    }
  }
}
