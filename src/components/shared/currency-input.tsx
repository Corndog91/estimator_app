"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({ value, onChange, className, disabled }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDisplayValue(value === 0 ? "" : value.toString());
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(displayValue);
    const newValue = isNaN(parsed) ? 0 : parsed;
    onChange(newValue);
    setDisplayValue(newValue.toString());
  }, [displayValue, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.-]/g, "");
    setDisplayValue(raw);
  }, []);

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={isFocused ? displayValue : formatted}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn("text-right tabular-nums", className)}
      disabled={disabled}
    />
  );
}
