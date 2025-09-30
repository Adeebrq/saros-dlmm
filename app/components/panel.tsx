import React from "react";
import { cn } from "../lib/utils";

function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="panel"
      className={cn(
        "screen-line-before-inner screen-line-after-inner border-x border-edge",
        className
      )}
      {...props}
    />
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn("screen-line-after-inner px-2", className)}
      {...props}
    />
  );
}

function PanelTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h2"> & { asChild?: boolean }) {
  // Custom implementation without Radix Slot
  if (asChild) {
    const child = React.Children.only(props.children) as React.ReactElement<any>;
    return React.cloneElement(child, {
      "data-slot": "panel-title",
      className: cn("text-3xl font-semibold", className, child.props?.className),
      ...props,
      children: child.props?.children,
    });
  }

  return (
    <h2
      data-slot="panel-title"
      className={cn("text-3xl font-semibold", className)}
      {...props}
    />
  );
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="panel-body" className={cn("p-4", className)} {...props} />
  );
}

export { Panel, PanelContent, PanelHeader, PanelTitle };
