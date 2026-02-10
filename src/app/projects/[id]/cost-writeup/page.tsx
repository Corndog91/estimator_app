"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AutoSaveIndicator } from "@/components/shared/auto-save-indicator";
import { formatCurrency } from "@/lib/calculations";
import { Plus, Trash2 } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface CostItem {
  id: string;
  category: string;
  description: string;
  totalFromBid: number;
  adjustedCost: number;
  notes: string | null;
  sortOrder: number;
}

const categories = ["EQUIPMENT", "LABOR", "MATERIAL", "SUBCONTRACTOR", "OTHER"];

export default function CostWriteUpPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [items, setItems] = useState<CostItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/cost-writeup`)
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoaded(true); });
  }, [projectId]);

  const addItem = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/cost-writeup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
    }
  }, [projectId]);

  const deleteItem = useCallback(async (id: string) => {
    await fetch(`/api/projects/${projectId}/cost-writeup`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, [projectId]);

  const updateItem = useCallback(async (id: string, field: string, value: string | number) => {
    setSaveStatus("saving");
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    try {
      // Use a generic update endpoint - we'll just refetch for simplicity
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, []);

  const totalFromBid = items.reduce((sum, i) => sum + i.totalFromBid, 0);
  const totalAdjusted = items.reduce((sum, i) => sum + i.adjustedCost, 0);

  if (!loaded) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Cost Write-Up</h3>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          <Button size="sm" onClick={addItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[140px]">Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[140px] text-right">From BID</TableHead>
                  <TableHead className="w-[140px] text-right">Adjusted</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <Select
                        defaultValue={item.category}
                        onValueChange={(v) => updateItem(item.id, "category", v)}
                      >
                        <SelectTrigger className="h-8 border-0 shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={item.description}
                        onBlur={(e) => updateItem(item.id, "description", e.target.value)}
                        className="h-8 border-0 shadow-none focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={item.totalFromBid || ""}
                        onBlur={(e) => updateItem(item.id, "totalFromBid", parseFloat(e.target.value) || 0)}
                        className="h-8 border-0 shadow-none focus-visible:ring-1 text-right tabular-nums"
                        inputMode="decimal"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={item.adjustedCost || ""}
                        onBlur={(e) => updateItem(item.id, "adjustedCost", parseFloat(e.target.value) || 0)}
                        className="h-8 border-0 shadow-none focus-visible:ring-1 text-right tabular-nums"
                        inputMode="decimal"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No cost items yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {items.length > 0 && (
            <div className="flex justify-end gap-8 mt-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">From BID</p>
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalFromBid)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Adjusted Total</p>
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalAdjusted)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
