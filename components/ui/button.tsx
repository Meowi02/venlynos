"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantClasses =
      variant === "outline"
        ? "border border-gray-200 bg-white text-slate-700 hover:bg-gray-50"
        : variant === "ghost"
        ? "bg-transparent text-slate-700 hover:bg-gray-100"
        : "bg-slate-900 text-white hover:bg-slate-800";

    const sizeClasses =
      size === "sm"
        ? "h-8 px-3 text-xs"
        : size === "lg"
        ? "h-11 px-5 text-base"
        : "h-9 px-4 text-sm";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variantClasses,
          sizeClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;