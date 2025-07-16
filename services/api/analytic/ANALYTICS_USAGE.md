# Analytics Hook for Next.js Frontend

This package provides comprehensive analytics tracking for your Next.js application, designed to work with your backend analytics module.

## 📁 Files Overview

- `analytics-types.ts` - TypeScript types and interfaces
- `analytics-service.ts` - API service for backend communication
- `analytics-context.tsx` - React context provider
- `use-analytics.ts` - Custom hooks for analytics functionality
- `analytics-examples.tsx` - Usage examples and components

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install react
# or
yarn add react
```

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_API_KEY=your-api-key-here
```

### 3. Setup in Root Layout

For App Router (`app/layout.tsx`):

```tsx
import { AnalyticsProvider } from './lib/analytics/analytics-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analyticsConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
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
```

For Pages Router (`pages/_app.tsx`):

```tsx
import type { AppProps } from 'next/app';
import { AnalyticsProvider } from '../lib/analytics/analytics-context';

const analyticsConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
  enableAutoTracking: true,
  enablePageTracking: true,
  enableErrorTracking: true,
  sessionTimeout: 30,
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AnalyticsProvider config={analyticsConfig}>
      <Component {...pageProps} />
    </AnalyticsProvider>
  );
}
```

## 🎯 Core Hooks

### useAnalytics()

Basic analytics functionality:

```tsx
import { useAnalytics } from '@/lib/analytics/analytics-context';

function MyComponent() {
  const {
    sessionId,
    userAddress,
    isTracking,
    startSession,
    endSession,
    trackEvent,
    trackPageView,
    trackTransaction,
    fetchDashboardData,
  } = useAnalytics();

  const handleLogin = async (walletAddress: string) => {
    await startSession(walletAddress);
  };

  return (
    <div>
      <p>Session: {sessionId}</p>
      <p>User: {userAddress}</p>
      <p>Status: {isTracking ? 'Active' : 'Inactive'}</p>
    </div>
  );
}
```

### useAnalyticsTracking()

Enhanced tracking with convenience methods:

```tsx
import { useAnalyticsTracking } from '@/lib/analytics/use-analytics';

function TransactionComponent() {
  const {
    trackButtonClick,
    trackFormSubmit,
    trackGiftTransaction,
    trackGroupPayment,
    trackError,
  } = useAnalyticsTracking();

  const handleSendGift = async (giftData) => {
    try {
      trackButtonClick('send_gift');

      const result = await sendGiftAPI(giftData);

      trackGiftTransaction({
        token: giftData.token,
        amount: giftData.amount,
        senderAddress: giftData.senderAddress,
        receiverAddress: giftData.receiverAddress,
        giftId: result.giftId,
        metadata: { giftType: 'birthday' },
      });
    } catch (error) {
      trackError(error, { action: 'send_gift' });
    }
  };

  return <button onClick={() => handleSendGift(giftData)}>Send Gift</button>;
}
```

### useAnalyticsDashboard()

Dashboard data with auto-refresh:

```tsx
import { useAnalyticsDashboard } from '@/lib/analytics/use-analytics';

function Dashboard() {
  const { data, loading, error, refetch } = useAnalyticsDashboard(
    undefined, // startDate
    undefined, // endDate
    60000, // refresh every minute
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <div>Total Users: {data?.summary?.totalUsers}</div>
      <div>Daily Active: {data?.summary?.dailyActiveUsers}</div>
      <div>Monthly Active: {data?.summary?.monthlyActiveUsers}</div>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useSessionManager()

Session management with wallet integration:

```tsx
import { useSessionManager } from '@/lib/analytics/use-analytics';

function WalletConnection() {
  const { userAddress, sessionId, loginUser, logoutUser } = useSessionManager();

  return (
    <div>
      {userAddress ? (
        <div>
          <p>Connected: {userAddress}</p>
          <button onClick={logoutUser}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => loginUser('0x1234...')}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## 📊 Advanced Features

### Real-time Active Sessions

```tsx
import { useActiveSessions } from '@/lib/analytics/use-analytics';

function ActiveSessions() {
  const { sessions, loading, error } = useActiveSessions(
    undefined, // all users
    5000, // refresh every 5 seconds
  );

  return (
    <div>
      <h2>Active Sessions ({sessions.length})</h2>
      {sessions.map((session) => (
        <div key={session.id}>
          <p>User: {session.userAddress || 'Anonymous'}</p>
          <p>Duration: {Math.floor(session.duration / 60)} min</p>
          <p>Page Views: {session.pageViews}</p>
        </div>
      ))}
    </div>
  );
}
```

### Offline Analytics

```tsx
import { useOfflineAnalytics } from '@/lib/analytics/use-analytics';

function OfflineComponent() {
  const { isOnline, pendingEventsCount, trackEvent } = useOfflineAnalytics();

  return (
    <div>
      <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
      {pendingEventsCount > 0 && (
        <div>Pending events: {pendingEventsCount}</div>
      )}
      <button
        onClick={() =>
          trackEvent({
            /* event data */
          })
        }
      >
        Track Event
      </button>
    </div>
  );
}
```

### Page Performance Tracking

```tsx
import { usePagePerformance } from '@/lib/analytics/use-analytics';

function PageWithPerformance() {
  const { pageLoadTime } = usePagePerformance();

  return (
    <div>
      <h1>My Page</h1>
      {pageLoadTime && <p>Loaded in {pageLoadTime.toFixed(2)}ms</p>}
    </div>
  );
}
```

## 🎨 Event Tracking Examples

### Button Clicks

```tsx
const { trackButtonClick } = useAnalyticsTracking();

<button onClick={() => trackButtonClick('cta_button', { location: 'header' })}>
  Call to Action
</button>;
```

### Form Submissions

```tsx
const { trackFormSubmit } = useAnalyticsTracking();

const handleSubmit = (formData) => {
  trackFormSubmit('contact_form', {
    fields: Object.keys(formData),
    hasEmail: !!formData.email,
  });
};
```

### Custom Events

```tsx
const { trackEvent } = useAnalytics();

trackEvent({
  eventType: AnalyticsEventType.ENDPOINT_CALL,
  metadata: {
    action: 'feature_used',
    featureName: 'advanced_calculator',
    value: 100,
  },
});
```

### Transaction Tracking

```tsx
const { trackGiftTransaction } = useAnalyticsTracking();

trackGiftTransaction({
  token: 'USDC',
  amount: '10.50',
  senderAddress: '0x123...',
  receiverAddress: '0x456...',
  giftId: 789,
  metadata: { occasion: 'birthday' },
});
```

## 📈 Report Generation

```tsx
import { useAnalytics } from '@/lib/analytics/analytics-context';

function ReportsPage() {
  const { generateReport } = useAnalytics();

  const downloadReport = async (format: 'json' | 'csv' | 'xlsx') => {
    const report = await generateReport({
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      format,
      reportType: 'monthly',
      metrics: ['users', 'sessions', 'pageViews'],
    });

    // Handle file download
    if (report instanceof Blob) {
      const url = URL.createObjectURL(report);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <button onClick={() => downloadReport('json')}>JSON Report</button>
      <button onClick={() => downloadReport('csv')}>CSV Report</button>
      <button onClick={() => downloadReport('xlsx')}>Excel Report</button>
    </div>
  );
}
```

## 🔧 Configuration Options

```typescript
interface AnalyticsConfig {
  baseUrl: string; // Your API base URL
  apiKey?: string; // Optional API key for authentication
  enableAutoTracking?: boolean; // Auto-start sessions
  enablePageTracking?: boolean; // Track page views automatically
  enableErrorTracking?: boolean; // Track errors automatically
  sessionTimeout?: number; // Session timeout in minutes (default: 30)
}
```

## 🔐 Error Handling

The analytics hooks handle errors gracefully:

```tsx
const { trackError } = useAnalyticsTracking();

try {
  // Your application logic
} catch (error) {
  trackError(error, {
    action: 'user_action',
    context: 'additional_context',
  });
}
```

## 📱 Mobile Considerations

The analytics system works seamlessly on mobile devices:

- Uses `sendBeacon` for reliable event tracking during page unload
- Handles network connectivity changes
- Queues events when offline
- Optimized for mobile performance

## 🎯 Best Practices

1. **Provider Setup**: Place `AnalyticsProvider` at the root level
2. **Error Tracking**: Use `trackError` for application errors
3. **Session Management**: Handle wallet connections with `useSessionManager`
4. **Performance**: Use `usePagePerformance` for page load tracking
5. **Offline Support**: Implement `useOfflineAnalytics` for PWAs
6. **Dashboard**: Use `useAnalyticsDashboard` with appropriate refresh intervals

## 🚀 Advanced Usage

### Custom Analytics Service

```typescript
import { AnalyticsService } from '@/lib/analytics/analytics-service';

const customAnalytics = new AnalyticsService({
  baseUrl: 'https://api.myapp.com',
  apiKey: 'custom-key',
});

// Use directly without React hooks
await customAnalytics.trackEvent({
  eventType: 'custom_event',
  metadata: { key: 'value' },
});
```

### Middleware Integration

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Track API calls automatically
  const response = NextResponse.next();

  // Add analytics headers
  response.headers.set('x-analytics-enabled', 'true');

  return response;
}
```

## 📊 Available Metrics

Your analytics system tracks:

- **User Metrics**: Total users, DAU, MAU, retention
- **Session Metrics**: Duration, page views, API calls
- **Performance Metrics**: Page load times, API response times
- **Transaction Metrics**: Volume, count, token distribution
- **Endpoint Metrics**: Usage, performance, error rates

## 🔄 Data Flow

1. **Session Start**: User connects wallet → Session created
2. **Page Tracking**: Automatic page view tracking
3. **Event Tracking**: Custom events, button clicks, forms
4. **Transaction Tracking**: Gifts, payments, requests
5. **Session End**: User disconnects → Session closed
6. **Data Analysis**: Real-time dashboard and reports

## 📝 TypeScript Support

Full TypeScript support with:

- Type-safe event tracking
- Autocomplete for all methods
- Compile-time error checking
- IntelliSense support

## 🎉 Ready to Use!

Copy these files to your Next.js project and start tracking analytics immediately. The system is designed to be:

- **Easy to integrate**: Drop-in solution
- **Type-safe**: Full TypeScript support
- **Performant**: Optimized for production
- **Flexible**: Extensible for custom needs
- **Reliable**: Handles offline scenarios

For any questions or issues, refer to the examples in `analytics-examples.tsx` or check your backend analytics module documentation.
