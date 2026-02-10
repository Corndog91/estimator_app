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
}

export function calculateMarkupTotal(baseCost: number, config: MarkupInputs): number {
  const overhead = baseCost * (config.overhead / 100);
  const profit = (baseCost + overhead) * (config.profit / 100);
  const subtotal = baseCost + overhead + profit;
  const bond = subtotal * (config.bond / 100);
  const tax = subtotal * (config.tax / 100);
  return subtotal + bond + tax + config.mobilization;
}

export function calculateMarkupBreakdown(baseCost: number, config: MarkupInputs) {
  const overhead = baseCost * (config.overhead / 100);
  const profit = (baseCost + overhead) * (config.profit / 100);
  const subtotal = baseCost + overhead + profit;
  const bond = subtotal * (config.bond / 100);
  const tax = subtotal * (config.tax / 100);
  const total = subtotal + bond + tax + config.mobilization;
  const marginPercent = safeDivide(total - baseCost, total) * 100;

  return { overhead, profit, subtotal, bond, tax, total, mobilization: config.mobilization, marginPercent };
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

// ─── Format Helpers ────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}
