"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({
  label,
  id,
  className,
  error,
  ...props
}: InputFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
