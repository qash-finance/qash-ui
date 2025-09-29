"use client";

import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { WalletProvider } from "@demox-labs/miden-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/miden-wallet-adapter-reactui";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { Adapter, WalletError } from "@demox-labs/miden-wallet-adapter-base";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar/Sidebar";
import { Title } from "./Common/Title";
import { ModalProvider, useModal } from "@/contexts/ModalManagerProvider";
import { ModalManager } from "./Common/ModalManager";
import { shouldShowMigrationModal } from "./Modal/MigratingModal";
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
import DashboardMenu from "./Dashboard/DashboardMenu";
import { usePathname } from "next/navigation";
import { TransactionProviderC } from "@/contexts/TransactionProvider";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { ActionButton } from "./Common/ActionButton";
import { MODAL_IDS } from "@/types/modal";
import { ModalTrigger, ModalTriggerRef } from "./Common/ModalTrigger";
import { PrimaryButton } from "./Common/PrimaryButton";

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
  useMobileDetection();
  const pathname = usePathname();
  const { isConnected } = useWalletConnect();
  const modalRef = useRef<ModalTriggerRef | null>(null);

  // Check if current page is not-found or mobile
  const isNotFoundPage = pathname === "/not-found" || pathname === "/404" || pathname === "/mobile";

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

  useEffect(() => {
    if (shouldShowMigrationModal()) {
      modalRef.current?.openModal(MODAL_IDS.MIGRATING);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
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
                        <AccountProvider>
                          <TitleProvider>
                            {/* <ConnectWalletButton /> */}
                            <ModalManager />
                            <ModalTrigger ref={modalRef} />
                            {isNotFoundPage ? (
                              // Full-page layout for not-found page
                              <div className="h-screen w-screen">{children}</div>
                            ) : (
                              // Regular layout for other pages
                              <div className="flex flex-row gap-2">
                                <div className="top-0 w-[240px]">
                                  <Sidebar />
                                </div>
                                {/* {pathname.includes("dashboard") && <DashboardMenu />} */}
                                <div className="flex-1 h-screen flex flex-col overflow-hidden gap-2">
                                  <Title />
                                  <div className="mx-[8px] mb-[24px] rounded-[12px] flex justify-center items-center flex-1 overflow-auto relative bg-background">
                                    {children}
                                    {!isConnected && (
                                      <div className="absolute inset-0 backdrop-blur-xs flex items-center justify-center flex-col gap-2 z-10">
                                        <img
                                          src="/modal/wallet-icon.gif"
                                          alt="connect-wallet-icon"
                                          className="w-16 h-16"
                                        />
                                        <span className="text-text-primary text-lg font-medium">
                                          Please connect your wallet to display information.
                                        </span>
                                        <PrimaryButton
                                          text="Connect Wallet"
                                          onClick={() => modalRef.current?.openModal(MODAL_IDS.SELECT_WALLET)}
                                          containerClassName="w-[190px]"
                                          icon="/misc/wallet-icon.svg"
                                          iconPosition="left"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {!isNotFoundPage && <FloatingActionButton imgSrc="/token/qash.svg" />}
                            {!isNotFoundPage && <Background />}
                          </TitleProvider>
                        </AccountProvider>
                      </AuthProvider>
                    </AnalyticsProvider>
                  </ModalProvider>
                </SocketProvider>
              </TourProviderWrapper>
            </TransactionProviderC>
          </WalletModalProvider>
        </WalletProvider>
      </MidenSdkProvider>
    </QueryClientProvider>
  );
}
