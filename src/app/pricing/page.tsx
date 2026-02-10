"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AutoSaveIndicator } from "@/components/shared/auto-save-indicator";
import { Plus, Trash2, Star, DollarSign, Settings2 } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const sectionTypes = [
  "BUILDING_PAD", "PAVING", "PONDS", "SITE_CLEARING",
  "EROSION", "UTILITIES", "TRUCKING", "MISC",
] as const;

const sectionTypeLabels: Record<string, string> = {
  BUILDING_PAD: "Building Pad",
  PAVING: "Paving",
  PONDS: "Ponds",
  SITE_CLEARING: "Site Clearing",
  EROSION: "Erosion",
  UTILITIES: "Utilities",
  TRUCKING: "Trucking",
  MISC: "Misc",
};

// ─── Unit Price Types ─────────────────────────────────────

interface UnitPrice {
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

// ─── Default Pricing Config Types ─────────────────────────

interface PricingConfig {
  id: string;
  name: string;
  overhead: number;
  profit: number;
  bond: number;
  tax: number;
  mobilization: number;
  insuranceRate: number;
  isDefault: boolean;
}

export default function PricingDashboard() {
  return (
    <div className="container py-8 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pricing Dashboard</h1>
        <p className="text-muted-foreground">Manage unit prices and default pricing parameters for bid generation</p>
      </div>

      <Tabs defaultValue="unit-prices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unit-prices" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Unit Prices
          </TabsTrigger>
          <TabsTrigger value="pricing-params" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Pricing Parameters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unit-prices">
          <UnitPricesTab />
        </TabsContent>

        <TabsContent value="pricing-params">
          <PricingParamsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Unit Prices Tab ──────────────────────────────────────

function UnitPricesTab() {
  const [prices, setPrices] = useState<UnitPrice[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    category: "MISC" as string,
    description: "",
    unit: "",
    unitPrice: 0,
    crewCost: 0,
    productionRate: 0,
    notes: "",
  });
  const [loaded, setLoaded] = useState(false);

  const fetchPrices = useCallback(async () => {
    const url = filterCategory === "ALL"
      ? "/api/pricing/unit-prices"
      : `/api/pricing/unit-prices?category=${filterCategory}`;
    const res = await fetch(url);
    if (res.ok) {
      setPrices(await res.json());
    }
    setLoaded(true);
  }, [filterCategory]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const addPrice = useCallback(async () => {
    if (!newItem.description.trim()) return;
    const res = await fetch("/api/pricing/unit-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      const created = await res.json();
      setPrices((prev) => [...prev, created]);
      setNewItem({ category: "MISC", description: "", unit: "", unitPrice: 0, crewCost: 0, productionRate: 0, notes: "" });
      setDialogOpen(false);
    }
  }, [newItem]);

  const updatePrice = useCallback(async (id: string, field: string, value: string | number) => {
    setSaveStatus("saving");
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    try {
      const res = await fetch(`/api/pricing/unit-prices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
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
  }, []);

  const deletePrice = useCallback(async (id: string) => {
    await fetch(`/api/pricing/unit-prices/${id}`, { method: "DELETE" });
    setPrices((prev) => prev.filter((p) => p.id !== id));
  }, []);

  if (!loaded) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {sectionTypes.map((t) => (
                <SelectItem key={t} value={t}>{sectionTypeLabels[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AutoSaveIndicator status={saveStatus} />
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Unit Price
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Unit Price</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem((p) => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((t) => (
                      <SelectItem key={t} value={t}>{sectionTypeLabels[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g., Strip Topsoil"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={newItem.unit}
                    onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="CY, SF, LF..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price ($)</Label>
                  <Input
                    type="number"
                    step={0.01}
                    value={newItem.unitPrice || ""}
                    onChange={(e) => setNewItem((p) => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Crew Cost ($)</Label>
                  <Input
                    type="number"
                    step={0.01}
                    value={newItem.crewCost || ""}
                    onChange={(e) => setNewItem((p) => ({ ...p, crewCost: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Production Rate</Label>
                  <Input
                    type="number"
                    step={1}
                    value={newItem.productionRate || ""}
                    onChange={(e) => setNewItem((p) => ({ ...p, productionRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={newItem.notes}
                  onChange={(e) => setNewItem((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Any notes about this price..."
                />
              </div>
              <Button onClick={addPrice} className="w-full">Add Unit Price</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[250px]">Description</TableHead>
                  <TableHead className="w-[80px]">Unit</TableHead>
                  <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                  <TableHead className="w-[120px] text-right">Crew Cost</TableHead>
                  <TableHead className="w-[120px] text-right">Prod Rate</TableHead>
                  <TableHead className="w-[200px]">Notes</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      No unit prices yet. Add your first unit price to build your pricing library.
                    </TableCell>
                  </TableRow>
                ) : (
                  prices.map((price) => (
                    <UnitPriceRow
                      key={price.id}
                      price={price}
                      onUpdate={updatePrice}
                      onDelete={deletePrice}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {prices.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {prices.length} unit price{prices.length !== 1 ? "s" : ""} in library
        </p>
      )}
    </div>
  );
}

function UnitPriceRow({
  price,
  onUpdate,
  onDelete,
}: {
  price: UnitPrice;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
}) {
  const handleBlur = useCallback(
    (field: string, value: string, type: "string" | "number" = "string") => {
      const parsed = type === "number" ? parseFloat(value) || 0 : value;
      onUpdate(price.id, field, parsed);
    },
    [price.id, onUpdate]
  );

  return (
    <TableRow className="group">
      <TableCell>
        <Badge variant="outline" className="font-normal">
          {sectionTypeLabels[price.category] || price.category}
        </Badge>
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price.description}
          onBlur={(e) => handleBlur("description", e.target.value)}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price.unit}
          onBlur={(e) => handleBlur("unit", e.target.value)}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-center"
          placeholder="CY"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price.unitPrice || ""}
          onBlur={(e) => handleBlur("unitPrice", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price.crewCost || ""}
          onBlur={(e) => handleBlur("crewCost", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price.productionRate || ""}
          onBlur={(e) => handleBlur("productionRate", e.target.value, "number")}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-right tabular-nums"
          inputMode="decimal"
        />
      </TableCell>
      <TableCell>
        <Input
          defaultValue={price.notes || ""}
          onBlur={(e) => handleBlur("notes", e.target.value)}
          className="h-8 border-0 shadow-none focus-visible:ring-1 bg-transparent text-muted-foreground"
          placeholder="Notes..."
        />
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(price.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ─── Pricing Parameters Tab ───────────────────────────────

function PricingParamsTab() {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    name: "",
    overhead: 10,
    profit: 10,
    bond: 2,
    tax: 0,
    mobilization: 0,
    insuranceRate: 0,
    isDefault: false,
  });
  const [loaded, setLoaded] = useState(false);

  const fetchConfigs = useCallback(async () => {
    const res = await fetch("/api/pricing/defaults");
    if (res.ok) {
      setConfigs(await res.json());
    }
    setLoaded(true);
  }, []);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const addConfig = useCallback(async () => {
    if (!newConfig.name.trim()) return;
    const res = await fetch("/api/pricing/defaults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });
    if (res.ok) {
      const created = await res.json();
      if (created.isDefault) {
        setConfigs((prev) => prev.map((c) => ({ ...c, isDefault: false })));
      }
      setConfigs((prev) => [...prev, created]);
      setNewConfig({ name: "", overhead: 10, profit: 10, bond: 2, tax: 0, mobilization: 0, insuranceRate: 0, isDefault: false });
      setDialogOpen(false);
    }
  }, [newConfig]);

  const updateConfig = useCallback(async (id: string, field: string, value: string | number | boolean) => {
    setSaveStatus("saving");

    if (field === "isDefault" && value === true) {
      setConfigs((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
    } else {
      setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    }

    try {
      const res = await fetch(`/api/pricing/defaults/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
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
  }, []);

  const deleteConfig = useCallback(async (id: string) => {
    await fetch(`/api/pricing/defaults/${id}`, { method: "DELETE" });
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (!loaded) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AutoSaveIndicator status={saveStatus} />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pricing Preset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Pricing Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Preset Name</Label>
                <Input
                  value={newConfig.name}
                  onChange={(e) => setNewConfig((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Standard Commercial, Residential..."
                />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "overhead" as const, label: "Overhead %", step: 0.5 },
                  { key: "profit" as const, label: "Profit %", step: 0.5 },
                  { key: "bond" as const, label: "Bond %", step: 0.1 },
                  { key: "tax" as const, label: "Tax %", step: 0.1 },
                  { key: "insuranceRate" as const, label: "Insurance %", step: 0.1 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={newConfig[key]}
                      onChange={(e) => setNewConfig((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                      className="text-right tabular-nums"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label className="text-sm">Mobilization $</Label>
                  <Input
                    type="number"
                    step={100}
                    value={newConfig.mobilization}
                    onChange={(e) => setNewConfig((p) => ({ ...p, mobilization: parseFloat(e.target.value) || 0 }))}
                    className="text-right tabular-nums"
                  />
                </div>
              </div>
              <Button onClick={addConfig} className="w-full">Add Preset</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Settings2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No pricing presets</h3>
            <p className="text-muted-foreground mb-4">Create preset markup configurations to quickly apply to new projects</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pricing Preset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <PricingConfigCard
              key={config.id}
              config={config}
              onUpdate={updateConfig}
              onDelete={deleteConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PricingConfigCard({
  config,
  onUpdate,
  onDelete,
}: {
  config: PricingConfig;
  onUpdate: (id: string, field: string, value: string | number | boolean) => void;
  onDelete: (id: string) => void;
}) {
  const handleBlur = useCallback(
    (field: string, value: string, type: "string" | "number" = "number") => {
      const parsed = type === "number" ? parseFloat(value) || 0 : value;
      onUpdate(config.id, field, parsed);
    },
    [config.id, onUpdate]
  );

  return (
    <Card className={config.isDefault ? "ring-2 ring-orange-500/50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              defaultValue={config.name}
              onBlur={(e) => handleBlur("name", e.target.value, "string")}
              className="h-8 w-48 border-0 shadow-none focus-visible:ring-1 bg-transparent font-semibold text-base"
            />
            {config.isDefault && (
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Default
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!config.isDefault && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => onUpdate(config.id, "isDefault", true)}
              >
                <Star className="h-3 w-3" />
                Set Default
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(config.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Markup percentages and fixed costs applied to bids</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { key: "overhead", label: "Overhead %", step: 0.5 },
            { key: "profit", label: "Profit %", step: 0.5 },
            { key: "bond", label: "Bond %", step: 0.1 },
            { key: "tax", label: "Tax %", step: 0.1 },
            { key: "insuranceRate", label: "Insurance %", step: 0.1 },
          ].map(({ key, label, step }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                type="number"
                step={step}
                defaultValue={config[key as keyof PricingConfig] as number}
                onBlur={(e) => handleBlur(key, e.target.value)}
                className="h-8 text-right tabular-nums"
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Mobilization $</Label>
            <Input
              type="number"
              step={100}
              defaultValue={config.mobilization}
              onBlur={(e) => handleBlur("mobilization", e.target.value)}
              className="h-8 text-right tabular-nums"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
