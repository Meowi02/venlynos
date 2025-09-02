"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const styles =
      variant === "outline"
        ? "border border-gray-200 text-slate-700 bg-white"
        : "bg-gray-100 text-slate-700";

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          styles,
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export default Badge;