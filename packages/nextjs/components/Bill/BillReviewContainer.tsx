"use client";
import { useTitle } from "@/contexts/TitleProvider";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SecondaryButton } from "../Common/SecondaryButton";
import { useInvoice } from "@/hooks/server/useInvoice";
import { CategoryBadge } from "../ContactBook/ContactBookContainer";
import { useGetAllEmployeeGroups } from "@/services/api/employee";
import { CategoryShapeEnum } from "@/types/employee";
import { useModal } from "@/contexts/ModalManagerProvider";
import { InvoiceModalProps, TransactionOverviewModalProps } from "@/types/modal";
import { PrimaryButton } from "../Common/PrimaryButton";
import toast from "react-hot-toast";
import { QASH_TOKEN_ADDRESS, QASH_TOKEN_DECIMALS, QASH_TOKEN_SYMBOL } from "@/services/utils/constant";
import { usePayBills } from "@/services/api/bill";
import { getFaucetMetadata } from "@/services/utils/miden/faucet";
import { useMidenProvider } from "@/contexts/MidenProvider";
import { importAndGetAccount } from "@/services/utils/miden/account";

const InvoiceItem = ({
  invoiceId,
  name,
  amount,
  amountUsd,
  group,
  onViewClick,
  token,
}: {
  invoiceId: string;
  name?: string;
  amount?: string;
  amountUsd?: string;
  group: { shape?: CategoryShapeEnum; color?: string; groupName?: string };
  onViewClick?: () => void;
  token: string;
}) => {
  const { shape, color, groupName } = group || {};
  return (
    <div className="grid grid-cols-[120px_120px_120px_1fr_120px] gap-10 items-center w-full border-b border-primary-divider px-4 py-3 bg-background rounded-xl">
      {/* Invoice ID Column */}
      <span className="text-sm font-medium text-text-primary">{invoiceId}</span>

      {/* Name Column */}
      <span className="text-sm font-medium text-text-primary">{name}</span>

      {/* Employee Badge Column */}
      <div className="flex justify-center items-center">
        <CategoryBadge
          shape={(shape as CategoryShapeEnum) || CategoryShapeEnum.CIRCLE}
          color={color || "#35ADE9"}
          name={groupName || "-"}
        />
      </div>
      {/* Amount Column */}
      <div className="flex items-end flex-col gap-2">
        <div className="flex flex-row gap-1 items-center">
          <img src={`/token/${token.toLowerCase()}.svg`} alt={token} className="w-5" />
          <span className=" font-medium text-text-primary leading-none">{amount}</span>
        </div>
        {/* <span className="text-sm text-text-secondary leading-none">{amountUsd}</span> */}
      </div>

      {/* View Button Column */}
      <button
        onClick={onViewClick}
        className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-text-primary hover:bg-gray-200 transition-colors"
      >
        View
      </button>
    </div>
  );
};

const TokenItem = ({ token, amount, amountUsd }: { token: string; amount: string; amountUsd?: string }) => {
  return (
    <div className="flex justify-start items-center gap-2">
      <img src={`/token/${token.toLowerCase()}.svg`} alt={token} className="w-10" />

      <div className="flex items-start flex-col gap-0.5">
        <div className="text-[18px] leading-none">{amount}</div>
        {amountUsd && <div className="text-[16px] text-text-secondary leading-none">{amountUsd}</div>}
      </div>
    </div>
  );
};

const BillReviewContainer = () => {
  const router = useRouter();
  const { setTitle, setShowBackArrow, setOnBackClick } = useTitle();
  const { address, client } = useMidenProvider();
  const { data: groups } = useGetAllEmployeeGroups();
  const { openModal, closeModal } = useModal();
  const payBillsMutate = usePayBills();

  useEffect(() => {
    const handleBack = () => {
      router.back();
    };

    setTitle(
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Bills /</span>
        <span className="text-text-primary">Review invoices</span>
      </div>,
    );
    setShowBackArrow(true);
    setOnBackClick(() => handleBack);

    return () => {
      // clean up when component unmounts
      setOnBackClick(undefined);
      setShowBackArrow(false);
    };
  }, [router]);

  const searchParams = useSearchParams();
  const { fetchInvoiceByUUID } = useInvoice();
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const { register, watch } = useForm({
    defaultValues: {
      searchTerm: "",
    },
  });

  const searchTerm = watch("searchTerm");

  const tokenTotals = React.useMemo(() => {
    const map = new Map<string, { total: number; totalUsd: number }>();
    selectedInvoices.forEach(inv => {
      const currency = (
        inv.paymentToken.name.toUpperCase() ||
        inv.invoice?.paymentToken?.name?.toUpperCase() ||
        "USDT"
      ).toUpperCase();
      const total = Number(inv.total) || 0;
      const totalUsd = Number(inv.totalUsd) || 0;
      const prev = map.get(currency) || { total: 0, totalUsd: 0 };
      prev.total += total;
      prev.totalUsd += totalUsd;
      map.set(currency, prev);
    });
    return Array.from(map.entries()).map(([currency, v]) => ({ currency, total: v.total, totalUsd: v.totalUsd }));
  }, [selectedInvoices]);

  const totalUsdSum = React.useMemo(() => tokenTotals.reduce((s, t) => s + (t.totalUsd || 0), 0), [tokenTotals]);

  const filteredInvoices = React.useMemo(() => {
    if (!searchTerm) return selectedInvoices;
    return selectedInvoices.filter(inv => inv.fromDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedInvoices, searchTerm]);

  useEffect(() => {
    const uuids = searchParams?.getAll ? searchParams.getAll("invoiceUUID") : [];
    if (!uuids || uuids.length === 0) return;

    let mounted = true;
    setLoadingInvoices(true);
    Promise.all(uuids.map(u => fetchInvoiceByUUID(u).catch(err => null)))
      .then(results => {
        if (!mounted) return;
        setSelectedInvoices(results.filter(Boolean) as any[]);
      })
      .catch(err => console.error("Failed to fetch invoices", err))
      .finally(() => setLoadingInvoices(false));

    return () => {
      mounted = false;
    };
  }, [searchParams, fetchInvoiceByUUID]);

  const handleSubmit = async () => {
    const midenSdk = await import("@demox-labs/miden-sdk");
    const {
      Note,
      WebClient,
      Address,
      NoteAssets,
      FungibleAsset,
      NoteType,
      Felt,
      TransactionRequestBuilder,
      BasicFungibleFaucetComponent,
      OutputNote,
    } = midenSdk;
    const OutputNoteArray = (midenSdk as any).OutputNoteArray;

    if (!address) {
      return toast.error("Please connect your wallet");
    }

    try {
      openModal("PROCESSING_TRANSACTION");
      // prepare an array of p2id note
      const p2idNotes: any[] = [];
      const p2idNotesCopy: any[] = [];
      const recipientAddresses = [];
      const assets = [];
      let totalAmount = 0;
      // loop through selected invoices
      for (const inv of selectedInvoices) {
        // payment token address
        const paymentTokenAddress = inv.paymentToken.address;

        // payment amount
        const paymentAmount = inv.total;
        // recipient address
        const recipientAddress = inv.paymentWalletAddress;
        const faucetAccount = await importAndGetAccount(client, paymentTokenAddress);
        // get faucet metadata
        const faucetMetadata = await BasicFungibleFaucetComponent.fromAccount(faucetAccount);
        assets.push(faucetMetadata);
        totalAmount += Number(paymentAmount);

        // build p2id note
        const p2idNote = Note.createP2IDNote(
          Address.fromBech32(address).accountId(),
          Address.fromBech32(recipientAddress).accountId(),
          new NoteAssets([
            new FungibleAsset(
              Address.fromBech32(paymentTokenAddress).accountId(),
              BigInt(paymentAmount! * 10 ** faucetMetadata.decimals() || 8),
            ),
          ]),
          NoteType.Private,
          new Felt(BigInt(0)),
        );
        const p2idNoteCopy = p2idNote;
        // Convert Note to OutputNote
        p2idNotes.push(OutputNote.full(p2idNote));
        p2idNotesCopy.push(p2idNoteCopy);
        recipientAddresses.push(recipientAddress);
      }
      // Build transaction request with OutputNoteArray
      const outputNotesArray = new OutputNoteArray(p2idNotes);
      const transactionRequest = new TransactionRequestBuilder().withOwnOutputNotes(outputNotesArray).build();
      const midenParaClient = client as import("@demox-labs/miden-sdk").WebClient;
      const executedTx = await midenParaClient.executeTransaction(
        Address.fromBech32(address).accountId(),
        transactionRequest,
      );
      console.log("Start proving transaction");
      const provenTx = await midenParaClient.proveTransaction(executedTx);
      console.log("Start submitting proven transaction");
      const submissionHeight = await midenParaClient.submitProvenTransaction(provenTx, executedTx);
      console.log("Start applying transaction");
      await midenParaClient.applyTransaction(executedTx, submissionHeight);
      console.log("Start sending private notes");
      // loop through p2idNotes and recipientAddresses, send each private note
      for (let i = 0; i < p2idNotes.length; i++) {
        await midenParaClient.sendPrivateNote(p2idNotesCopy[i], Address.fromBech32(recipientAddresses[i]));
      }
      console.log("Start mutating bills");
      payBillsMutate.mutate({
        billUUIDs: selectedInvoices.map(inv => inv.bill?.uuid),
        transactionHash: executedTx.executedTransaction().id().toHex(),
      });
      closeModal("PROCESSING_TRANSACTION");
      openModal<TransactionOverviewModalProps>("TRANSACTION_OVERVIEW", {
        amount: totalAmount.toString(),
        tokenSymbol: selectedInvoices
          .map(inv => inv.assets?.map((asset: any) => asset.symbol).join(","))
          .filter(Boolean)
          .join(","),
        tokenAddress: QASH_TOKEN_ADDRESS,
        accountAddress: address,
        accountName: "You",
        recipientAddress: recipientAddresses.join(","),
        recipientName: "Reciever",
        transactionType: "Send",
        transactionHash: executedTx.executedTransaction().id().toHex(),
        onConfirm: () => {
          closeModal("TRANSACTION_OVERVIEW");
          router.push("/bill");
        },
      });
    } catch (error: any) {
      console.log(error);
      toast.error(String(error));
    } finally {
      closeModal("PROCESSING_TRANSACTION");
    }
  };

  return (
    <div className="flex flex-col w-full h-full justify-start items-start p-7 gap-5">
      <div className="flex flex-row gap-3">
        <img src="/misc/flag-icon.svg" alt="Bill Placeholder" className="w-6" />
        <span className="font-bold text-2xl">Review invoices</span>
      </div>

      <div className="flex flex-row w-full h-full">
        {/* Left Side - Bill Details */}
        <div className="flex-1 border-r-0 border border-primary-divider rounded-l-2xl p-5 bg-app-background flex flex-col gap-5 h-full overflow-auto">
          <div className=" flex flex-row justify-between w-full items-center">
            <span className="font-semibold text-lg">Invoice list</span>
            <span className="text-lg text-text-secondary">
              Number of invoices
              <span className="text-primary-blue"> {filteredInvoices.length || 0}</span>
            </span>
            <div className="bg-[#E7E7E7] border border-primary-divider flex flex-row gap-2 items-center pr-1 pl-3 py-1 rounded-lg w-[300px]">
              <div className="flex flex-row gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Search by name"
                  className="font-medium text-sm text-text-secondary bg-transparent border-none outline-none w-full"
                  {...register("searchTerm")}
                />
              </div>
              <button
                type="button"
                className="flex flex-row gap-1.5 items-center rounded-lg w-6 h-6 justify-center cursor-pointer"
              >
                <img src="/wallet-analytics/finder.svg" alt="search" className="w-4 h-4" />
              </button>
            </div>
          </div>
          {loadingInvoices ? (
            <div className="w-full flex justify-center items-center py-10">Loading selected invoices...</div>
          ) : (
            filteredInvoices.length > 0 &&
            filteredInvoices.map(inv => {
              const groupData = groups?.find(grp => grp.id === inv.employee?.groupId);
              return (
                <InvoiceItem
                  key={inv.uuid || inv.invoiceNumber}
                  invoiceId={inv.invoiceNumber || inv.uuid}
                  name={inv.fromDetails?.name || (inv.fromDetails as any).companyName}
                  amount={`${inv.total || 0} ${inv.paymentToken.symbol.toUpperCase() || "USDT"}`}
                  token={inv.paymentToken.name.toLowerCase()}
                  amountUsd={inv.totalUsd ? `$${inv.totalUsd}` : ""}
                  group={{
                    shape: groupData?.shape || CategoryShapeEnum.CIRCLE,
                    color: groupData?.color || "#35ADE9",
                    groupName: groupData?.name || "Client",
                  }}
                  onViewClick={() => {
                    openModal<InvoiceModalProps>("INVOICE_MODAL", {
                      invoice: {
                        amountDue: inv.total,
                        paymentToken: {
                          name: inv.paymentToken.name.toUpperCase(),
                        },
                        billTo: {
                          address: [
                            inv.toDetails?.address1,
                            inv.toDetails?.address2,
                            inv.toDetails?.city,
                            inv.toDetails?.country,
                          ]
                            .filter(Boolean)
                            .join(", "),
                          email: inv.toDetails?.email,
                          name: inv.toCompany?.companyName,
                          company: `${inv.toCompany?.companyName} ${inv.toCompany?.companyType}`,
                        },
                        currency: inv.currency,
                        date: inv.issueDate,
                        dueDate: inv.dueDate,
                        from: {
                          name: inv.employee?.name,
                          address: inv.employee?.address,
                          email: inv.employee?.email,
                          company: `${inv.toCompany?.companyName} ${inv.toCompany?.companyType}`,
                        },
                        invoiceNumber: inv.invoiceNumber,
                        items: inv.items.map((item: any) => ({
                          name: item.description,
                          rate: item.unitPrice,
                          qty: item.quantity,
                          amount: item.total,
                        })),
                        subtotal: inv.subtotal,
                        tax: 0,
                        total: inv.total,
                        walletAddress: inv.paymentWalletAddress,
                        network: "Miden",
                      },
                    });
                  }}
                />
              );
            })
          )}
          {/* Bill details content goes here */}
        </div>

        {/* Right Side - Review Summary - Edit the code here */}
        <div className="w-150 border-l-0 border border-primary-divider rounded-r-2xl bg-[#E7E7E7] h-full flex flex-col gap-4">
          <div className="flex flex-col h-full justify-between px-7 py-4">
            <div className=" flex flex-col gap-2 justify-between">
              <span className="font-bold text-3xl">Payment Overview</span>
              <span className="text-text-secondary ">Make sure the details are correct before proceeding.</span>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-semibold text-lg">Total by token</span>
              {tokenTotals.length === 0 ? (
                <div className="text-sm text-text-secondary">No invoices selected</div>
              ) : (
                tokenTotals.map(t => (
                  <TokenItem
                    key={t.currency}
                    token={t.currency}
                    amount={`${t.total} ${t.currency}`}
                    amountUsd={t.totalUsd ? `$${t.totalUsd}` : ""}
                  />
                ))
              )}
            </div>
          </div>

          <div className="flex w-full px-7 py-4 border-t-1 border-[#DBDCDE] justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-text-secondary leading-none">Total amount</span>
              <span className="font-bold text-3xl leading-none">
                {totalUsdSum > 0
                  ? `$${totalUsdSum}`
                  : tokenTotals.length === 1
                    ? `${tokenTotals[0].total} ${tokenTotals[0].currency}`
                    : `${selectedInvoices.length} invoices`}
              </span>
            </div>
            {address ? (
              <PrimaryButton
                text="Pay Invoice"
                containerClassName="w-40 !rounded-xl"
                buttonClassName="h-full"
                onClick={() => handleSubmit()}
              />
            ) : (
              <SecondaryButton
                text="Connect Wallet"
                buttonClassName="w-40 !rounded-xl"
                onClick={() => openModal("CONNECT_MIDEN_WALLET")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillReviewContainer;
