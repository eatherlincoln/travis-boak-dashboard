import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md";
};
export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition";
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" }[size];
  const variants = {
    default: "bg-gray-900 text-white hover:bg-black",
    secondary: "bg-white text-gray-900 border hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  }[variant];
  return <button className={cn(base, sizes, variants, className)} {...props} />;
}
