import React from "react";
import { toast } from "react-hot-toast";
import { UITransaction } from "@/services/store/transaction";
import { formatAddress } from "@/services/utils/miden/address";
import { MIDEN_EXPLORER_URL, QASH_TOKEN_DECIMALS, QASH_TOKEN_ADDRESS } from "@/services/utils/constant";
import { blo } from "blo";
import { turnBechToHex } from "@/services/utils/turnBechToHex";
import { useAccount } from "@/hooks/web3/useAccount";

interface StatusProps {
  status?: "confirmed" | "pending" | "failed";
}

function Status({ status = "confirmed" }: StatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "confirmed":
        return "bg-[#18331E] text-[#6cff85]";
      case "pending":
        return "bg-[rgba(255,193,7,0.21)] text-[#FFC107]";
      case "failed":
        return "bg-[rgba(255,63,63,0.21)] text-[#FF3F3F]";
      default:
        return "bg-[rgba(0,127,30,0.21)] text-[#6cff85]";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return "Confirmed";
    }
  };

  return (
    <div
      className={`items-center justify-center overflow-clip px-3 py-[7px] relative rounded-[17px] ${getStatusStyles()}`}
    >
      <p className="block leading-none whitespace-pre text-sm">{getStatusText()}</p>
    </div>
  );
}

interface TransactionRowProps {
  label: string;
  children: React.ReactNode;
}

function TransactionRow({ label, children }: TransactionRowProps) {
  return (
    <div className="box-border content-stretch flex flex-row h-15 items-center justify-start px-6 py-5 relative shrink-0 w-full border-b border-[#353535] last:border-b-0">
      <div className=" font-medium leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[14px] text-left w-[134px]">
        <p className="block leading-[20px]">{label}</p>
      </div>
      <div className="basis-0 box-border content-stretch flex flex-row gap-3 grow items-center justify-start min-h-px min-w-px p-0 relative shrink-0">
        {children}
      </div>
    </div>
  );
}

interface AddressDisplayProps {
  address: string;
  avatar: string;
}

function AddressDisplay({ address, avatar }: AddressDisplayProps) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-6 h-6 rounded-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${avatar}')` }}
      />
      <p className="text-white text-sm leading-5">{address}</p>
      <img
        alt="Copy address"
        className="w-4 h-4 cursor-pointer invert"
        src="/copy-icon.svg"
        onClick={() => {
          navigator.clipboard.writeText(address);
          toast.success("Copied to clipboard");
        }}
      />
    </div>
  );
}
interface Transaction {
  hash: string;
  type: "Transfer" | "Buy" | "Sell" | "Mint";
  timestamp: string;
  from: string;
  to: string;
  value: string;
}

interface TransactionDetailProps {
  transaction: UITransaction;
  onBack: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction, onBack }) => {
  const { assets } = useAccount();

  const renderValue = (transaction: UITransaction) => {
    // Get unique asset IDs from the transaction
    const uniqueAssetIds = [...new Set(transaction.assets.map(asset => asset.assetId))];
    const firstAssetId = uniqueAssetIds[0];

    // Find all matching assets and calculate total values
    const assetValues = uniqueAssetIds
      .map(assetId => {
        const asset = assets.find(asset => asset.faucetId === assetId);
        if (asset) {
          // Calculate the total amount for this asset type in the transaction
          const assetTransactions = transaction.assets.filter(txAsset => txAsset.assetId === assetId);
          const totalAmount = assetTransactions.reduce((sum, txAsset) => sum + txAsset.amount, BigInt(0));
          const formattedAmount = Number(totalAmount) / Math.pow(10, asset.metadata.decimals);
          // Remove trailing zeros for cleaner display
          const cleanAmount = parseFloat(formattedAmount.toFixed(asset.metadata.decimals));
          return `${cleanAmount} ${asset.metadata.symbol}`;
        }
        return null;
      })
      .filter(Boolean);

    const displayValue =
      assetValues.length > 0 ? assetValues.join(", ") : `${Number(transaction.assets[0]?.amount || BigInt(0))} (raw)`;

    // Return JSX with icon and value
    return (
      <>
        {firstAssetId === QASH_TOKEN_ADDRESS ? (
          <img src="/token/qash.svg" alt="qash" className="w-5 h-5" />
        ) : (
          <img src={blo(turnBechToHex(firstAssetId))} alt="asset" className="w-5 h-5 rounded-full" />
        )}
        <span className="text-white text-[14px]">{displayValue}</span>
      </>
    );
  };

  return (
    <div className="bg-[#1e1e1e] rounded-xl w-full">
      {/* Header */}
      <div className="bg-[#292929] flex items-center justify-between px-3 py-2 border-b border-[#131313] rounded-t-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="bg-[#121213] rounded-[5px]  w-5 h-5 flex items-center justify-center cursor-pointer"
          >
            <img alt="" className="w-4 h-4" src="/arrow/chevron-left.svg" />
          </button>
          <span className="text-white text-[16px] tracking-[-0.32px]">Transaction Detail</span>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="w-full h-full">
        {/* Transaction Hash */}
        <TransactionRow label="Transaction Hash">
          <div className="flex items-center gap-2">
            <span className=" font-medium text-[#48b3ff] text-[14px] underline">{formatAddress(transaction.id)}</span>
            <img
              alt=""
              className="w-4 h-4 cursor-pointer"
              src="/external-link-icon.svg"
              onClick={() => {
                window.open(`${MIDEN_EXPLORER_URL}/tx/${transaction.id}`, "_blank");
              }}
            />
            <img
              alt=""
              className="w-4 h-4 cursor-pointer"
              src="/copy-icon.svg"
              style={{
                filter: "invert(1)",
              }}
              onClick={() => {
                navigator.clipboard.writeText(transaction.id);
                toast.success("Copied to clipboard");
              }}
            />
          </div>
        </TransactionRow>

        {/* Status */}
        <TransactionRow label="Status">
          <Status status="confirmed" />
        </TransactionRow>

        {/* Type */}
        <TransactionRow label="Type">
          <span className=" font-medium text-white text-[14px]">{transaction.type}</span>
        </TransactionRow>

        {/* Timestamp */}
        <TransactionRow label="Timestamp">
          <span className=" font-medium text-white text-[14px]">{transaction.blockNumber}</span>
        </TransactionRow>

        {/* From */}
        <TransactionRow label="From">
          <AddressDisplay address={transaction.sender} avatar={blo(turnBechToHex(transaction.sender))} />
        </TransactionRow>

        {/* To */}
        <TransactionRow label="To">
          <AddressDisplay address={transaction.recipient} avatar={blo(turnBechToHex(transaction.recipient))} />
        </TransactionRow>

        {/* Value */}
        <TransactionRow label="Value">{renderValue(transaction)}</TransactionRow>

        {/* Transaction Fee */}
        {/* <TransactionRow label="Transaction Fee">
          <div className="flex items-center gap-1">
            <span className=" text-white text-[14px]">0.000003288450648 BTC</span>
            <span className=" text-[#989898] text-[14px]">($0.01)</span>
          </div>
        </TransactionRow> */}

        {/* Gas Price */}
        {/* <TransactionRow label="Gas Price">
          <div className="flex items-center gap-1">
            <span className=" text-white text-[14px]">0.156592888</span>
            <span className=" text-[#989898] text-[14px]">($0.01)</span>
          </div>
        </TransactionRow> */}
      </div>
    </div>
  );
};

export default TransactionDetail;
