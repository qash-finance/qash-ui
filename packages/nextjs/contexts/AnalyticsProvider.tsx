"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AnalyticsConfig,
  AnalyticsContextType,
  TrackEventDto,
  TrackPageViewDto,
  TrackTransactionDto,
  AnalyticsQueryDto,
  GenerateReportDto,
} from "../types/analytics";
import { AnalyticsService, getBrowserInfo, createTimeTracker } from "../services/api/analytics";

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  config: AnalyticsConfig;
}

export function AnalyticsProvider({ children, config }: AnalyticsProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [analyticsService] = useState(() => new AnalyticsService(config));
  const [pageTimeTracker, setPageTimeTracker] = useState(() => createTimeTracker());
  const [currentPage, setCurrentPage] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const initAnalytics = async () => {
      try {
        const existingSessionId = localStorage.getItem("analytics_session_id");
        const sessionStartTime = localStorage.getItem("analytics_session_start");
        const sessionTimeout = config.sessionTimeout || 30; // 30 minutes default

        if (existingSessionId && sessionStartTime) {
          const timeDiff = Date.now() - parseInt(sessionStartTime);
          const timeoutMs = sessionTimeout * 60 * 1000;

          if (timeDiff < timeoutMs) {
            setSessionId(existingSessionId);
            setIsTracking(true);
            return;
          } else {
            localStorage.removeItem("analytics_session_id");
            localStorage.removeItem("analytics_session_start");
          }
        }

        if (config.enableAutoTracking) {
          await startSession();
        }
      } catch (error) {
        console.error("Failed to initialize analytics:", error);
      }
    };

    initAnalytics();
  }, [config.enableAutoTracking, config.sessionTimeout]);

  useEffect(() => {
    if (!config.enablePageTracking || !sessionId) return;

    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      if (!userAddress) return;

      if (currentPage && currentPage !== currentPath) {
        trackPageView({
          page: currentPage,
          sessionId,
          userAddress,
          timeSpent: pageTimeTracker.getTimeSpent(),
        }).catch(console.error);
      }

      setCurrentPage(currentPath);
      setPageTimeTracker(createTimeTracker());

      trackPageView({
        page: currentPath,
        sessionId,
        userAddress,
      }).catch(console.error);
    };

    const initialPath = window.location.pathname;
    setCurrentPage(initialPath);
    trackPageView({
      page: initialPath,
      sessionId,
      userAddress: userAddress || undefined,
    }).catch(console.error);

    // Listen for route changes
    const originalPush = router.push;
    router.push = (...args) => {
      handleRouteChange();
      return originalPush.apply(router, args);
    };

    return () => {
      router.push = originalPush;
    };
  }, [sessionId, userAddress, currentPage, config.enablePageTracking, pageTimeTracker, router]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentPage && sessionId) {
        const data = {
          page: currentPage,
          sessionId,
          userAddress,
          timeSpent: pageTimeTracker.getTimeSpent(),
        };

        const sessionData = {
          sessionId,
        };
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPage, sessionId, userAddress, pageTimeTracker, config.baseUrl]);

  const startSession = useCallback(
    async (address?: string) => {
      try {
        const browserInfo = getBrowserInfo();
        const response = await analyticsService.startSession({
          userAddress: address,
          ...browserInfo,
        });

        const newSessionId = response.sessionId;
        setSessionId(newSessionId);
        setUserAddress(address || null);
        setIsTracking(true);

        localStorage.setItem("analytics_session_id", newSessionId);
        localStorage.setItem("analytics_session_start", Date.now().toString());

        if (address) {
          localStorage.setItem("analytics_user_address", address);
        }
      } catch (error) {
        console.error("Failed to start analytics session:", error);
      }
    },
    [analyticsService],
  );

  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await analyticsService.endSession({ sessionId });
      setSessionId(null);
      setUserAddress(null);
      setIsTracking(false);

      localStorage.removeItem("analytics_session_id");
      localStorage.removeItem("analytics_session_start");
      localStorage.removeItem("analytics_user_address");
    } catch (error) {
      console.error("Failed to end analytics session:", error);
    }
  }, [sessionId, analyticsService]);

  const trackEvent = useCallback(
    async (event: TrackEventDto) => {
      try {
        await analyticsService.trackEvent({
          ...event,
          sessionId: sessionId || undefined,
          userAddress: userAddress || undefined,
        });
      } catch (error) {
        console.error("Failed to track event:", error);
      }
    },
    [analyticsService, sessionId, userAddress],
  );

  const trackPageView = useCallback(
    async (pageView: TrackPageViewDto) => {
      try {
        await analyticsService.trackPageView({
          ...pageView,
          sessionId: sessionId || undefined,
          userAddress: userAddress || undefined,
        });
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    },
    [analyticsService, sessionId, userAddress],
  );

  const trackTransaction = useCallback(
    async (transaction: TrackTransactionDto) => {
      try {
        await analyticsService.trackTransaction(transaction);
      } catch (error) {
        console.error("Failed to track transaction:", error);
      }
    },
    [analyticsService],
  );

  const fetchDashboardData = useCallback(
    async (startDate?: string, endDate?: string) => {
      return analyticsService.getDashboardData(startDate, endDate);
    },
    [analyticsService],
  );

  const fetchEvents = useCallback(
    async (query?: AnalyticsQueryDto) => {
      return analyticsService.getEvents(query);
    },
    [analyticsService],
  );

  const fetchActiveSessions = useCallback(
    async (userAddress?: string) => {
      return analyticsService.getActiveSessions(userAddress);
    },
    [analyticsService],
  );

  const generateReport = useCallback(
    async (report: GenerateReportDto) => {
      return analyticsService.generateReport(report);
    },
    [analyticsService],
  );

  const value: AnalyticsContextType = {
    config,
    sessionId,
    userAddress,
    isTracking,
    startSession,
    endSession,
    trackEvent,
    trackPageView,
    trackTransaction,
    fetchDashboardData,
    fetchEvents,
    fetchActiveSessions,
    generateReport,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
