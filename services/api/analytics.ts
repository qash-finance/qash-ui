import {
  AnalyticsConfig,
  TrackEventDto,
  TrackPageViewDto,
  StartSessionDto,
  EndSessionDto,
  TrackTransactionDto,
  GenerateReportDto,
  AnalyticsQueryDto,
  AnalyticsReport,
  AnalyticsEvent,
  AnalyticsSession,
} from "../../types/analytics";

export class AnalyticsService {
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status} ${response.statusText}`);
    }

    // Handle blob responses (for file downloads)
    if (
      response.headers.get("content-type")?.includes("text/csv") ||
      response.headers.get("content-type")?.includes("application/vnd.openxmlformats")
    ) {
      return response.blob() as Promise<T>;
    }

    return response.json();
  }

  async trackEvent(event: TrackEventDto): Promise<void> {
    await this.makeRequest("/analytics/track/event", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  async trackPageView(pageView: TrackPageViewDto): Promise<void> {
    await this.makeRequest("/analytics/track/page-view", {
      method: "POST",
      body: JSON.stringify(pageView),
    });
  }

  async trackTransaction(transaction: TrackTransactionDto): Promise<void> {
    await this.makeRequest("/analytics/track/transaction", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  async startSession(session: StartSessionDto): Promise<{ sessionId: string }> {
    return this.makeRequest("/analytics/session/start", {
      method: "POST",
      body: JSON.stringify(session),
    });
  }

  async endSession(session: EndSessionDto): Promise<void> {
    await this.makeRequest("/analytics/session/end", {
      method: "POST",
      body: JSON.stringify(session),
    });
  }

  async getEvents(query?: AnalyticsQueryDto): Promise<AnalyticsEvent[]> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/analytics/events${params.toString() ? `?${params.toString()}` : ""}`;
    return this.makeRequest(endpoint);
  }

  async getActiveSessions(userAddress?: string): Promise<AnalyticsSession[]> {
    const params = new URLSearchParams();
    if (userAddress) {
      params.append("userAddress", userAddress);
    }

    const endpoint = `/analytics/sessions/active${params.toString() ? `?${params.toString()}` : ""}`;
    return this.makeRequest(endpoint);
  }

  async generateReport(report: GenerateReportDto): Promise<AnalyticsReport | Blob> {
    return this.makeRequest("/analytics/report/generate", {
      method: "POST",
      body: JSON.stringify(report),
    });
  }

  async getDashboardData(startDate?: string, endDate?: string): Promise<AnalyticsReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const endpoint = `/analytics/dashboard${params.toString() ? `?${params.toString()}` : ""}`;
    return this.makeRequest(endpoint);
  }

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    return this.makeRequest("/analytics/health");
  }
}

// Helper function to generate session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get browser information
export function getBrowserInfo() {
  if (typeof window === "undefined") return { userAgent: "", referer: "" };

  return {
    userAgent: navigator.userAgent,
    referer: document.referrer,
  };
}

// Helper function to format dates for API
export function formatDateForApi(date: Date): string {
  return date.toISOString();
}

// Helper function to calculate time spent on page
export function createTimeTracker() {
  const startTime = Date.now();

  return {
    getTimeSpent: () => Math.floor((Date.now() - startTime) / 1000),
    reset: () => Date.now(),
  };
}
