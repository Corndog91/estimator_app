"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";

export interface UnitPrice {
  id: string;
  category: string;
  description: string;
  unit: string;
  unitPrice: number;
  crewCost: number;
  productionRate: number;
  notes: string | null;
  isActive: boolean;
}

interface PricingCatalogPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionType: string;
  mode: "multi" | "single";
  onSelect: (prices: UnitPrice[]) => void;
}

export function PricingCatalogPicker({
  open,
  onOpenChange,
  sectionType,
  mode,
  onSelect,
}: PricingCatalogPickerProps) {
  const [prices, setPrices] = useState<UnitPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setLoading(true);
    fetch(`/api/pricing/unit-prices?category=${sectionType}`)
      .then((res) => res.json())
      .then((data) => setPrices(data))
      .finally(() => setLoading(false));
  }, [open, sectionType]);

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSingleSelect = useCallback(
    (price: UnitPrice) => {
      onSelect([price]);
      onOpenChange(false);
    },
    [onSelect, onOpenChange]
  );

  const handleMultiConfirm = useCallback(() => {
    const items = prices.filter((p) => selected.has(p.id));
    if (items.length > 0) {
      onSelect(items);
      onOpenChange(false);
    }
  }, [prices, selected, onSelect, onOpenChange]);

  const label = sectionType.replace(/_/g, " ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {mode === "multi" ? "Browse Pricing Catalog" : "Select Price"}
          </DialogTitle>
          <DialogDescription>
            {mode === "multi"
              ? "Select items to add as new line items."
              : "Pick an item to apply its pricing."}
            <Badge variant="secondary" className="ml-2">
              {label}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-none border-t" shouldFilter>
          <CommandInput placeholder="Search by description..." />
          <CommandList className="max-h-none">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No matching prices found.</CommandEmpty>
                  <CommandGroup>
                    {prices.map((price) => {
                      const isSelected = selected.has(price.id);
                      return (
                        <CommandItem
                          key={price.id}
                          value={price.description}
                          onSelect={() =>
                            mode === "single"
                              ? handleSingleSelect(price)
                              : toggleItem(price.id)
                          }
                          className="flex items-start gap-3 py-3 px-3"
                        >
                          {mode === "multi" && (
                            <Checkbox
                              checked={isSelected}
                              className="mt-0.5"
                              tabIndex={-1}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-medium text-sm truncate">
                                {price.description}
                              </span>
                              <span className="text-sm font-semibold tabular-nums shrink-0">
                                {formatCurrency(price.unitPrice)}{" "}
                                <span className="text-muted-foreground font-normal">
                                  / {price.unit || "EA"}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              <span>
                                Crew: {formatCurrency(price.crewCost)}/day
                              </span>
                              <span>
                                Rate: {price.productionRate}{" "}
                                {price.unit || "EA"}/day
                              </span>
                            </div>
                            {price.notes && (
                              <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                                {price.notes}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </ScrollArea>
          </CommandList>
        </Command>

        {mode === "multi" && (
          <DialogFooter className="px-6 py-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selected.size === 0}
              onClick={handleMultiConfirm}
            >
              Add Selected ({selected.size})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
