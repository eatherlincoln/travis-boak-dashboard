import React from "react";

export default function AdminLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
}
