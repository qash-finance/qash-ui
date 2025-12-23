"use client";

import { ReactNode, useRef, useEffect } from "react";
import { WalletProvider, WalletModalProvider, MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { Adapter, WalletError } from "@demox-labs/miden-wallet-adapter-base";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar/Sidebar";
import { Title } from "./Common/Title";
import { ModalProvider } from "@/contexts/ModalManagerProvider";
import { ModalManager } from "./Common/ModalManager";
import { AuthProvider } from "@/services/auth/context";
import { AnalyticsProvider } from "@/contexts/AnalyticsProvider";
import { AccountProvider } from "@/contexts/AccountProvider";
import { TitleProvider } from "@/contexts/TitleProvider";
import { useMobileDetection } from "@/hooks/web3/useMobileDetection";
import { FloatingActionButton } from "./Common/FloatingActionButton";
import { TourProviderWrapper } from "@/contexts/TourProvider";
import { AUTH_REFRESH_INTERVAL } from "@/services/utils/constant";
import { MidenSdkProvider } from "@/contexts/MidenSdkProvider";
import Background from "./Common/Background";
import { SocketProvider } from "@/contexts/SocketProvider";
import "@demox-labs/miden-wallet-adapter-reactui/styles.css";
import { usePathname, useRouter } from "next/navigation";
import { TransactionProviderC } from "@/contexts/TransactionProvider";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ModalTriggerRef } from "./Common/ModalTrigger";
import { useAuthGuard } from "@/hooks/server/useAuthGuard";
import { Environment, ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

const SIDEBAR_WIDTH = 280;

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

const fullscreenPages = new Set([
  "/not-found",
  "/404",
  "/mobile",
  "/login",
  "/onboarding",
  "/payment/",
  "/invoice-review",
]);

const TestnetBanner = () => (
  <div className="w-full bg-[#FFD268] text-black text-center p-2 h-[32px] flex items-center justify-center gap-2 text-sm relative">
    <img src="/misc/testnet-background-left.svg" alt="coin-icon" className="w-35 absolute left-0 top-0" />
    <img src="/misc/testnet-background-right.svg" alt="coin-icon" className="w-35 absolute right-0 top-0" />
    <img src="/misc/two-star-icon.svg" alt="coin-icon" className="w-5 h-5 " />
    <span>Testnet Notice: All assets and transactions may be reset and have no real value.</span>
  </div>
);

// Inner component that uses auth guard (must be inside AuthProvider)
function ProtectedContent({ children }: { children: ReactNode }) {
  useAuthGuard();
  return <>{children}</>;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useMobileDetection();
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useWalletConnect();
  const modalRef = useRef<ModalTriggerRef | null>(null);

  // Redirect from "/" to "/payroll"
  useEffect(() => {
    if (pathname === "/") {
      router.replace("/payroll");
    }
  }, [pathname, router]);

  const wallets = [new MidenWalletAdapter({ appName: "Your Miden App" })];

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
      <ParaProvider
        paraClientConfig={{
          env: Environment.BETA,
          apiKey: "beta_cc45a1c8bbfbeb71c1ce2d51c44ba512",
        }}
        config={{ appName: "Qash x Para" }}
        paraModalConfig={{
          oAuthMethods: ["GOOGLE"],
          disablePhoneLogin: true,
          recoverySecretStepEnabled: true,
          onRampTestMode: true,
        }}
      >
        <MidenSdkProvider>
          <WalletProvider wallets={wallets as unknown as Adapter[]} autoConnect onError={handleError}>
            <WalletModalProvider>
              <TransactionProviderC>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      padding: "6px",
                      background: "var(--toast-background) !important",
                      border: "4px solid var(--toast-border) !important",
                      width: "full",
                      maxWidth: "900px",
                      borderRadius: "9999px",
                    },
                    success: {
                      icon: <img src="/toast/success.svg" alt="success" />,
                    },
                    error: {
                      icon: <img src="/toast/error.svg" alt="error" />,
                    },
                    loading: {
                      icon: <img src="/toast/loading.gif" alt="loading" className="w-10.5" />,
                    },
                  }}
                  children={t => (
                    <ToastBar
                      toast={t}
                      style={{
                        ...t.style,
                      }}
                    >
                      {({ icon, message }) => (
                        <div className="flex items-center justify-between gap-8 pr-3">
                          <div className="flex items-center">
                            {icon}
                            <span className="text-toast-text leading-none">{message}</span>
                          </div>
                          <img
                            src="/toast/close-icon.svg"
                            alt="close"
                            className="w-5 cursor-pointer"
                            onClick={() => toast.dismiss(t.id)}
                          />
                        </div>
                      )}
                    </ToastBar>
                  )}
                />
                <TourProviderWrapper>
                  <SocketProvider>
                    <ModalProvider>
                      <AnalyticsProvider config={analyticsConfig}>
                        <AuthProvider
                          apiBaseUrl={process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}
                          autoRefresh={true}
                          refreshInterval={AUTH_REFRESH_INTERVAL}
                        >
                          <ProtectedContent>
                            <AccountProvider>
                              <TitleProvider>
                                {/* <ConnectWalletButton /> */}
                                <ModalManager />
                                {fullscreenPages.has(pathname) ? (
                                  <div className="h-screen w-screen">{children}</div>
                                ) : (
                                  <div className="flex flex-col h-screen overflow-hidden">
                                    <TestnetBanner />
                                    <div className="flex flex-row gap-2">
                                      <div className="top-0" style={{ width: SIDEBAR_WIDTH }}>
                                        <Sidebar />
                                      </div>
                                      {/* {pathname.includes("dashboard") && <DashboardMenu />} */}
                                      <div className="flex-1 h-screen flex flex-col overflow-hidden gap-2">
                                        <Title />
                                        <div className="mx-[8px] mb-[24px] rounded-[12px] flex justify-center items-center flex-1 overflow-auto relative bg-background">
                                          {children}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {!fullscreenPages.has(pathname) && <FloatingActionButton imgSrc="/token/qash.svg" />}
                                {!fullscreenPages.has(pathname) && <Background />}
                              </TitleProvider>
                            </AccountProvider>
                          </ProtectedContent>
                        </AuthProvider>
                      </AnalyticsProvider>
                    </ModalProvider>
                  </SocketProvider>
                </TourProviderWrapper>
              </TransactionProviderC>
            </WalletModalProvider>
          </WalletProvider>
        </MidenSdkProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
}
