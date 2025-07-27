import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function SkeletonLoading() {
  return (
    <SkeletonTheme baseColor="#292929" highlightColor="#1E1E1E">
      <div className="mt-2 grid grid-cols-7 gap-2">
        <div className="col-span-3">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-2">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-10 " />
        </div>
      </div>
      <div className="my-2 grid grid-cols-7 gap-2">
        <div className="col-span-3">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-2">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-10 " />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        <div className="col-span-3">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-2">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-10 " />
        </div>
        <div className="col-span-1">
          <Skeleton className="h-10 " />
        </div>
      </div>
    </SkeletonTheme>
  );
}
