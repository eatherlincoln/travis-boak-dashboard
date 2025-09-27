import React from "react";

interface SaveButtonProps {
  onClick: () => void;
  saving?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function SaveButton({
  onClick,
  saving = false,
  label = "Save",
  disabled = false,
}: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {saving ? "Saving…" : label}
    </button>
  );
}
