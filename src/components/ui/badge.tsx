import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700",
        className
      )}
      {...props}
    />
  );
}
