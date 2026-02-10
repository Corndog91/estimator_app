"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatNumber, calculateLineItemTotal, calculateDays } from "@/lib/calculations";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  crewCost: number;
  productionRate: number;
  days: number;
  totalCost: number;
  notes: string | null;
  sortOrder: number;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface LineItemTableProps {
  sectionId: string;
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  onSaveStatusChange: (status: SaveStatus) => void;
}

export function LineItemTable({ sectionId, items, onItemsChange, onSaveStatusChange }: LineItemTableProps) {
  const addItem = useCallback(async () => {
    const res = await fetch("/api/bid/line-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidSectionId: sectionId }),
    });
    if (res.ok) {
      const item = await res.json();
      onItemsChange([...items, item]);
    }
  }, [sectionId, items, onItemsChange]);

  const deleteItem = useCallback(
    async (itemId: string) => {
      await fetch(`/api/bid/line-items/${itemId}`, { method: "DELETE" });
      onItemsChange(items.filter((i) => i.id !== itemId));
    },
    [items, onItemsChange]
  );

  const updateItem = useCallback(
    async (itemId: string, field: string, value: string | number) => {
      onSaveStatusChange("saving");

      // Optimistic update with recalculated fields
      const updated = items.map((item) => {
        if (item.id !== itemId) return item;
        const newItem = { ...item, [field]: value };
        const qty = field === "quantity" ? Number(value) : item.quantity;
        const price = field === "unitPrice" ? Number(value) : item.unitPrice;
        const rate = field === "productionRate" ? Number(value) : item.productionRate;
        newItem.totalCost = calculateLineItemTotal(qty, price);
        newItem.days = calculateDays(qty, rate);
        return newItem;
      });
      onItemsChange(updated);

      try {
        const res = await fetch(`/api/bid/line-items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });
        if (res.ok) {
          onSaveStatusChange("saved");
          setTimeout(() => onSaveStatusChange("idle"), 2000);
        } else {
          onSaveStatusChange("error");
        }
      } catch {
        onSaveStatusChange("error");
      }
    },
    [items, onItemsChange, onSaveStatusChange]
  );

  const sectionTotal = useMemo(() => items.reduce((sum, li) => sum + li.totalCost, 0), [items]);
  const totalDays = useMemo(() => Math.max(...items.map((li) => li.days), 0), [items]);

  return (
    <div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[250px]">Description</TableHead>
              <TableHead className="w-[100px] text-right">Qty</TableHead>
              <TableHead className="w-[60px]">Unit</TableHead>
              <TableHead className="w-[110px] text-right">Unit Price</TableHead>
              <TableHead className="w-[110px] text-right">Crew Cost</TableHead>
              <TableHead className="w-[100px] text-right">Prod Rate</TableHead>
              <TableHead className="w-[80px] text-right">Days</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                onUpdate={updateItem}
                onDelete={deleteItem}
              />
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No line items. Click &quot;Add Item&quot; to start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-3">
        <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
          <Plus className="h-3 w-3" />
          Add Item
        </Button>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">
            Max duration: <span className="font-medium text-foreground">{formatNumber(totalDays, 1)} days</span>
          </span>
          <span className="text-muted-foreground">
            Section total: <span className="font-semibold text-foreground">{formatCurrency(sectionTotal)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function LineItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: LineItem;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
}) {
  const handleBlur = useCallback(
    (field: string, value: string, type: "string" | "number" = "string") => {
      const parsed = type === "number" ? parseFloat(value) || 0 : value;
      onUpdate(item.id, field, parsed);
    },
    [item.id, onUpdate]
  );

  return (
    <TableRow className="group">
      <TableCell>
        <Input
          defaultValue={item.description}
          onBlur={(e) => handleBlur("description", e.target.value)}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.quantity || ""}
          onBlur={(e) => handleBlur("quantity", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.unit}
          onBlur={(e) => handleBlur("unit", e.target.value)}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-center"
          placeholder="CY"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.unitPrice || ""}
          onBlur={(e) => handleBlur("unitPrice", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.crewCost || ""}
          onBlur={(e) => handleBlur("crewCost", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={item.productionRate || ""}
          onBlur={(e) => handleBlur("productionRate", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
        {formatNumber(item.days, 1)}
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium text-sm">
        {formatCurrency(item.totalCost)}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
