import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** If false, we expose role="separator" for a11y. */
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        // Only use role if not decorative (for screen readers).
        role={decorative ? undefined : "separator"}
        aria-orientation={orientation}
        className={cn(
          "shrink-0 bg-neutral-200 dark:bg-neutral-800",
          orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

export { Separator };
