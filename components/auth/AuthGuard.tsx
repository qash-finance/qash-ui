'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/context';
import { WalletConnector } from './WalletConnector';

export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  showConnector?: boolean;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  loadingComponent,
  showConnector = true,
  redirectTo,
  requireAuth = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading component while checking authentication
  if (isLoading) {
    return (
      <div className="auth-guard-loading">
        {loadingComponent || <DefaultLoadingComponent />}
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // If custom fallback is provided, show it
    if (fallback) {
      return <div className="auth-guard-fallback">{fallback}</div>;
    }

    // Default fallback with optional wallet connector
    return (
      <div className="auth-guard-unauthenticated">
        {showConnector ? (
          <div className="auth-guard-connector">
            <h2>Authentication Required</h2>
            <p>Please connect your wallet to continue.</p>
            <WalletConnector />
          </div>
        ) : (
          <div className="auth-guard-message">
            <h2>Access Denied</h2>
            <p>You need to be authenticated to access this content.</p>
          </div>
        )}
      </div>
    );
  }

  // If authentication is not required or user is authenticated, show children
  return <>{children}</>;
}

function DefaultLoadingComponent() {
  return (
    <div className="default-loading">
      <div className="loading-spinner"></div>
      <p>Checking authentication...</p>

      <style jsx>{`
        .default-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

// Hook for conditional rendering based on auth state
export function useAuthGuardState() {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated,
    shouldShowAuthGuard: !isLoading && !isAuthenticated,
  };
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<AuthGuardProps> = {},
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Style the auth guard components
const styles = `
  .auth-guard-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .auth-guard-fallback {
    width: 100%;
  }

  .auth-guard-unauthenticated {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
  }

  .auth-guard-connector {
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .auth-guard-connector h2 {
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .auth-guard-connector p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }

  .auth-guard-message {
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .auth-guard-message h2 {
    color: #dc2626;
    margin-bottom: 0.5rem;
  }

  .auth-guard-message p {
    color: #6b7280;
  }
`;

// Inject styles
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
