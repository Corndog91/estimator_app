"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/calculations";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { LineItemTable } from "@/components/bid/line-item-table";
import { AutoSaveIndicator } from "@/components/shared/auto-save-indicator";

type SaveStatus = "idle" | "saving" | "saved" | "error";

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

interface BidSection {
  id: string;
  name: string;
  sectionType: string;
  sortOrder: number;
  lineItems: LineItem[];
}

const sectionTypes = [
  "BUILDING_PAD", "PAVING", "PONDS", "SITE_CLEARING",
  "EROSION", "UTILITIES", "TRUCKING", "MISC",
];

export default function BidPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [sections, setSections] = useState<BidSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState("MISC");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    const project = await res.json();
    setSections(project.bidSections || []);
    if (!loaded) {
      setExpandedSections(new Set<string>((project.bidSections || []).map((s: BidSection) => s.id)));
    }
    setLoaded(true);
  }, [projectId, loaded]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const addSection = useCallback(async () => {
    if (!newSectionName.trim()) return;
    const res = await fetch("/api/bid/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, name: newSectionName, sectionType: newSectionType }),
    });
    if (res.ok) {
      const section = await res.json();
      setSections((prev) => [...prev, section]);
      setExpandedSections((prev) => { const next = new Set(Array.from(prev)); next.add(section.id); return next; });
      setNewSectionName("");
      setDialogOpen(false);
    }
  }, [projectId, newSectionName, newSectionType]);

  const deleteSection = useCallback(async (sectionId: string) => {
    if (!confirm("Delete this section and all its line items?")) return;
    await fetch(`/api/bid/sections/${sectionId}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }, []);

  const updateSectionItems = useCallback((sectionId: string, items: LineItem[]) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, lineItems: items } : s)));
  }, []);

  const grandTotal = sections.reduce(
    (sum, s) => sum + s.lineItems.reduce((iSum, li) => iSum + li.totalCost, 0), 0
  );

  if (!loaded) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">BID Sections</h3>
        <div className="flex items-center gap-3">
          <AutoSaveIndicator status={saveStatus} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add BID Section</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Section Name</Label>
                  <Input
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="e.g., Building Pad - Main Office"
                    onKeyDown={(e) => e.key === "Enter" && addSection()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newSectionType} onValueChange={setNewSectionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addSection} className="w-full">Add Section</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No bid sections yet. Add your first section to start estimating.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const sectionTotal = section.lineItems.reduce((sum, li) => sum + li.totalCost, 0);

          return (
            <Card key={section.id}>
              <CardHeader
                className="cursor-pointer hover:bg-accent/50 transition-colors py-3"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <div>
                      <CardTitle className="text-base">{section.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {section.sectionType.replace(/_/g, " ")} &middot; {section.lineItems.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold tabular-nums">{formatCurrency(sectionTotal)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-0">
                  <LineItemTable
                    sectionId={section.id}
                    items={section.lineItems}
                    onItemsChange={(items) => updateSectionItems(section.id, items)}
                    onSaveStatusChange={setSaveStatus}
                  />
                </CardContent>
              )}
            </Card>
          );
        })
      )}

      {sections.length > 0 && (
        <div className="flex justify-end p-4 border-t-2 bg-background sticky bottom-0">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Grand Total</p>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
