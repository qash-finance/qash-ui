"use client";

import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { useWallet, WalletProvider } from "@demox-labs/miden-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/miden-wallet-adapter-reactui";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { Adapter, PrivateDataPermission, WalletError } from "@demox-labs/miden-wallet-adapter-base";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar/Sidebar";
import { Title } from "./Common/Title";
import { ModalProvider, useModal } from "@/contexts/ModalManagerProvider";
import { ModalManager } from "./Common/ModalManager";
import { shouldShowMigrationModal } from "./Modal/MigratingModal";
import { AuthProvider } from "@/services/auth/context";
import { AnalyticsProvider } from "@/contexts/AnalyticsProvider";
import { AccountProvider } from "@/contexts/AccountProvider";
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
import { MidenWalletAdapter } from "@demox-labs/miden-wallet-adapter-miden";

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

// Component that uses the wallet context
function WalletConnectedContent({
  children,
  modalRef,
}: ClientLayoutProps & { modalRef: React.RefObject<ModalTriggerRef | null> }) {
  const { connected } = useWallet();

  return (
    <>
      {children}
      {!connected && (
        <div className="absolute inset-0 backdrop-blur-xs flex items-center justify-center flex-col gap-2 z-10">
          <img src="/modal/wallet-icon.gif" alt="connect-wallet-icon" className="w-16 h-16" />
          <span className="text-white text-lg font-medium">Please connect your wallet to display information.</span>
          <ActionButton text="Connect Wallet" onClick={() => modalRef.current?.openModal(MODAL_IDS.CONNECT_WALLET)} />
        </div>
      )}
    </>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useMobileDetection();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const pathname = usePathname();
  const modalRef = useRef<ModalTriggerRef | null>(null);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarMinimized");
    if (savedState !== null) {
      setIsSidebarMinimized(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  const handleSidebarToggle = (minimized: boolean) => {
    setIsSidebarMinimized(minimized);
    localStorage.setItem("sidebarMinimized", JSON.stringify(minimized));
  };

  const wallets = [new MidenWalletAdapter({ appName: "Qash" })];

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
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={handleError}
        privateDataPermission={PrivateDataPermission.UponRequest}
      >
        <WalletModalProvider>
          <TransactionProviderC>
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
              <MidenSdkProvider>
                <SocketProvider>
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
                          <ModalTrigger ref={modalRef} />
                          <div className="flex flex-row">
                            <div
                              className={`top-0 ${isSidebarMinimized ? "w-[54px]" : "w-[230px]"}`}
                              style={{
                                transition: "width 250ms ease",
                                willChange: "width",
                              }}
                            >
                              <Sidebar minimized={isSidebarMinimized} onToggleMinimize={handleSidebarToggle} />
                            </div>
                            {pathname.includes("dashboard") && <DashboardMenu />}
                            <div className="flex-1 h-screen flex flex-col overflow-hidden">
                              <Title />
                              <div
                                style={{
                                  backgroundImage: 'url("/background.svg")',
                                  backgroundSize: "contain",
                                  backgroundClip: "content-box",
                                  backgroundColor: "#101111",
                                }}
                                className="mx-[24px] mb-[24px] rounded-lg flex justify-center items-center flex-1 overflow-auto relative"
                              >
                                <WalletConnectedContent modalRef={modalRef}>{children}</WalletConnectedContent>
                              </div>
                            </div>
                          </div>
                          <FloatingActionButton imgSrc="/token/qash.svg" />
                          <Background />
                        </AccountProvider>
                      </AuthProvider>
                    </AnalyticsProvider>
                  </ModalProvider>
                </SocketProvider>
              </MidenSdkProvider>
            </TourProviderWrapper>
          </TransactionProviderC>
        </WalletModalProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
