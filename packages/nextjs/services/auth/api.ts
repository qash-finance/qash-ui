export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  user: {
    id: number;
    email: string;
    isActive: boolean;
    createdAt: Date;
    lastLogin: Date | null;
  };
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
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

export class EmailAuthApi {
  private backendUrl: string;

  constructor() {
    this.backendUrl = (process.env.NEXT_PUBLIC_SERVER_URL || "").replace(/\/$/, "");
  }

  /**
   * Send OTP to email
   */
  async sendOtp(email: string): Promise<SendOtpResponse> {
    const response = await fetch(`${this.backendUrl}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "Failed to send OTP",
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  /**
   * Verify OTP and authenticate
   */
  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse & { accessToken: string; refreshToken: string }> {
    const response = await fetch(`${this.backendUrl}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "Failed to verify OTP",
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await fetch(`${this.backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "Failed to refresh token",
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  /**
   * Logout
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const response = await fetch(`${this.backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
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

/**
   * Check authentication status
   */
  async getMe(accessToken: string): Promise<AuthMeResponse> {
    const response = await fetch(`${this.backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
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
}
