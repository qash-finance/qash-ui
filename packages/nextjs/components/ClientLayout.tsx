"use client";

import { ReactNode, useMemo } from "react";
import { WalletProvider } from "@demox-labs/miden-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/miden-wallet-adapter-reactui";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { WalletError } from "@demox-labs/miden-wallet-adapter-base";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar/Sidebar";
import { Title } from "./Common/Title";
import { ModalProvider } from "@/contexts/ModalManagerProvider";
import { ModalManager } from "./Common/ModalManager";
import { AuthProvider } from "@/services/auth/context";
import { AnalyticsProvider } from "@/contexts/AnalyticsProvider";
import { AccountProvider } from "@/contexts/AccountProvider";
import { useMobileDetection } from "@/hooks/web3/useMobileDetection";
import { FloatingActionButton } from "./Common/FloatingActionButton";
import { TourProviderWrapper } from "@/contexts/TourProvider";
import { AUTH_REFRESH_INTERVAL } from "@/services/utils/constant";
import "@demox-labs/miden-wallet-adapter-reactui/styles.css";

interface ClientLayoutProps {
  children: ReactNode;
}

const analyticsConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  enableAutoTracking: true,
  enablePageTracking: true,
  enableErrorTracking: true,
  sessionTimeout: 30, // 30 minutes
};

// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function ClientLayout({ children }: ClientLayoutProps) {
  //Mobile detection
  useMobileDetection();
  const wallets = useMemo(
    () => [
      new TridentWalletAdapter({
        appName: "Qash",
      }),
    ],
    [],
  );

  const handleError = (error: WalletError) => {
    console.error(error);
    switch (error.error.name) {
      case "NotGrantedMidenWalletError":
        toast.error("User denied access to their wallet");
        break;
      default:
        toast.error("An error occurred while connecting to your wallet");
        break;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider wallets={wallets} autoConnect onError={handleError}>
        <WalletModalProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                padding: "0px",
                background: "#2B2B2B",
              },
              success: {
                icon: <img src="/toast/success.svg" alt="success" className="pl-1" />,
                style: {
                  color: "#7CFF96",
                },
              },
              error: {
                style: {
                  color: "#FF7C7C",
                },
              },
              loading: {
                style: {
                  color: "#FFFFFF",
                },
              },
            }}
            children={t => (
              <ToastBar
                toast={t}
                style={{
                  width: "full",
                  maxWidth: "900px",
                  ...t.style,
                }}
              >
                {({ icon, message }) => (
                  <div className="flex gap-0.5 items-center rounded-[13px]">
                    {icon}
                    <span className="text-sm">{message}</span>
                    <span className="h-10 w-px bg-white/20 self-stretch" aria-hidden="true" />
                    <span className="text-[#929292] text-xs p-2 cursor-pointer" onClick={() => toast.dismiss(t.id)}>
                      Close
                    </span>
                  </div>
                )}
              </ToastBar>
            )}
          />
          <TourProviderWrapper>
            <ModalProvider>
              <AnalyticsProvider config={analyticsConfig}>
                <AuthProvider
                  apiBaseUrl={process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}
                  autoRefresh={true}
                  refreshInterval={AUTH_REFRESH_INTERVAL}
                >
                  <AccountProvider>
                    {/* <ConnectWalletButton /> */}
                    <ModalManager />
                    <div className="flex flex-row h-screen">
                      <div className="w-1/6">
                        <Sidebar />
                      </div>
                      <div className="w-5/6">
                        <div className="p-[24px]">
                          <Title />
                        </div>
                        <div
                          style={{
                            backgroundImage: 'url("/background.svg")',
                            backgroundSize: "contain",
                            height: "88%",
                            backgroundClip: "content-box",
                            backgroundColor: "#101111", // dark gray (tailwind zinc-900)
                            // You can tweak the color as needed
                          }}
                          className="ml-[24px] mr-[24px] rounded-lg flex items-center justify-center"
                        >
                          {children}
                        </div>
                      </div>
                    </div>
                    <FloatingActionButton imgSrc="/token/qash.svg" />
                  </AccountProvider>
                </AuthProvider>
              </AnalyticsProvider>
            </ModalProvider>
          </TourProviderWrapper>
        </WalletModalProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
