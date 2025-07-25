import React from "react";

export default function SkeletonLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Cards Section */}
      <div className="flex flex-wrap gap-2 p-1.5 w-full rounded-2xl bg-neutral-950 min-h-[164px]">
        {/* Main Card */}
        <div className="flex-1 rounded-xl bg-gray-600 min-w-[300px] h-[140px]" />

        {/* Status Cards */}
        <div className="w-[200px] rounded-xl bg-gray-600 h-[140px]" />
        <div className="w-[200px] rounded-xl bg-gray-600 h-[140px]" />
      </div>

      {/* Tables Section */}
      {[1, 2].map(section => (
        <div key={section} className="mt-8">
          {/* Table Header */}
          <div className="h-6 bg-gray-600 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-600 rounded w-96 mb-6" />

          {/* Table Rows */}
          {[1, 2, 3].map(row => (
            <div key={row} className="flex items-center gap-4 mb-4">
              <div className="h-8 bg-gray-600 rounded w-24" />
              <div className="h-8 bg-gray-600 rounded w-32" />
              <div className="h-8 bg-gray-600 rounded w-40" />
              <div className="h-8 bg-gray-600 rounded w-32" />
              <div className="h-8 bg-gray-600 rounded w-24" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
