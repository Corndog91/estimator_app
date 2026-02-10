"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatNumber } from "@/lib/calculations";
import { calculateHaulTruck, calculateCompaction } from "@/lib/calculations";
import type { HaulTruckInputs, CompactionInputs } from "@/lib/calculations";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CalculatorsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();

  // Haul Truck State
  const [haulInputs, setHaulInputs] = useState<HaulTruckInputs>({
    totalVolumeCY: 5000, truckCapacityCY: 14, loadTimeMin: 3,
    haulTimeMin: 10, returnTimeMin: 8, dumpTimeMin: 2, hoursPerDay: 8,
  });

  // Compaction State
  const [compInputs, setCompInputs] = useState<CompactionInputs>({
    totalVolumeCY: 5000, liftThicknessIn: 8, areaSF: 20000,
    passesRequired: 4, compactorWidthFt: 6, compactorSpeedFPM: 150, hoursPerDay: 8,
  });

  const haulResults = useMemo(() => calculateHaulTruck(haulInputs), [haulInputs]);
  const compResults = useMemo(() => calculateCompaction(compInputs), [compInputs]);

  const saveSnapshot = useCallback(async (type: string, inputs: object, outputs: object) => {
    const res = await fetch(`/api/projects/${projectId}/calculators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calculatorType: type, name: `${type} Snapshot`, inputs, outputs }),
    });
    if (res.ok) {
      toast({ title: "Saved", description: "Calculator snapshot saved to project." });
    }
  }, [projectId, toast]);

  return (
    <div className="space-y-6 max-w-4xl">
      <h3 className="text-xl font-semibold">Calculators</h3>

      <Tabs defaultValue="haul-truck">
        <TabsList>
          <TabsTrigger value="haul-truck">Haul Truck</TabsTrigger>
          <TabsTrigger value="compaction">Compaction</TabsTrigger>
        </TabsList>

        <TabsContent value="haul-truck" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Haul Truck Inputs</CardTitle>
                <CardDescription>Configure haul cycle parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "totalVolumeCY", label: "Total Volume (CY)", step: 100 },
                  { key: "truckCapacityCY", label: "Truck Capacity (CY)", step: 1 },
                  { key: "loadTimeMin", label: "Load Time (min)", step: 0.5 },
                  { key: "haulTimeMin", label: "Haul Time (min)", step: 1 },
                  { key: "returnTimeMin", label: "Return Time (min)", step: 1 },
                  { key: "dumpTimeMin", label: "Dump Time (min)", step: 0.5 },
                  { key: "hoursPerDay", label: "Hours/Day", step: 0.5 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-44 text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={haulInputs[key as keyof HaulTruckInputs]}
                      onChange={(e) => setHaulInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className="w-28 text-right tabular-nums"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cycle Time</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulResults.cycleTimeMin, 1)} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cycles/Hour</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulResults.cyclesPerHour, 1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CY/Hour</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulResults.cyPerHour, 1)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Loads</span>
                  <span className="font-medium tabular-nums">{haulResults.totalLoads}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulResults.totalHours, 1)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Days</span>
                  <span className="tabular-nums">{formatNumber(haulResults.totalDays, 1)}</span>
                </div>
                <Separator />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => saveSnapshot("HAUL_TRUCK", haulInputs, haulResults)}
                >
                  <Save className="h-3 w-3" />
                  Save Snapshot
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compaction" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compaction Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "totalVolumeCY", label: "Total Volume (CY)", step: 100 },
                  { key: "liftThicknessIn", label: "Lift Thickness (in)", step: 1 },
                  { key: "areaSF", label: "Area (SF)", step: 100 },
                  { key: "passesRequired", label: "Passes Required", step: 1 },
                  { key: "compactorWidthFt", label: "Compactor Width (ft)", step: 0.5 },
                  { key: "compactorSpeedFPM", label: "Compactor Speed (FPM)", step: 10 },
                  { key: "hoursPerDay", label: "Hours/Day", step: 0.5 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-44 text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={compInputs[key as keyof CompactionInputs]}
                      onChange={(e) => setCompInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className="w-28 text-right tabular-nums"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Lifts</span>
                  <span className="font-medium tabular-nums">{compResults.totalLifts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SF/Hour</span>
                  <span className="font-medium tabular-nums">{formatNumber(compResults.sfPerHour, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hours/Lift</span>
                  <span className="font-medium tabular-nums">{formatNumber(compResults.hoursPerLift, 1)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Hours</span>
                  <span className="font-medium tabular-nums">{formatNumber(compResults.totalHours, 1)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Days</span>
                  <span className="tabular-nums">{formatNumber(compResults.totalDays, 1)}</span>
                </div>
                <Separator />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => saveSnapshot("COMPACTION", compInputs, compResults)}
                >
                  <Save className="h-3 w-3" />
                  Save Snapshot
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
