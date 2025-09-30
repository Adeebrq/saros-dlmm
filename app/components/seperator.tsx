"use client";

import * as React from "react";

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

export { Separator };
