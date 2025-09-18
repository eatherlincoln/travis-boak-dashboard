import React, { PropsWithChildren } from "react";

type SoftCardProps = PropsWithChildren<{
  className?: string;
}>;

export default function SoftCard({ className = "", children }: SoftCardProps) {
  return (
    <div
      className={
        // Soft outline + subtle shadow + rounded corners
        "bg-white rounded-xl ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow " +
        className
      }
    >
      {children}
    </div>
  );
}
