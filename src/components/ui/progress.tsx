import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number; // 0–100
  className?: string;
  label?: string; // optional inline label on the bar
};

export function Progress({ value, className, label }: Props) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-100", className)}>
      <div
        className="h-full rounded-full bg-blue-500 transition-[width]"
        style={{ width: `${pct}%` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        role="progressbar"
      />
      {label ? <div className="mt-1 text-xs text-gray-500">{label}</div> : null}
    </div>
  );
}
