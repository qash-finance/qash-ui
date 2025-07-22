"use client";

import React, { useState, useCallback } from "react";
import { useWalletAuth } from "@/hooks/server/useWalletAuth";

export interface WalletConnectorProps {
  onConnect?: (walletAddress: string) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  className?: string;
  connectButtonText?: string;
  disconnectButtonText?: string;
  loadingText?: string;
  showAddress?: boolean;
  showStatus?: boolean;
}

export function WalletConnector({
  onConnect,
  onDisconnect,
  onError,
  className = "",
  connectButtonText = "Connect Wallet",
  disconnectButtonText = "Disconnect",
  loadingText = "Connecting...",
  showAddress = true,
  showStatus = true,
}: WalletConnectorProps) {
  const { isAuthenticated, walletAddress, isLoading, error, connectWallet, disconnectWallet, clearError } =
    useWalletAuth();

  const [inputAddress, setInputAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!inputAddress.trim()) return;

    setIsConnecting(true);
    try {
      await connectWallet(inputAddress.trim());
      setInputAddress("");
      onConnect?.(inputAddress.trim());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [inputAddress, connectWallet, onConnect, onError]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      onDisconnect?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Disconnection failed";
      onError?.(errorMessage);
    }
  }, [disconnectWallet, onDisconnect, onError]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleConnect();
      }
    },
    [handleConnect],
  );

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`wallet-connector ${className}`}>
      {!isAuthenticated ? (
        <div className="connect-section">
          <div className="input-group">
            <input
              type="text"
              value={inputAddress}
              onChange={e => setInputAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter wallet address (0x...)"
              className="wallet-input"
              disabled={isLoading || isConnecting}
            />
            <button
              onClick={handleConnect}
              disabled={isLoading || isConnecting || !inputAddress.trim()}
              className="connect-button"
            >
              {isLoading || isConnecting ? loadingText : connectButtonText}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={clearError} className="clear-error">
                ×
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="connected-section">
          {showAddress && (
            <div className="wallet-address">
              <span className="address-label">Connected:</span>
              <span className="address-value" title={walletAddress || ""}>
                {formatAddress(walletAddress || "")}
              </span>
            </div>
          )}

          {showStatus && (
            <div className="connection-status">
              <span className="status-indicator connected"></span>
              <span className="status-text">Connected</span>
            </div>
          )}

          <button onClick={handleDisconnect} className="disconnect-button" disabled={isLoading}>
            {disconnectButtonText}
          </button>
        </div>
      )}

      <style jsx>{`
        .wallet-connector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
        }

        .input-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .wallet-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.875rem;
          font-family: monospace;
        }

        .wallet-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .wallet-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .connect-button,
        .disconnect-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .connect-button {
          background-color: #3b82f6;
          color: white;
        }

        .connect-button:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .connect-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .disconnect-button {
          background-color: #ef4444;
          color: white;
        }

        .disconnect-button:hover:not(:disabled) {
          background-color: #dc2626;
        }

        .connected-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .wallet-address {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .address-label {
          font-weight: 500;
          color: #374151;
        }

        .address-value {
          font-family: monospace;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.connected {
          background-color: #10b981;
        }

        .status-text {
          color: #10b981;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .clear-error {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          margin-left: 0.5rem;
        }

        .clear-error:hover {
          color: #991b1b;
        }
      `}</style>
    </div>
  );
}
