import React from "react";

export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
