import React from "react";

interface LoginButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function LoginButton({ onClick, loading = false, disabled = false }: LoginButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="bg-primary-blue flex items-center justify-center h-[47px] rounded-[16px] shadow-lg w-full cursor-pointer gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="text-[14px] text-white text-center">Loading...</span>
      ) : (
        <>
      <span className="text-[14px] text-white text-center">Next</span>
      <img src="/arrow/thin-arrow-left.svg" alt="arrow-right" className="w-[20px] h-[20px] invert-100 rotate-180" />
        </>
      )}
    </button>
  );
}
