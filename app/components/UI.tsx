"use client";

import React from "react";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white shadow-sm p-5">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function Field({ label, suffix, children }: { label: string; suffix?: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <div className="text-sm text-zinc-600 mb-1">{label}</div>
      <div className="relative">
        {children}
        {suffix ? (
          <span className="absolute inset-y-0 right-3 flex items-center text-zinc-500 text-sm">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

export function Input({ value, onChange, prefix, type = "number", min = 0, step = "0.01" }: {
  value: number | string;
  onChange: (v: number) => void;
  prefix?: string;
  type?: string;
  min?: number;
  step?: string | number;
}) {
  const displayValue = value === 0 ? "" : value;
  return (
    <div className="relative">
      {prefix ? (
        <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">{prefix}</span>
      ) : null}
      <input
        className="w-full rounded-md border border-black/10 bg-white text-zinc-900 placeholder-zinc-500 px-3 py-2 pl-7 focus:outline-none focus:ring-2 focus:ring-[--color-brand-teal]"
        type={type}
        inputMode="decimal"
        min={min}
        step={step}
        value={displayValue}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

export function Tabs({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[var(--color-teal-50)] p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`${
              active
                ? "bg-[var(--color-brand-teal)] text-white shadow"
                : "text-zinc-700 hover:text-zinc-900"
            } px-4 py-1.5 rounded-full text-sm font-medium transition-colors`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Table({
  rows,
  header,
  footer,
}: {
  rows: Array<{ name: string; amount: number; percent: number }>;
  header?: string;
  footer?: { label: string; value: number };
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-black/10">
      {header ? (
        <div className="px-4 py-2 bg-[var(--color-teal-50)] border-b border-black/10 text-sm font-medium">
          {header}
        </div>
      ) : null}
      <div className="divide-y divide-black/10">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between px-4 py-2">
            <div className="truncate mr-4">{row.name}</div>
            <div className="text-right tabular-nums text-sm">
              <span className="inline-block w-20">${row.amount.toLocaleString()}</span>
              <span className="inline-flex items-center justify-center h-5 px-1.5 rounded bg-[var(--color-teal-50)] text-[var(--color-teal-700)] ml-2 text-[11px] font-medium">{(row.percent * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
      {footer ? (
        <div className="px-4 py-2 bg-[var(--color-teal-50)] border-t border-black/10 flex items-center justify-between font-medium">
          <div>{footer.label}</div>
          <div className="tabular-nums">${footer.value.toLocaleString()}</div>
        </div>
      ) : null}
    </div>
  );
}

export function Select({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  const base = "rounded-md border border-black/10 bg-white text-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-brand-teal] text-sm";
  return (
    <select
      className={className ? `${base} ${className}` : base}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}


