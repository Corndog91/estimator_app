"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency } from "@/lib/calculations";
import { calculateHaulTruck, calculateCompaction, calculateHaulBalance, calculateExcavationCrew } from "@/lib/calculations";
import type { HaulTruckInputs, CompactionInputs, HaulBalanceInputs, ExcavationCrewInputs } from "@/lib/calculations";
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

  // Haul Balance State
  const [haulBalanceInputs, setHaulBalanceInputs] = useState<HaulBalanceInputs>({
    topsoilStripCY: 2000,
    buildingPadCutCY: 8000,
    pondExcavationCY: 3000,
    pavingUtilityCutCY: 1500,
    otherCutCY: 0,
    buildingPadFillCY: 5000,
    pavingUtilityFillCY: 2000,
    topsoilRespreadCY: 1800,
    otherFillCY: 0,
    shrinkagePct: 12,
    swellPct: 20,
    usablePct: 100,
  });

  // Production / Crew State
  const [crewInputs, setCrewInputs] = useState<ExcavationCrewInputs>({
    quantity: 10000,
    productionRatePerDay: 2050,
    crewCostPerDay: 4500,
    equipmentCostPerDay: 6500,
  });

  const haulResults = useMemo(() => calculateHaulTruck(haulInputs), [haulInputs]);
  const compResults = useMemo(() => calculateCompaction(compInputs), [compInputs]);
  const haulBalanceResults = useMemo(() => calculateHaulBalance(haulBalanceInputs), [haulBalanceInputs]);
  const crewResults = useMemo(() => calculateExcavationCrew(crewInputs), [crewInputs]);

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
    <div className="space-y-6 max-w-5xl">
      <h3 className="text-xl font-semibold">Calculators</h3>

      <Tabs defaultValue="haul-truck">
        <TabsList>
          <TabsTrigger value="haul-truck">Haul Truck</TabsTrigger>
          <TabsTrigger value="compaction">Compaction</TabsTrigger>
          <TabsTrigger value="haul-balance">Haul Balance</TabsTrigger>
          <TabsTrigger value="production-crew">Production / Crew</TabsTrigger>
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

        <TabsContent value="haul-balance" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Inputs Card ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Haul Balance Inputs</CardTitle>
                <CardDescription>Complete site balance with topsoil &amp; material quality tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cut / Material Sources</p>
                {[
                  { key: "topsoilStripCY", label: "Topsoil Strip (CY)", step: 100 },
                  { key: "buildingPadCutCY", label: "Building Pad Cut (CY)", step: 100 },
                  { key: "pondExcavationCY", label: "Pond Excavation (CY)", step: 100 },
                  { key: "pavingUtilityCutCY", label: "Paving / Utility Cut (CY)", step: 100 },
                  { key: "otherCutCY", label: "Other Cut (CY)", step: 100 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-48 text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={haulBalanceInputs[key as keyof HaulBalanceInputs]}
                      onChange={(e) => setHaulBalanceInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className="w-28 text-right tabular-nums"
                    />
                  </div>
                ))}

                <Separator />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fill Requirements</p>
                {[
                  { key: "buildingPadFillCY", label: "Building Pad Fill (CY)", step: 100 },
                  { key: "pavingUtilityFillCY", label: "Paving / Utility Fill (CY)", step: 100 },
                  { key: "topsoilRespreadCY", label: "Topsoil Respread (CY)", step: 100 },
                  { key: "otherFillCY", label: "Other Fill (CY)", step: 100 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-48 text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={haulBalanceInputs[key as keyof HaulBalanceInputs]}
                      onChange={(e) => setHaulBalanceInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className="w-28 text-right tabular-nums"
                    />
                  </div>
                ))}

                <Separator />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adjustment Factors</p>
                {[
                  { key: "shrinkagePct", label: "Shrinkage %", step: 0.5 },
                  { key: "swellPct", label: "Swell %", step: 0.5 },
                  { key: "usablePct", label: "Usable Material %", step: 1 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-48 text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={haulBalanceInputs[key as keyof HaulBalanceInputs]}
                      onChange={(e) => setHaulBalanceInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                      className="w-28 text-right tabular-nums"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ── Results Card ── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Site Cut Summary */}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Site Cut Summary</p>
                {[
                  { label: "Total Cut", value: haulBalanceResults.totalCutCY },
                  { label: "Common Cut (excl. topsoil)", value: haulBalanceResults.commonCutCY },
                  { label: "Usable Cut", value: haulBalanceResults.usableCutCY },
                  { label: "Unusable Cut", value: haulBalanceResults.unusableCutCY },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium tabular-nums">{formatNumber(value, 0)} CY</span>
                  </div>
                ))}

                <Separator />
                {/* Topsoil Balance */}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topsoil Balance</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available (stripped)</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.topsoilAvailableCY, 0)} CY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Needed (respread)</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.topsoilNeededCY, 0)} CY</span>
                </div>
                {haulBalanceResults.topsoilExcessCY > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600 dark:text-amber-400">Excess Topsoil</span>
                    <span className="font-medium tabular-nums text-amber-600 dark:text-amber-400">{formatNumber(haulBalanceResults.topsoilExcessCY, 0)} CY</span>
                  </div>
                )}
                {haulBalanceResults.topsoilDeficitCY > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">Topsoil Deficit</span>
                    <span className="font-medium tabular-nums text-red-600 dark:text-red-400">{formatNumber(haulBalanceResults.topsoilDeficitCY, 0)} CY</span>
                  </div>
                )}
                {haulBalanceResults.topsoilExcessCY === 0 && haulBalanceResults.topsoilDeficitCY === 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Topsoil Balanced</span>
                    <span className="font-medium tabular-nums text-green-600 dark:text-green-400">0 CY</span>
                  </div>
                )}

                <Separator />
                {/* Earthwork Balance */}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Earthwork Balance</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fill Required</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.totalFillRequiredCY, 0)} CY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usable Cut (compacted)</span>
                  <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.usableCutCompactedCY, 0)} CY</span>
                </div>
                {haulBalanceResults.fillSurplusCY > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-600 dark:text-amber-400">Fill Surplus</span>
                    <span className="font-medium tabular-nums text-amber-600 dark:text-amber-400">{formatNumber(haulBalanceResults.fillSurplusCY, 0)} CY</span>
                  </div>
                )}
                {haulBalanceResults.fillDeficitCY > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 dark:text-red-400">Fill Deficit</span>
                    <span className="font-medium tabular-nums text-red-600 dark:text-red-400">{formatNumber(haulBalanceResults.fillDeficitCY, 0)} CY</span>
                  </div>
                )}
                {haulBalanceResults.fillSurplusCY === 0 && haulBalanceResults.fillDeficitCY === 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Earthwork Balanced</span>
                    <span className="font-medium tabular-nums text-green-600 dark:text-green-400">0 CY</span>
                  </div>
                )}

                <Separator />
                {/* Haul Summary */}
                <div className={cn(
                  "rounded-lg p-3 space-y-2",
                  haulBalanceResults.netDirection === "HAUL_OUT" && "bg-amber-50 dark:bg-amber-950/30",
                  haulBalanceResults.netDirection === "HAUL_IN" && "bg-red-50 dark:bg-red-950/30",
                  haulBalanceResults.netDirection === "BALANCED" && "bg-green-50 dark:bg-green-950/30",
                )}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Haul Summary</p>

                  {haulBalanceResults.totalHaulOutLooseCY > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Waste Out (loose)</span>
                        <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.wasteOutLooseCY, 0)} LCY</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Topsoil Out (loose)</span>
                        <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.topsoilOutLooseCY, 0)} LCY</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Haul Out</span>
                        <span className="tabular-nums">{formatNumber(haulBalanceResults.totalHaulOutLooseCY, 0)} LCY</span>
                      </div>
                    </>
                  )}

                  {haulBalanceResults.totalHaulInCY > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Borrow In</span>
                        <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.borrowInCY, 0)} CY</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Topsoil In</span>
                        <span className="font-medium tabular-nums">{formatNumber(haulBalanceResults.topsoilInCY, 0)} CY</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Haul In</span>
                        <span className="tabular-nums">{formatNumber(haulBalanceResults.totalHaulInCY, 0)} CY</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-center pt-1">
                    <Badge className={cn(
                      "text-sm px-3 py-1",
                      haulBalanceResults.netDirection === "HAUL_OUT" && "bg-amber-500 hover:bg-amber-600",
                      haulBalanceResults.netDirection === "HAUL_IN" && "bg-red-500 hover:bg-red-600",
                      haulBalanceResults.netDirection === "BALANCED" && "bg-green-500 hover:bg-green-600",
                    )}>
                      {haulBalanceResults.netDirection === "HAUL_OUT" && `HAUL OUT ${formatNumber(haulBalanceResults.totalHaulOutLooseCY, 0)} LCY`}
                      {haulBalanceResults.netDirection === "HAUL_IN" && `HAUL IN ${formatNumber(haulBalanceResults.totalHaulInCY, 0)} CY`}
                      {haulBalanceResults.netDirection === "BALANCED" && "BALANCED"}
                    </Badge>
                  </div>
                </div>

                <Separator />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => saveSnapshot("IMPORT_EXPORT", haulBalanceInputs, haulBalanceResults)}
                >
                  <Save className="h-3 w-3" />
                  Save Snapshot
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="production-crew" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Production / Crew Inputs</CardTitle>
                <CardDescription>Estimate duration and cost from production assumptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: "quantity", label: "Quantity", step: 100 },
                  { key: "productionRatePerDay", label: "Production / Day", step: 10 },
                  { key: "crewCostPerDay", label: "Crew Cost / Day ($)", step: 100 },
                  { key: "equipmentCostPerDay", label: "Equipment Cost / Day ($)", step: 100 },
                ].map(({ key, label, step }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-44 text-sm">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={crewInputs[key as keyof ExcavationCrewInputs]}
                      onChange={(e) => setCrewInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
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
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium tabular-nums">{formatNumber(crewResults.durationDays, 1)} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Crew Cost</span>
                  <span className="font-medium tabular-nums">{formatCurrency(crewResults.crewCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equipment Cost</span>
                  <span className="font-medium tabular-nums">{formatCurrency(crewResults.equipmentCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Cost</span>
                  <span className="tabular-nums">{formatCurrency(crewResults.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Cost</span>
                  <span className="font-medium tabular-nums">{formatCurrency(crewResults.unitCost)}</span>
                </div>
                <Separator />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => saveSnapshot("EXCAVATION_CREW", crewInputs, crewResults)}
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
