export enum AnalyticsEventType {
  PAGE_VIEW = "page_view",
  ENDPOINT_CALL = "endpoint_call",
  USER_SESSION = "user_session",
  TRANSACTION = "transaction",
  GIFT = "gift",
  GROUP_PAYMENT = "group_payment",
  REQUEST_PAYMENT = "request_payment",
}

export interface TrackEventDto {
  eventType: AnalyticsEventType;
  userAddress?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface TrackPageViewDto {
  page: string;
  userAddress?: string;
  sessionId?: string;
  timeSpent?: number;
}

export interface StartSessionDto {
  userAddress?: string;
  userAgent?: string;
  referer?: string;
}

export interface EndSessionDto {
  sessionId: string;
}

export interface TrackTransactionDto {
  transactionType: string;
  token: string;
  amount: string;
  senderAddress: string;
  receiverAddress?: string;
  status?: string;
  entityId?: number;
  additionalData?: Record<string, any>;
}

export interface GenerateReportDto {
  startDate: string;
  endDate: string;
  reportType?: "daily" | "weekly" | "monthly";
  metrics?: string[];
  format?: "json" | "csv" | "xlsx";
}

export interface AnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
  userAddress?: string;
  eventType?: AnalyticsEventType;
  groupBy?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsReport {
  summary: {
    totalUsers: number;
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
    totalPageViews: number;
    totalApiCalls: number;
    totalTransactions: number;
    totalVolume: Record<string, string>;
  };
  userMetrics: {
    newUsers: number;
    returningUsers: number;
    userRetentionRate: number;
    avgTimeSpentPerUser: number;
  };
  endpointMetrics: {
    mostUsedEndpoints: Array<{
      endpoint: string;
      method: string;
      callCount: number;
      avgResponseTime: number;
      errorRate: number;
    }>;
    slowestEndpoints: Array<{
      endpoint: string;
      method: string;
      avgResponseTime: number;
    }>;
  };
  transactionMetrics: {
    volumeByToken: Record<
      string,
      {
        amount: string;
        count: number;
      }
    >;
    transactionsByType: Record<string, number>;
    dailyVolume: Array<{
      date: string;
      volume: Record<string, string>;
      count: number;
    }>;
  };
  timeSeriesData: Array<{
    date: string;
    activeUsers: number;
    pageViews: number;
    apiCalls: number;
    transactions: number;
  }>;
}

export interface AnalyticsEvent {
  id: number;
  eventType: AnalyticsEventType;
  userAddress: string | null;
  sessionId: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  createdAt: string;
}

export interface AnalyticsSession {
  id: number;
  sessionId: string;
  userAddress: string | null;
  startTime: string;
  endTime: string | null;
  duration: number;
  pageViews: number;
  apiCalls: number;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AnalyticsConfig {
  baseUrl: string;
  apiKey?: string;
  enableAutoTracking?: boolean;
  enablePageTracking?: boolean;
  enableErrorTracking?: boolean;
  sessionTimeout?: number; // in minutes
}

export interface AnalyticsContextType {
  config: AnalyticsConfig;
  sessionId: string | null;
  userAddress: string | null;
  isTracking: boolean;
  startSession: (userAddress?: string) => Promise<void>;
  endSession: () => Promise<void>;
  trackEvent: (event: TrackEventDto) => Promise<void>;
  trackPageView: (pageView: TrackPageViewDto) => Promise<void>;
  trackTransaction: (transaction: TrackTransactionDto) => Promise<void>;
  fetchDashboardData: (startDate?: string, endDate?: string) => Promise<AnalyticsReport>;
  fetchEvents: (query?: AnalyticsQueryDto) => Promise<AnalyticsEvent[]>;
  fetchActiveSessions: (userAddress?: string) => Promise<AnalyticsSession[]>;
  generateReport: (report: GenerateReportDto) => Promise<AnalyticsReport | Blob>;
}
