"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

function Separator({
  className = "",
  orientation = "horizontal",
  decorative = true,
  ...props
}: SeparatorProps) {
  const orientationClasses = orientation === "horizontal" 
    ? "h-px w-full" 
    : "h-full w-px";
    
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={!decorative ? orientation : undefined}
      data-slot="separator"
      data-orientation={orientation}
      className={`shrink-0 bg-border ${orientationClasses} ${className}`}
      {...props}
    />
  );
}

export function VerticalSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex w-8 self-stretch overflow-hidden border-x border-edge", // Use self-stretch instead of height
        "before:content-[''] before:absolute before:top-0 before:z-10 before:w-8 before:h-full",
        "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]",
        "before:opacity-56",
        className
      )}
    />
  );
}

export function HorizontalSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-8 self-stretch overflow-hidden border-y border-edge", // Changed to h-8 and border-y
        "before:content-[''] before:absolute before:left-0 before:z-10 before:h-8 before:w-full", // Changed positioning
        "before:bg-[repeating-linear-gradient(45deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-edge)]",
        "before:opacity-56",
        className
      )}
    />
  );
}


export { Separator };
