"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * Skeleton Component
 * Used for loading placeholders (accessibility + performance)
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, isLoading = true, children, ...props }, ref) => {
    if (!isLoading && children) {
      return <>{children}</>;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-muted",
          className
        )}
        aria-busy="true"
        aria-label="Yükleniyor..."
        role="status"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
