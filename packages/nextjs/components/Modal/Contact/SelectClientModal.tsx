"use client";
import React, { useEffect, useMemo, useState } from "react";
import { SelectClientModalProps } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import { ModalHeader } from "../../Common/ModalHeader";
import BaseModal from "../BaseModal";
import { useGetClients } from "@/services/api/client";
import { useForm } from "react-hook-form";
import { useWalletConnect } from "@/hooks/web3/useWalletConnect";
import { useQueryClient } from "@tanstack/react-query";
import { ClientResponseDto } from "@/types/client";
import { useAuth } from "@/services/auth/context";
import toast from "react-hot-toast";
import { PrimaryButton } from "@/components/Common/PrimaryButton";
import { useRouter } from "next/navigation";

interface ClientItemProps {
  name: string;
  email: string;
  companyType?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

function ClientItem({ name, email, companyType, isSelected = false, onSelect }: ClientItemProps) {
  return (
    <div
      className="flex gap-3 items-center self-stretch p-3 rounded-lg cursor-pointer hover:bg-app-background w-full"
      onClick={onSelect}
    >
      <div className="flex flex-col gap-1 flex-1">
        <p className="leading-6 text-text-primary font-semibold text-base">
          {name} <span className="text-text-secondary text-sm font-normal">({email})</span>
        </p>
        {companyType && <span className="text-sm tracking-tight leading-5 text-text-secondary">{companyType}</span>}
      </div>
    </div>
  );
}

export function SelectClientModal({ isOpen, onClose, onSave }: ModalProp<SelectClientModalProps>) {
  // **************** Custom Hooks *******************
  const { isAuthenticated } = useAuth();
  const { register, watch, reset } = useForm();
  const {
    data: clientsData,
    isLoading,
    error,
  } = useGetClients({ page: 1, limit: 1000 }, { enabled: isAuthenticated && isOpen });
  const { isConnected } = useWalletConnect();
  const queryClient = useQueryClient();
  const router = useRouter();
  // **************** Local State *******************
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const search = watch("search");

  // Use appropriate data source
  const clients = clientsData?.data ?? [];

  // Filter clients by search term
  const filteredClients = useMemo(() => {
    if (!search || !clients) return clients || [];
    const term = search.toLowerCase();
    return clients.filter((client: ClientResponseDto) => {
      return (
        client.companyName.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        (client.companyType?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [clients, search]);

  //*******************************************************
  //******************* Effects ***************************
  //*******************************************************

  useEffect(() => {
    if (isConnected) {
      // When connected, rely on react-query freshness; no manual refetch needed
      return;
    }

    // Clear data and reset all state when disconnected
    queryClient.removeQueries({ queryKey: ["clients"] });
    setSelectedId("");
    setSelectedName("");
    reset(); // Clear search form
  }, [isConnected, queryClient, reset]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load clients. Please try again.");
      console.error("Error loading clients:", error);
    }
  }, [error]);

  //*******************************************************
  //******************* Handlers ***************************
  //*******************************************************

  // Handle client selection (auto-return on click)
  const handleSelectClient = (client: ClientResponseDto) => {
    setSelectedId(client.id.toString());
    setSelectedName(client.companyName);
    // Automatically save and close when a client is selected
    if (onSave) {
      onSave(client);
      onClose && onClose();
    }
  };

  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <ModalHeader title="Select client from contact" onClose={onClose} />
        <div className="flex flex-col items-center justify-center rounded-b-2xl border-2 bg-background border-primary-divider h-[580px] w-[650px] p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary-divider border-t-accent rounded-full animate-spin" />
            <p className="text-text-secondary">Loading clients...</p>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Error state
  if (error) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <ModalHeader title="Select client from contact" onClose={onClose} />
        <div className="flex flex-col items-center justify-center rounded-b-2xl border-2 bg-background border-primary-divider h-[580px] w-[650px] p-5">
          <div className="flex flex-col items-center gap-3">
            <img src="/misc/red-circle-warning.svg" alt="error" className="w-8 h-8" />
            <p className="text-text-primary font-semibold">Failed to load clients</p>
            <p className="text-text-secondary text-sm">Please try again later.</p>
          </div>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Select client from contact" onClose={onClose} />
      <div className="flex flex-col items-start rounded-b-2xl border-2 bg-background border-primary-divider h-[580px] w-[650px] p-3">
        {/* Search Input */}
        <section className="flex flex-row items-center justify-between p-3 rounded-xl bg-app-background w-full">
          <input
            type="text"
            placeholder="Search name, email or company"
            className="text-text-primary outline-none placeholder-text-secondary w-full"
            {...register("search")}
          />
          <img src="/misc/blue-search-icon.svg" alt="search" className="w-5 h-5" />
        </section>

        {/* Client List */}
        <section className="overflow-y-auto flex flex-col gap-2.5 items-start self-stretch flex-[1_0_0] w-full">
          <h2 className="leading-5 text-text-secondary mt-1">
            {filteredClients?.length || 0} contact{filteredClients?.length !== 1 ? "s" : ""}
          </h2>

          {filteredClients && filteredClients.length > 0 ? (
            <div className="flex flex-col items-start h-full w-full">
              {filteredClients.map((client: ClientResponseDto) => (
                <ClientItem
                  key={client.id}
                  name={client.companyName}
                  email={client.email}
                  companyType={client.companyType || undefined}
                  isSelected={selectedId === client.id.toString()}
                  onSelect={() => handleSelectClient(client)}
                />
              ))}
            </div>
          ) : search ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex flex-col items-center gap-2">
                <img src="/misc/blue-search-icon.svg" alt="no results" className="w-8 h-8 opacity-50" />
                <p className="text-text-secondary">No contacts match "{search}"</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full flex-col gap-2">
              <p className="text-text-secondary text-xl">No contacts available. Create your first client</p>
              <PrimaryButton
                text="Create Client"
                onClick={() => {
                  router.push("/contact-book");
                }}
                containerClassName="w-40"
              />
            </div>
          )}
        </section>
      </div>
    </BaseModal>
  );
}

export default SelectClientModal;
