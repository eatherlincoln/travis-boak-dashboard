import React from "react";

export default function SaveButton({
  onClick,
  saving,
  label = "Save",
}: {
  onClick: () => void | Promise<void>;
  saving?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!!saving}
      className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-white text-sm hover:bg-neutral-800 disabled:opacity-50"
    >
      {saving ? "Saving…" : label}
    </button>
  );
}
