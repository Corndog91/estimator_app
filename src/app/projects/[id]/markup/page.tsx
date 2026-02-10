"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AutoSaveIndicator } from "@/components/shared/auto-save-indicator";
import { formatCurrency, calculateMarkupBreakdown } from "@/lib/calculations";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface MarkupData {
  overhead: number;
  profit: number;
  bond: number;
  tax: number;
  mobilization: number;
  insuranceRate: number;
}

export default function MarkupPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [config, setConfig] = useState<MarkupData>({
    overhead: 10, profit: 10, bond: 2, tax: 0, mobilization: 0, insuranceRate: 0,
  });
  const [bidTotal, setBidTotal] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((project) => {
        if (project.markupConfig) {
          setConfig({
            overhead: project.markupConfig.overhead,
            profit: project.markupConfig.profit,
            bond: project.markupConfig.bond,
            tax: project.markupConfig.tax,
            mobilization: project.markupConfig.mobilization,
            insuranceRate: project.markupConfig.insuranceRate,
          });
        }
        const total = (project.bidSections || []).reduce(
          (sum: number, s: { lineItems: { totalCost: number }[] }) =>
            sum + s.lineItems.reduce((iSum: number, li: { totalCost: number }) => iSum + li.totalCost, 0),
          0
        );
        setBidTotal(total);
        setLoaded(true);
      });
  }, [projectId]);

  const save = useCallback(async (updates: Partial<MarkupData>) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/projects/${projectId}/markup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [projectId]);

  const updateField = useCallback((field: keyof MarkupData, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof MarkupData) => {
    save({ [field]: config[field] });
  }, [config, save]);

  const breakdown = useMemo(() => calculateMarkupBreakdown(bidTotal, config), [bidTotal, config]);

  if (!loaded) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Markup Configuration</h3>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Markup Percentages</CardTitle>
            <CardDescription>Configure overhead, profit, and fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "overhead" as const, label: "Overhead %", step: 0.5 },
              { key: "profit" as const, label: "Profit %", step: 0.5 },
              { key: "bond" as const, label: "Bond %", step: 0.1 },
              { key: "tax" as const, label: "Tax %", step: 0.1 },
              { key: "insuranceRate" as const, label: "Insurance Rate %", step: 0.1 },
            ].map(({ key, label, step }) => (
              <div key={key} className="flex items-center gap-4">
                <Label className="w-40 text-sm">{label}</Label>
                <Input
                  type="number"
                  step={step}
                  value={config[key]}
                  onChange={(e) => updateField(key, parseFloat(e.target.value) || 0)}
                  onBlur={() => handleBlur(key)}
                  className="w-24 text-right tabular-nums"
                />
              </div>
            ))}
            <Separator />
            <div className="flex items-center gap-4">
              <Label className="w-40 text-sm">Mobilization $</Label>
              <Input
                type="number"
                step={100}
                value={config.mobilization}
                onChange={(e) => updateField("mobilization", parseFloat(e.target.value) || 0)}
                onBlur={() => handleBlur("mobilization")}
                className="w-32 text-right tabular-nums"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Margin Preview</CardTitle>
            <CardDescription>Live calculation based on current BID total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Cost (BID Total)</span>
              <span className="tabular-nums font-medium">{formatCurrency(bidTotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">+ Overhead ({config.overhead}%)</span>
              <span className="tabular-nums">{formatCurrency(breakdown.overhead)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">+ Profit ({config.profit}%)</span>
              <span className="tabular-nums">{formatCurrency(breakdown.profit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums font-medium">{formatCurrency(breakdown.subtotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">+ Bond ({config.bond}%)</span>
              <span className="tabular-nums">{formatCurrency(breakdown.bond)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">+ Tax ({config.tax}%)</span>
              <span className="tabular-nums">{formatCurrency(breakdown.tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">+ Mobilization</span>
              <span className="tabular-nums">{formatCurrency(breakdown.mobilization)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Bid Amount</span>
              <span className="tabular-nums">{formatCurrency(breakdown.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Margin</span>
              <span className="tabular-nums font-medium text-green-600">
                {breakdown.marginPercent.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
