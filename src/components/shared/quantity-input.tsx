"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
  disabled?: boolean;
  decimals?: number;
}

export function QuantityInput({ value, onChange, unit, className, disabled, decimals = 2 }: QuantityInputProps) {
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
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <div className="flex items-center gap-1">
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
      {unit && <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[2rem]">{unit}</span>}
    </div>
  );
}
