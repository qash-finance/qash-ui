import React from "react";
import { toast } from "react-hot-toast";

// Image assets from Figma
const imgAva2 = "http://localhost:3845/assets/2ce9dc06a4fdb8370204f7c443de9e96e17260ab.png";
const imgAva3 = "http://localhost:3845/assets/0c3873c33a3c94742d63313eac12593e98cb30aa.png";
const imgAva4 = "http://localhost:3845/assets/3120fc7b000d3423675d1f6a143be1245f6b09c0.png";
const imgAva5 = "http://localhost:3845/assets/3788e20a7bf3f24f397aa80a726685c93c9bfed5.png";
const imgChevronLeft = "http://localhost:3845/assets/b81832500b47150f227f17c946aa03caf87ad63f.svg";
const imgDownload = "http://localhost:3845/assets/990cfda3f7702bab0e08d915e97057c7ae9a9264.svg";
const imgExternalLink = "http://localhost:3845/assets/2217b92c72ef3367832acdb1e4570a9559f1878f.svg";
const imgGroup = "http://localhost:3845/assets/0cc0bba741720c32450856b5f32f6e22aa49fa0f.svg";
const imgGroup1 = "http://localhost:3845/assets/9df676ecfc356998af982b44c2dfb5ae99921393.svg";
const imgGroup2 = "http://localhost:3845/assets/8cb245b7cb085f384482d0988b965054e8fd1f12.svg";
const imgGroup3 = "http://localhost:3845/assets/bd49f5a7084998b9d6b6891b128fdb9f484a87f5.svg";
const imgBtc = "http://localhost:3845/assets/566f6787aa3b84cff5d7d5a65df8c95976813b16.svg";

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
  transaction: Transaction;
  onBack: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction, onBack }) => {
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
            <span className=" font-medium text-[#48b3ff] text-[14px] underline">{transaction.hash}</span>
            <img
              alt=""
              className="w-4 h-4 cursor-pointer"
              src="/external-link-icon.svg"
              onClick={() => {
                window.open(`https://etherscan.io/tx/${transaction.hash}`, "_blank");
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
                navigator.clipboard.writeText(transaction.hash);
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
          <span className=" font-medium text-white text-[14px]">{transaction.timestamp}</span>
        </TransactionRow>

        {/* From */}
        <TransactionRow label="From">
          <AddressDisplay address={transaction.from} avatar={imgAva2} />
        </TransactionRow>

        {/* To */}
        <TransactionRow label="To">
          <AddressDisplay address={transaction.to} avatar={imgAva4} />
        </TransactionRow>

        {/* Value */}
        <TransactionRow label="Value">
          <div className="flex items-center gap-1">
            <img alt="" className="w-5 h-5" src="/token/qash.svg" />
            <span className=" text-white text-[14px]">{transaction.value}</span>
            <span className=" text-[#989898] text-[14px]">($50)</span>
          </div>
        </TransactionRow>

        {/* Transaction Fee */}
        <TransactionRow label="Transaction Fee">
          <div className="flex items-center gap-1">
            <span className=" text-white text-[14px]">0.000003288450648 BTC</span>
            <span className=" text-[#989898] text-[14px]">($0.01)</span>
          </div>
        </TransactionRow>

        {/* Gas Price */}
        <TransactionRow label="Gas Price">
          <div className="flex items-center gap-1">
            <span className=" text-white text-[14px]">0.156592888</span>
            <span className=" text-[#989898] text-[14px]">($0.01)</span>
          </div>
        </TransactionRow>
      </div>
    </div>
  );
};

export default TransactionDetail;
