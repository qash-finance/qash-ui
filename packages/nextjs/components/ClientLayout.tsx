"use client";

import { ReactNode, useEffect, useMemo } from "react";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar/Sidebar";
import { Title } from "./Common/Title";
import { ModalProvider } from "@/contexts/ModalManagerProvider";
import { ModalManager } from "./Common/ModalManager";
import { AuthProvider } from "@/services/auth/context";
import { AccountProvider } from "@/contexts/AccountProvider";
import { TitleProvider } from "@/contexts/TitleProvider";
import { useMobileDetection } from "@/hooks/web3/useMobileDetection";
import { FloatingActionButton } from "./Common/FloatingActionButton";
import { TourProviderWrapper } from "@/contexts/TourProvider";
// import { MidenSdkProvider } from "@/contexts/MidenSdkProvider";
import Background from "./Common/Background";
import { SocketProvider } from "@/contexts/SocketProvider";
import { usePathname, useRouter } from "next/navigation";
import { TransactionProviderC } from "@/contexts/TransactionProvider";
import { useAuthGuard } from "@/hooks/server/useAuthGuard";
import { Environment, ParaProvider } from "@getpara/react-sdk";
import { MidenProvider } from "@/contexts/MidenProvider";
import "@getpara/react-sdk/styles.css";

// Responsive sidebar widths: smaller on medium screens, larger on bigger screens
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
const SIDEBAR_WIDTH_CLASSES = "w-[200px] lg:w-[240px] xl:w-[280px]";

interface ClientLayoutProps {
  children: ReactNode;
}

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
  "/invoice/create",
]);

const TestnetBanner = () => (
  <div className="w-full bg-[#FFD268] text-black text-center p-2 h-[32px] flex items-center justify-center gap-2 text-sm relative z-10">
    <img src="/misc/testnet-background-left.svg" alt="coin-icon" className="w-35 absolute left-0 top-0" />
    <img src="/misc/testnet-background-right.svg" alt="coin-icon" className="w-35 absolute right-0 top-0" />
    <img src="/misc/two-star-icon.svg" alt="coin-icon" className="w-5 h-5 " />
    <span>Testnet Notice: All assets and transactions may be reset and have no real value.</span>
  </div>
);

const paraClientConfig = {
  env: Environment.BETA,
  apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY || "",
};

const paraConfig = { appName: "Qash x Para" };

const paraModalConfig = {
  oAuthMethods: ["GOOGLE"] as "GOOGLE"[],
  disablePhoneLogin: true,
  recoverySecretStepEnabled: true,
  onRampTestMode: true,
  logo: "/logo/qash-icon.svg",
};

// Inner component that uses auth guard (must be inside AuthProvider)
function ProtectedContent({ children }: { children: ReactNode }) {
  useAuthGuard();
  return <>{children}</>;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useMobileDetection();
  const pathname = usePathname();

  const isFullscreen = useMemo(() => {
    if (!pathname) return false;
    return Array.from(fullscreenPages).some(
      p =>
        // Fullscreen when the pathname equals the page or is a subpath (e.g. "/invoice-review/b2b")
        pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`),
    );
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider paraClientConfig={paraClientConfig} config={paraConfig} paraModalConfig={paraModalConfig}>
        <MidenProvider>
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
                <AuthProvider>
                  <ProtectedContent>
                    <AccountProvider>
                      <TransactionProviderC>
                        <TitleProvider>
                          {/* <ConnectWalletButton /> */}
                          <ModalManager />
                          {isFullscreen ? (
                            <div className="h-screen w-screen">{children}</div>
                          ) : (
                            <div className="flex flex-col h-screen overflow-hidden">
                              <TestnetBanner />
                              <div className="flex flex-row gap-2">
                                <div className={`top-0 ${SIDEBAR_WIDTH_CLASSES}`}>
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
                          {!isFullscreen && <FloatingActionButton imgSrc="/token/qash.svg" />}
                          {!isFullscreen && <Background />}
                        </TitleProvider>
                      </TransactionProviderC>
                    </AccountProvider>
                  </ProtectedContent>
                </AuthProvider>
              </ModalProvider>
            </SocketProvider>
          </TourProviderWrapper>
        </MidenProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
}
