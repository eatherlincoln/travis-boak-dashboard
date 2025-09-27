import React from "react";

type Props = {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  className?: string;
};

export default function NumberField({
  label,
  value,
  onChange,
  className,
}: Props) {
  const toNumOrEmpty = (s: string) => (s === "" ? "" : Number(s));
  return (
    <div className={className}>
      <label className="block text-sm text-neutral-600 mb-1">{label}</label>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(toNumOrEmpty(e.target.value))}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500"
      />
    </div>
  );
}
