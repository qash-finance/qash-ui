export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user?: {
    id: number;
    uuid: string;
    email: string;
    role: "USER" | "ADMIN" | string;
    isActive: boolean;
    createdAt: Date;
    lastLogin: Date | null;
    updatedAt?: Date;
    teamMembership?: {
      id: number;
      uuid: string;
      firstName: string;
      lastName: string;
      position?: string | null;
      profilePicture?: string | null;
      role: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      companyId: number;
      joinedAt?: Date | null;
      company?: {
        id: number;
        uuid?: string;
        companyName?: string;
        registrationNumber?: string;
        verificationStatus?: string;
        isActive?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
      };
    } | null;
  };
}

export interface SetParaJwtCookieResponse {
  message: string;
  user: AuthMeResponse["user"];
}

export class ParaAuthApi {
  private backendUrl: string;

  constructor() {
    this.backendUrl = (process.env.NEXT_PUBLIC_SERVER_URL || "").replace(/\/$/, "");
  }

  /**
   * Set Para JWT cookie on backend
   */
  async setParaJwtCookie(paraJwtToken: string): Promise<SetParaJwtCookieResponse> {
    const response = await fetch(`${this.backendUrl}/auth/set-cookie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: paraJwtToken }),
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "Failed to set Para JWT cookie",
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  /**
   * Check authentication status (cookie-based)
   */
  async getMe(): Promise<AuthMeResponse> {
    const response = await fetch(`${this.backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for Para auth
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    const data = await response.json();
    const user = (data as any)?.user ?? data;
    return {
      authenticated: true,
      user,
    };
  }

  /**
   * Logout (cookie-based for Para auth)
   */
  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${this.backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "Failed to logout",
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }
}
