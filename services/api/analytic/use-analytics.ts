import { useCallback, useEffect, useState } from 'react';
import { useAnalytics } from './analytics-context';
import {
  AnalyticsEventType,
  TrackEventDto,
  TrackTransactionDto,
} from './analytics-types';

export function useAnalyticsTracking() {
  const analytics = useAnalytics();

  // Convenience functions for common tracking scenarios
  const trackButtonClick = useCallback(
    (buttonName: string, metadata?: Record<string, any>) => {
      analytics.trackEvent({
        eventType: AnalyticsEventType.ENDPOINT_CALL,
        metadata: {
          action: 'button_click',
          buttonName,
          ...metadata,
        },
      });
    },
    [analytics],
  );

  const trackFormSubmit = useCallback(
    (formName: string, formData?: Record<string, any>) => {
      analytics.trackEvent({
        eventType: AnalyticsEventType.ENDPOINT_CALL,
        metadata: {
          action: 'form_submit',
          formName,
          formData,
        },
      });
    },
    [analytics],
  );

  const trackWalletConnection = useCallback(
    (walletAddress: string, walletType: string) => {
      analytics.trackEvent({
        eventType: AnalyticsEventType.USER_SESSION,
        metadata: {
          action: 'wallet_connect',
          walletAddress,
          walletType,
        },
      });
    },
    [analytics],
  );

  const trackWalletDisconnection = useCallback(() => {
    analytics.trackEvent({
      eventType: AnalyticsEventType.USER_SESSION,
      metadata: {
        action: 'wallet_disconnect',
      },
    });
  }, [analytics]);

  const trackGiftTransaction = useCallback(
    (transaction: {
      token: string;
      amount: string;
      senderAddress: string;
      receiverAddress: string;
      giftId?: number;
      metadata?: Record<string, any>;
    }) => {
      analytics.trackTransaction({
        transactionType: 'gift',
        token: transaction.token,
        amount: transaction.amount,
        senderAddress: transaction.senderAddress,
        receiverAddress: transaction.receiverAddress,
        entityId: transaction.giftId,
        additionalData: transaction.metadata,
      });
    },
    [analytics],
  );

  const trackGroupPayment = useCallback(
    (transaction: {
      token: string;
      amount: string;
      senderAddress: string;
      groupId: number;
      metadata?: Record<string, any>;
    }) => {
      analytics.trackTransaction({
        transactionType: 'group_payment',
        token: transaction.token,
        amount: transaction.amount,
        senderAddress: transaction.senderAddress,
        entityId: transaction.groupId,
        additionalData: transaction.metadata,
      });
    },
    [analytics],
  );

  const trackPaymentRequest = useCallback(
    (transaction: {
      token: string;
      amount: string;
      senderAddress: string;
      receiverAddress?: string;
      requestId: number;
      metadata?: Record<string, any>;
    }) => {
      analytics.trackTransaction({
        transactionType: 'request_payment',
        token: transaction.token,
        amount: transaction.amount,
        senderAddress: transaction.senderAddress,
        receiverAddress: transaction.receiverAddress,
        entityId: transaction.requestId,
        additionalData: transaction.metadata,
      });
    },
    [analytics],
  );

  const trackError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      analytics.trackEvent({
        eventType: AnalyticsEventType.ENDPOINT_CALL,
        metadata: {
          action: 'error',
          errorMessage: error.message,
          errorStack: error.stack,
          context,
        },
      });
    },
    [analytics],
  );

  return {
    ...analytics,
    trackButtonClick,
    trackFormSubmit,
    trackWalletConnection,
    trackWalletDisconnection,
    trackGiftTransaction,
    trackGroupPayment,
    trackPaymentRequest,
    trackError,
  };
}

// Hook for dashboard data with automatic refresh
export function useAnalyticsDashboard(
  startDate?: string,
  endDate?: string,
  refreshInterval?: number,
) {
  const analytics = useAnalytics();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analytics.fetchDashboardData(startDate, endDate);
      setDashboardData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data',
      );
    } finally {
      setLoading(false);
    }
  }, [analytics, startDate, endDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchDashboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchDashboard, refreshInterval]);

  return {
    data: dashboardData,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

// Hook for real-time active sessions
export function useActiveSessions(
  userAddress?: string,
  refreshInterval: number = 30000,
) {
  const analytics = useAnalytics();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analytics.fetchActiveSessions(userAddress);
      setSessions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch active sessions',
      );
    } finally {
      setLoading(false);
    }
  }, [analytics, userAddress]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    const interval = setInterval(fetchSessions, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchSessions, refreshInterval]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
  };
}

// Hook for session management with user address
export function useSessionManager() {
  const analytics = useAnalytics();
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const loginUser = useCallback(
    async (address: string) => {
      setUserAddress(address);
      await analytics.startSession(address);
    },
    [analytics],
  );

  const logoutUser = useCallback(async () => {
    await analytics.endSession();
    setUserAddress(null);
  }, [analytics]);

  return {
    userAddress: analytics.userAddress || userAddress,
    sessionId: analytics.sessionId,
    isTracking: analytics.isTracking,
    loginUser,
    logoutUser,
  };
}

// Hook for page performance tracking
export function usePagePerformance() {
  const analytics = useAnalytics();
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setPageLoadTime(loadTime);

      analytics.trackEvent({
        eventType: AnalyticsEventType.PAGE_VIEW,
        metadata: {
          action: 'page_load',
          loadTime: loadTime,
          page: window.location.pathname,
        },
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [analytics]);

  return {
    pageLoadTime,
  };
}

// Hook for event queuing when offline
export function useOfflineAnalytics() {
  const analytics = useAnalytics();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingEvents, setPendingEvents] = useState<TrackEventDto[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process pending events when coming back online
  useEffect(() => {
    if (isOnline && pendingEvents.length > 0) {
      const processPendingEvents = async () => {
        for (const event of pendingEvents) {
          try {
            await analytics.trackEvent(event);
          } catch (error) {
            console.error('Failed to process pending event:', error);
          }
        }
        setPendingEvents([]);
      };

      processPendingEvents();
    }
  }, [isOnline, pendingEvents, analytics]);

  const trackEventWithQueue = useCallback(
    async (event: TrackEventDto) => {
      if (isOnline) {
        return analytics.trackEvent(event);
      } else {
        setPendingEvents((prev) => [...prev, event]);
      }
    },
    [isOnline, analytics],
  );

  return {
    isOnline,
    pendingEventsCount: pendingEvents.length,
    trackEvent: trackEventWithQueue,
  };
}
