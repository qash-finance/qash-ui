import { AuthStorage } from "./storage";

export interface InitiateAuthRequest {
  walletAddress: string;
  deviceFingerprint?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  metadata?: Record<string, any>;
}

export interface InitiateAuthResponse {
  challengeCode: string;
  expiresAt: string;
  instructions: string;
}

export interface RegisterKeyRequest {
  walletAddress: string;
  publicKey: string;
  challengeCode: string;
  challengeResponse: string;
  deviceFingerprint?: string;
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  expirationHours?: number;
}

export interface RegisterKeyResponse {
  publicKey: string;
  expiresAt: string;
  status: string;
}

export interface AuthenticateRequest {
  walletAddress: string;
  publicKey: string;
  signature: string;
  timestamp: string;
  deviceFingerprint?: string;
}

export interface AuthenticateResponse {
  sessionToken: string;
  expiresAt: string;
  walletAddress: string;
  publicKey: string;
}

export interface RefreshTokenRequest {
  sessionToken: string;
  walletAddress: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export class WalletAuthApi {
  private baseUrl: string;
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Set default headers for all requests
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Get authentication headers if available
   */
  private getAuthHeaders(): Record<string, string> {
    const auth = AuthStorage.getAuth();
    if (auth && auth.sessionToken && !AuthStorage.isSessionExpired(auth.expiresAt)) {
      return {
        Authorization: `Bearer ${auth.sessionToken}`,
      };
    }
    return {};
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}, useAuth: boolean = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...(useAuth ? this.getAuthHeaders() : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "An error occurred",
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  /**
   * Initiate authentication process
   */
  async initiateAuth(request: InitiateAuthRequest): Promise<InitiateAuthResponse> {
    return this.makeRequest<InitiateAuthResponse>("/wallet-auth/initiate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Register a new key pair
   */
  async registerKey(request: RegisterKeyRequest): Promise<RegisterKeyResponse> {
    return this.makeRequest<RegisterKeyResponse>("/wallet-auth/register-key", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Authenticate with registered key
   */
  async authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse> {
    return this.makeRequest<AuthenticateResponse>("/wallet-auth/authenticate", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(request: RefreshTokenRequest): Promise<AuthenticateResponse> {
    return this.makeRequest<AuthenticateResponse>("/wallet-auth/refresh", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Validate session token
   */
  async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    walletAddress: string | null;
    publicKey: string | null;
  }> {
    return this.makeRequest<{
      valid: boolean;
      walletAddress: string | null;
      publicKey: string | null;
    }>(`/wallet-auth/validate?sessionToken=${encodeURIComponent(sessionToken)}`);
  }

  /**
   * Revoke keys
   */
  async revokeKeys(walletAddress: string, publicKey?: string): Promise<{ revokedCount: number }> {
    return this.makeRequest<{ revokedCount: number }>(
      "/wallet-auth/revoke-keys",
      {
        method: "POST",
        body: JSON.stringify({ walletAddress, publicKey }),
      },
      true,
    );
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionToken: string): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>(
      "/wallet-auth/revoke-session",
      {
        method: "POST",
        body: JSON.stringify({ sessionToken }),
      },
      true,
    );
  }

  /**
   * Get keys for wallet
   */
  async getKeys(walletAddress: string): Promise<any[]> {
    return this.makeRequest<any[]>(`/wallet-auth/keys?walletAddress=${encodeURIComponent(walletAddress)}`, {}, true);
  }

  /**
   * Get sessions for wallet
   */
  async getSessions(walletAddress: string, includeInactive?: boolean): Promise<any[]> {
    const params = new URLSearchParams({ walletAddress });
    if (includeInactive) params.append("includeInactive", "true");

    return this.makeRequest<any[]>(`/wallet-auth/sessions?${params}`, {}, true);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    return this.makeRequest<{
      status: string;
      timestamp: string;
      service: string;
    }>("/wallet-auth/health");
  }
}

/**
 * Create API client with automatic auth headers
 */
export function createAuthenticatedClient(baseUrl: string) {
  const api = new WalletAuthApi(baseUrl);

  // Intercept fetch to add auth headers automatically
  const originalFetch = global.fetch;
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Only add auth headers to our API calls
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith(baseUrl)) {
      const auth = AuthStorage.getAuth();
      if (auth && auth.sessionToken && !AuthStorage.isSessionExpired(auth.expiresAt)) {
        init = init || {};
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${auth.sessionToken}`,
        };
      }
    }

    return originalFetch(input, init);
  };

  return api;
}
