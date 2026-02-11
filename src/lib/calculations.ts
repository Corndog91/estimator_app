// ─── Earthwork Calculation Engine ──────────────────────────
// Pure functions with defensive math — no #DIV/0! errors possible

export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  return denominator === 0 ? fallback : numerator / denominator;
}

export function calculateLineItemTotal(qty: number, unitPrice: number): number {
  return qty * unitPrice;
}

export function calculateDays(qty: number, productionRate: number): number {
  return safeDivide(qty, productionRate);
}

/** Convert cubic feet to cubic yards, applying shrinkage factor */
export function calculateCutVolume(area: number, avgDepth: number, shrinkagePct: number): number {
  return safeDivide(area * avgDepth * (1 + shrinkagePct / 100), 27);
}

/** Convert cubic feet to cubic yards, applying swell factor */
export function calculateFillVolume(area: number, avgDepth: number, swellPct: number): number {
  return safeDivide(area * avgDepth * (1 + swellPct / 100), 27);
}

export interface MarkupInputs {
  overhead: number;
  profit: number;
  bond: number;
  tax: number;
  mobilization: number;
  insuranceRate?: number;
}

export function calculateMarkupTotal(baseCost: number, config: MarkupInputs): number {
  const overhead = baseCost * (config.overhead / 100);
  const profit = (baseCost + overhead) * (config.profit / 100);
  const subtotal = baseCost + overhead + profit;
  const bond = subtotal * (config.bond / 100);
  const tax = subtotal * (config.tax / 100);
  const insurance = subtotal * ((config.insuranceRate ?? 0) / 100);
  return subtotal + bond + tax + insurance + config.mobilization;
}

export function calculateMarkupBreakdown(baseCost: number, config: MarkupInputs) {
  const overhead = baseCost * (config.overhead / 100);
  const profit = (baseCost + overhead) * (config.profit / 100);
  const subtotal = baseCost + overhead + profit;
  const bond = subtotal * (config.bond / 100);
  const tax = subtotal * (config.tax / 100);
  const insurance = subtotal * ((config.insuranceRate ?? 0) / 100);
  const total = subtotal + bond + tax + insurance + config.mobilization;
  const marginPercent = safeDivide(total - baseCost, total) * 100;

  return { overhead, profit, subtotal, bond, tax, insurance, total, mobilization: config.mobilization, marginPercent };
}

export function calculateSectionTotal(lineItems: { quantity: number; unitPrice: number }[]): number {
  return lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item.quantity, item.unitPrice), 0);
}

export function calculateGrandTotal(sectionTotals: number[]): number {
  return sectionTotals.reduce((sum, t) => sum + t, 0);
}

// ─── Elevation / Area Calculations ─────────────────────────

export function calculateCutOrFill(existing: number, proposed: number): { type: "CUT" | "FILL"; depth: number } {
  const diff = existing - proposed;
  return diff >= 0 ? { type: "CUT", depth: diff } : { type: "FILL", depth: Math.abs(diff) };
}

export function calculateVolume(area: number, depth: number): number {
  return safeDivide(area * depth, 27); // Convert CF to CY
}

// ─── Haul Truck Calculator ─────────────────────────────────

export interface HaulTruckInputs {
  totalVolumeCY: number;
  truckCapacityCY: number;
  loadTimeMin: number;
  haulTimeMin: number;
  returnTimeMin: number;
  dumpTimeMin: number;
  hoursPerDay: number;
}

export function calculateHaulTruck(inputs: HaulTruckInputs) {
  const cycleTimeMin = inputs.loadTimeMin + inputs.haulTimeMin + inputs.returnTimeMin + inputs.dumpTimeMin;
  const cyclesPerHour = safeDivide(60, cycleTimeMin);
  const cyPerHour = cyclesPerHour * inputs.truckCapacityCY;
  const totalHours = safeDivide(inputs.totalVolumeCY, cyPerHour);
  const totalDays = safeDivide(totalHours, inputs.hoursPerDay);
  const totalLoads = Math.ceil(safeDivide(inputs.totalVolumeCY, inputs.truckCapacityCY));

  return { cycleTimeMin, cyclesPerHour, cyPerHour, totalHours, totalDays, totalLoads };
}

// ─── Compaction Calculator ─────────────────────────────────

export interface CompactionInputs {
  totalVolumeCY: number;
  liftThicknessIn: number;
  areaSF: number;
  passesRequired: number;
  compactorWidthFt: number;
  compactorSpeedFPM: number;
  hoursPerDay: number;
}

export function calculateCompaction(inputs: CompactionInputs) {
  const totalLifts = Math.ceil(safeDivide(inputs.totalVolumeCY * 27, inputs.areaSF * (inputs.liftThicknessIn / 12)));
  const sfPerPass = inputs.compactorWidthFt * inputs.compactorSpeedFPM * 60;
  const sfPerHour = safeDivide(sfPerPass, inputs.passesRequired);
  const hoursPerLift = safeDivide(inputs.areaSF, sfPerHour);
  const totalHours = hoursPerLift * totalLifts;
  const totalDays = safeDivide(totalHours, inputs.hoursPerDay);

  return { totalLifts, sfPerHour, hoursPerLift, totalHours, totalDays };
}

// ─── Haul Balance Calculator ────────────────────────────────

export interface HaulBalanceInputs {
  // Cut / Material Sources
  topsoilStripCY: number;
  buildingPadCutCY: number;
  pondExcavationCY: number;
  pavingUtilityCutCY: number;
  otherCutCY: number;
  // Fill Requirements
  buildingPadFillCY: number;
  pavingUtilityFillCY: number;
  topsoilRespreadCY: number;
  otherFillCY: number;
  // Adjustment Factors
  shrinkagePct: number;
  swellPct: number;
  usablePct: number;
}

export interface HaulBalanceOutputs {
  // Site Cut Summary
  totalCutCY: number;
  commonCutCY: number;
  usableCutCY: number;
  unusableCutCY: number;
  // Topsoil Balance
  topsoilAvailableCY: number;
  topsoilNeededCY: number;
  topsoilExcessCY: number;
  topsoilDeficitCY: number;
  // Earthwork Balance
  totalFillRequiredCY: number;
  usableCutCompactedCY: number;
  fillSurplusCY: number;
  fillDeficitCY: number;
  // Haul Summary
  swellFactor: number;
  wasteOutLooseCY: number;
  topsoilOutLooseCY: number;
  totalHaulOutLooseCY: number;
  borrowInCY: number;
  topsoilInCY: number;
  totalHaulInCY: number;
  netDirection: "HAUL_OUT" | "HAUL_IN" | "BALANCED";
}

export function calculateHaulBalance(inputs: HaulBalanceInputs): HaulBalanceOutputs {
  // Site Cut Summary
  const totalCutCY = inputs.topsoilStripCY + inputs.buildingPadCutCY
    + inputs.pondExcavationCY + inputs.pavingUtilityCutCY + inputs.otherCutCY;
  const commonCutCY = inputs.buildingPadCutCY + inputs.pondExcavationCY
    + inputs.pavingUtilityCutCY + inputs.otherCutCY;
  const usableCutCY = commonCutCY * (inputs.usablePct / 100);
  const unusableCutCY = commonCutCY - usableCutCY;

  // Topsoil Balance (separate material stream)
  const topsoilAvailableCY = inputs.topsoilStripCY;
  const topsoilNeededCY = inputs.topsoilRespreadCY;
  const topsoilExcessCY = Math.max(topsoilAvailableCY - topsoilNeededCY, 0);
  const topsoilDeficitCY = Math.max(topsoilNeededCY - topsoilAvailableCY, 0);

  // Common Earthwork Balance
  const totalFillRequiredCY = inputs.buildingPadFillCY + inputs.pavingUtilityFillCY + inputs.otherFillCY;
  const usableCutCompactedCY = usableCutCY * (1 - inputs.shrinkagePct / 100);
  const fillSurplusCY = Math.max(usableCutCompactedCY - totalFillRequiredCY, 0);
  const fillDeficitCY = Math.max(totalFillRequiredCY - usableCutCompactedCY, 0);

  // Haul Out (loose CY for trucking)
  const swellFactor = 1 + inputs.swellPct / 100;
  const wasteOutLooseCY = (unusableCutCY + fillSurplusCY) * swellFactor;
  const topsoilOutLooseCY = topsoilExcessCY * swellFactor;
  const totalHaulOutLooseCY = wasteOutLooseCY + topsoilOutLooseCY;

  // Haul In (compacted CY)
  const borrowInCY = fillDeficitCY;
  const topsoilInCY = topsoilDeficitCY;
  const totalHaulInCY = borrowInCY + topsoilInCY;

  // Net Direction
  const netDirection: HaulBalanceOutputs["netDirection"] =
    totalHaulOutLooseCY > 0 ? "HAUL_OUT" : totalHaulInCY > 0 ? "HAUL_IN" : "BALANCED";

  return {
    totalCutCY, commonCutCY, usableCutCY, unusableCutCY,
    topsoilAvailableCY, topsoilNeededCY, topsoilExcessCY, topsoilDeficitCY,
    totalFillRequiredCY, usableCutCompactedCY, fillSurplusCY, fillDeficitCY,
    swellFactor, wasteOutLooseCY, topsoilOutLooseCY, totalHaulOutLooseCY,
    borrowInCY, topsoilInCY, totalHaulInCY, netDirection,
  };
}

// ─── Production / Crew Calculator ───────────────────────────

export interface ExcavationCrewInputs {
  quantity: number;
  productionRatePerDay: number;
  crewCostPerDay: number;
  equipmentCostPerDay: number;
}

export function calculateExcavationCrew(inputs: ExcavationCrewInputs) {
  const durationDays = safeDivide(inputs.quantity, inputs.productionRatePerDay);
  const crewCost = durationDays * inputs.crewCostPerDay;
  const equipmentCost = durationDays * inputs.equipmentCostPerDay;
  const totalCost = crewCost + equipmentCost;
  const unitCost = safeDivide(totalCost, inputs.quantity);

  return {
    durationDays,
    crewCost,
    equipmentCost,
    totalCost,
    unitCost,
  };
}

// ─── Format Helpers ────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}
