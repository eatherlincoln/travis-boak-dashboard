// src/lib/utils.ts
import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely.
 * Usage: className={cn("p-4", condition && "hidden")}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compact number format (e.g., 1.2K, 3.4M)
 */
export function formatCompact(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

/**
 * Percent formatter from a fraction (0.021 -> "2.1%")
 */
export function formatPct(fraction: number | null | undefined, digits = 2) {
  if (fraction == null || Number.isNaN(fraction)) return "0%";
  return `${(fraction * 100).toFixed(digits)}%`;
}

/**
 * Basic number with thousands separators.
 */
export function formatNumber(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "0";
  return n.toLocaleString();
}
