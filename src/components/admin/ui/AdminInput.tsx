import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function AdminInput({ className, ...props }: Props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm",
        "text-neutral-900 placeholder:text-neutral-400",
        "focus:outline-none focus:ring-2 focus:ring-black/10",
        className || "",
      ].join(" ")}
    />
  );
}

export function AdminLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-neutral-600">{children}</label>
  );
}

export function AdminNote({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-neutral-500">{children}</p>;
}
