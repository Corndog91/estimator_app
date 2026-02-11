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

interface Alternate {
  id: string;
  name: string;
  description: string | null;
  addDeduct: string;
  amount: number;
  sortOrder: number;
}

export default function AlternatesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [alternates, setAlternates] = useState<Alternate[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/alternates`)
      .then((r) => r.json())
      .then((data) => { setAlternates(data); setLoaded(true); });
  }, [projectId]);

  const addAlternate = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/alternates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const item = await res.json();
      setAlternates((prev) => [...prev, item]);
    }
  }, [projectId]);

  const deleteAlternate = useCallback(async (id: string) => {
    setSaveStatus("saving");
    const previousAlternates = alternates;
    setAlternates((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await fetch(`/api/projects/${projectId}/alternates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete alternate");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setAlternates(previousAlternates);
      setSaveStatus("error");
    }
  }, [alternates, projectId]);

  const updateAlternate = useCallback(async (id: string, field: string, value: string | number) => {
    setSaveStatus("saving");
    const previousAlternates = alternates;
    setAlternates((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

    try {
      const res = await fetch(`/api/projects/${projectId}/alternates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update alternate");
      const updated = await res.json();
      setAlternates((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setAlternates(previousAlternates);
      setSaveStatus("error");
    }
  }, [alternates, projectId]);

  const netTotal = alternates.reduce((sum, a) => {
    return sum + (a.addDeduct === "ADD" ? a.amount : -a.amount);
  }, 0);

  if (!loaded) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Alternates</h3>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          <Button size="sm" onClick={addAlternate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Alternate
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Add/Deduct</TableHead>
                  <TableHead className="w-[140px] text-right">Amount</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alternates.map((alt) => (
                  <TableRow key={alt.id} className="group">
                    <TableCell>
                      <Input
                        defaultValue={alt.name}
                        onBlur={(e) => updateAlternate(alt.id, "name", e.target.value)}
                        className="h-8 border-0 shadow-none focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={alt.description || ""}
                        onBlur={(e) => updateAlternate(alt.id, "description", e.target.value)}
                        className="h-8 border-0 shadow-none focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={alt.addDeduct}
                        onValueChange={(v) => updateAlternate(alt.id, "addDeduct", v)}
                      >
                        <SelectTrigger className="h-8 border-0 shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADD">Add</SelectItem>
                          <SelectItem value="DEDUCT">Deduct</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={alt.amount || ""}
                        onBlur={(e) => updateAlternate(alt.id, "amount", parseFloat(e.target.value) || 0)}
                        className="h-8 border-0 shadow-none focus-visible:ring-1 text-right tabular-nums"
                        inputMode="decimal"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteAlternate(alt.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {alternates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No alternates defined.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {alternates.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Net Alternates</p>
                <p className={`text-lg font-semibold tabular-nums ${netTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {netTotal >= 0 ? "+" : ""}{formatCurrency(netTotal)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
