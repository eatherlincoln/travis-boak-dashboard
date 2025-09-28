import React from "react";

type Props = {
  onClick?: () => void;
  saving?: boolean;
  label?: string;
  className?: string;
};

export default function SaveButton({
  onClick,
  saving,
  label = "Save",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={`rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 ${className}`}
    >
      {saving ? "Saving…" : label}
    </button>
  );
}
