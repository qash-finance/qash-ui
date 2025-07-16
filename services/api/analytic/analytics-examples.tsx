// =============================================================================
// SETUP EXAMPLES - How to integrate analytics into your Next.js app
// =============================================================================

// 1. In your root layout (app/layout.tsx or _app.tsx)
import { AnalyticsProvider } from './analytics-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analyticsConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY, // Optional
    enableAutoTracking: true,
    enablePageTracking: true,
    enableErrorTracking: true,
    sessionTimeout: 30, // 30 minutes
  };

  return (
    <html lang="en">
      <body>
        <AnalyticsProvider config={analyticsConfig}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}

// =============================================================================
// DASHBOARD COMPONENT EXAMPLE
// =============================================================================

import { useAnalyticsDashboard, useActiveSessions } from './use-analytics';

export function AnalyticsDashboard() {
  const { data, loading, error, refetch } = useAnalyticsDashboard(
    undefined, // startDate
    undefined, // endDate
    60000, // refresh every minute
  );

  const { sessions } = useActiveSessions();

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Users</h3>
          <p>{data?.summary?.totalUsers || 0}</p>
        </div>

        <div className="metric-card">
          <h3>Daily Active Users</h3>
          <p>{data?.summary?.dailyActiveUsers || 0}</p>
        </div>

        <div className="metric-card">
          <h3>Monthly Active Users</h3>
          <p>{data?.summary?.monthlyActiveUsers || 0}</p>
        </div>

        <div className="metric-card">
          <h3>Active Sessions</h3>
          <p>{sessions.length}</p>
        </div>
      </div>

      <div className="charts-section">
        <h2>Page Views Over Time</h2>
        {data?.timeSeriesData?.map((item, index) => (
          <div key={index} className="chart-item">
            {item.date}: {item.pageViews} page views
          </div>
        ))}
      </div>

      <div className="endpoints-section">
        <h2>Most Used Endpoints</h2>
        {data?.endpointMetrics?.mostUsedEndpoints?.map((endpoint, index) => (
          <div key={index} className="endpoint-item">
            {endpoint.method} {endpoint.endpoint}: {endpoint.callCount} calls
          </div>
        ))}
      </div>

      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}

// =============================================================================
// TRANSACTION TRACKING EXAMPLE
// =============================================================================

import { useAnalyticsTracking } from './use-analytics';

export function TransactionComponent() {
  const {
    trackGiftTransaction,
    trackGroupPayment,
    trackPaymentRequest,
    trackButtonClick,
    trackError,
  } = useAnalyticsTracking();

  const handleSendGift = async (giftData: any) => {
    try {
      trackButtonClick('send_gift_button');

      // Your gift sending logic here
      const result = await sendGiftAPI(giftData);

      // Track the successful transaction
      trackGiftTransaction({
        token: giftData.token,
        amount: giftData.amount,
        senderAddress: giftData.senderAddress,
        receiverAddress: giftData.receiverAddress,
        giftId: result.giftId,
        metadata: {
          giftType: 'birthday',
          message: giftData.message,
        },
      });
    } catch (error) {
      trackError(error, {
        action: 'send_gift',
        giftData,
      });
    }
  };

  const handleGroupPayment = async (paymentData: any) => {
    try {
      trackButtonClick('group_payment_button');

      const result = await createGroupPaymentAPI(paymentData);

      trackGroupPayment({
        token: paymentData.token,
        amount: paymentData.amount,
        senderAddress: paymentData.senderAddress,
        groupId: result.groupId,
        metadata: {
          groupName: paymentData.groupName,
          splitType: paymentData.splitType,
        },
      });
    } catch (error) {
      trackError(error, {
        action: 'group_payment',
        paymentData,
      });
    }
  };

  return (
    <div className="transaction-component">
      <button onClick={() => handleSendGift(giftData)}>Send Gift</button>
      <button onClick={() => handleGroupPayment(paymentData)}>
        Create Group Payment
      </button>
    </div>
  );
}

// =============================================================================
// WALLET CONNECTION EXAMPLE
// =============================================================================

import { useSessionManager, useAnalyticsTracking } from './use-analytics';

export function WalletConnectionComponent() {
  const { loginUser, logoutUser, userAddress, isTracking } =
    useSessionManager();
  const { trackWalletConnection, trackWalletDisconnection } =
    useAnalyticsTracking();

  const handleWalletConnect = async (walletAddress: string) => {
    try {
      await loginUser(walletAddress);
      trackWalletConnection(walletAddress, 'MetaMask'); // or detect wallet type
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      trackWalletDisconnection();
      await logoutUser();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <div className="wallet-connection">
      {userAddress ? (
        <div>
          <p>Connected: {userAddress}</p>
          <p>Tracking: {isTracking ? 'Active' : 'Inactive'}</p>
          <button onClick={handleWalletDisconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => handleWalletConnect('0x1234...')}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

// =============================================================================
// FORM TRACKING EXAMPLE
// =============================================================================

import { useAnalyticsTracking } from './use-analytics';

export function ContactForm() {
  const { trackFormSubmit, trackButtonClick } = useAnalyticsTracking();

  const handleSubmit = async (formData: any) => {
    trackFormSubmit('contact_form', {
      fields: Object.keys(formData),
      hasEmail: !!formData.email,
      hasPhone: !!formData.phone,
    });

    // Submit form logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button
        type="submit"
        onClick={() => trackButtonClick('contact_form_submit')}
      >
        Submit
      </button>
    </form>
  );
}

// =============================================================================
// PAGE PERFORMANCE TRACKING EXAMPLE
// =============================================================================

import { usePagePerformance } from './use-analytics';

export function PageWithPerformanceTracking() {
  const { pageLoadTime } = usePagePerformance();

  return (
    <div>
      <h1>My Page</h1>
      {pageLoadTime && <p>Page loaded in {pageLoadTime.toFixed(2)}ms</p>}
    </div>
  );
}

// =============================================================================
// OFFLINE ANALYTICS EXAMPLE
// =============================================================================

import { useOfflineAnalytics } from './use-analytics';
import { AnalyticsEventType } from './analytics-types';

export function OfflineCapableComponent() {
  const { isOnline, pendingEventsCount, trackEvent } = useOfflineAnalytics();

  const handleAction = () => {
    trackEvent({
      eventType: AnalyticsEventType.ENDPOINT_CALL,
      metadata: {
        action: 'offline_action',
        timestamp: Date.now(),
      },
    });
  };

  return (
    <div>
      <div className="connection-status">
        Status: {isOnline ? 'Online' : 'Offline'}
        {pendingEventsCount > 0 && (
          <span> - {pendingEventsCount} events pending</span>
        )}
      </div>
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
}

// =============================================================================
// REPORT GENERATION EXAMPLE
// =============================================================================

import { useAnalytics } from './analytics-context';

export function ReportsComponent() {
  const { generateReport } = useAnalytics();

  const downloadReport = async (format: 'json' | 'csv' | 'xlsx') => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const now = new Date();

      const report = await generateReport({
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        format,
        reportType: 'monthly',
        metrics: ['users', 'sessions', 'pageViews', 'transactions'],
      });

      // Handle file download
      if (report instanceof Blob) {
        const url = window.URL.createObjectURL(report);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div className="reports-component">
      <h2>Download Reports</h2>
      <button onClick={() => downloadReport('json')}>Download JSON</button>
      <button onClick={() => downloadReport('csv')}>Download CSV</button>
      <button onClick={() => downloadReport('xlsx')}>Download Excel</button>
    </div>
  );
}

// =============================================================================
// ADVANCED CUSTOM TRACKING EXAMPLE
// =============================================================================

import { useAnalytics } from './analytics-context';
import { AnalyticsEventType } from './analytics-types';

export function AdvancedTrackingExample() {
  const { trackEvent, trackPageView } = useAnalytics();

  const trackCustomEvent = () => {
    trackEvent({
      eventType: AnalyticsEventType.ENDPOINT_CALL,
      metadata: {
        action: 'custom_feature_used',
        featureName: 'advanced_calculator',
        inputValues: {
          amount: 100,
          currency: 'USD',
        },
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
    });
  };

  const trackModalView = (modalName: string) => {
    trackPageView({
      page: `/modal/${modalName}`,
      timeSpent: 0, // Will be updated when modal closes
    });
  };

  return (
    <div>
      <button onClick={trackCustomEvent}>Use Advanced Feature</button>
      <button onClick={() => trackModalView('help')}>Open Help Modal</button>
    </div>
  );
}

// =============================================================================
// REAL-TIME ANALYTICS DISPLAY
// =============================================================================

import { useActiveSessions } from './use-analytics';

export function RealTimeAnalytics() {
  const { sessions, loading, error } = useActiveSessions(
    undefined, // all users
    5000, // refresh every 5 seconds
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="real-time-analytics">
      <h2>Real-Time Analytics</h2>
      <div className="active-sessions">
        <h3>Active Sessions ({sessions.length})</h3>
        {sessions.map((session) => (
          <div key={session.id} className="session-item">
            <p>User: {session.userAddress || 'Anonymous'}</p>
            <p>Duration: {Math.floor(session.duration / 60)} minutes</p>
            <p>Page Views: {session.pageViews}</p>
            <p>API Calls: {session.apiCalls}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
