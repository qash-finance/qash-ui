"use client";

import { ReactNode, useMemo } from "react";
import { WalletProvider } from "@demox-labs/miden-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/miden-wallet-adapter-reactui";
import { TridentWalletAdapter } from "@demox-labs/miden-wallet-adapter-trident";
import toast, { Toaster } from "react-hot-toast";
import { WalletError } from "@demox-labs/miden-wallet-adapter-base";
import ConnectWalletButton from "./ConnectWallet/ConnectWalletButton";
import "@demox-labs/miden-wallet-adapter-reactui/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar/Sidebar";
import { Title } from "./Common/Title";
import { ModalProvider } from "@/contexts/ModalManagerProvider";
import { ModalManager } from "./Common/ModalManager";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const queryClient = new QueryClient();
  const wallets = useMemo(
    () => [
      new TridentWalletAdapter({
        appName: "App Name",
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
          <Toaster />
          <ModalProvider>
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
                  }}
                  className="ml-[24px] mr-[24px] rounded-lg flex items-center justify-center"
                >
                  {children}
                </div>
              </div>
            </div>
          </ModalProvider>
        </WalletModalProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
