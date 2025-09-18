import React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
