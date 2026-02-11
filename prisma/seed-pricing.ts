import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Clear existing pricing data ─────────────────────────
  await prisma.unitPrice.deleteMany({});
  await prisma.defaultPricingConfig.deleteMany({});

  // ═══════════════════════════════════════════════════════════
  // UNIT PRICES
  // Sources:
  //   - TxDOT Austin District 12-month rolling avg (Aug 2024)
  //   - TxDOT Travis County single-project data (where Austin Dist unavailable)
  //   - TxDOT Construction Production Rates (March 2024) — MED values
  //   - Holt CAT Machine Rental Rate Guide (July 2025)
  //   - ASCO Equipment active TerraFirma contracts
  //   - Barco Rent-A-Truck TerraFirma preferred pricing
  //   - City of Austin Avg Unit Bid Prices (water/wastewater)
  // ═══════════════════════════════════════════════════════════

  const unitPrices = await prisma.unitPrice.createMany({
    data: [
      // ─── BUILDING PAD ──────────────────────────────────────
      // Production rates from TxDOT 2024: Excavation MED 2,050 CY/day, Embankment MED 2,030 CY/day
      { category: "BUILDING_PAD", description: "Excavation (Roadway)", unit: "CY", unitPrice: 13.24, productionRate: 2050, notes: "TxDOT Austin Dist 110-6001 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Excavation (Channel)", unit: "CY", unitPrice: 9.64, productionRate: 2050, notes: "TxDOT Austin Dist 110-6002" },
      { category: "BUILDING_PAD", description: "Excavation (Special)", unit: "CY", unitPrice: 21.37, productionRate: 1000, notes: "TxDOT Austin Dist 110-6003 | Prod: TxDOT rock MED" },
      { category: "BUILDING_PAD", description: "Embankment (Final)(Ord Comp)(Type B)", unit: "CY", unitPrice: 17.76, productionRate: 2030, notes: "TxDOT Austin Dist 132-6003 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Embankment (Final)(Ord Comp)(Type C)", unit: "CY", unitPrice: 8.73, productionRate: 2030, notes: "TxDOT Austin Dist 132-6005" },
      { category: "BUILDING_PAD", description: "Embankment (Final)(Dens Ctrl)(Type C)", unit: "CY", unitPrice: 29.94, productionRate: 2030, notes: "TxDOT Austin Dist 132-6006" },
      { category: "BUILDING_PAD", description: "Embankment (Original)(Ord Comp)(Type B)", unit: "CY", unitPrice: 15.00, productionRate: 2030, notes: "TxDOT Austin Dist 132-6011" },
      { category: "BUILDING_PAD", description: "Strip Topsoil (6\")", unit: "CY", unitPrice: 3.50, productionRate: 800, notes: "Internal estimate" },
      { category: "BUILDING_PAD", description: "Mass Excavation", unit: "CY", unitPrice: 4.25, productionRate: 2050, notes: "Internal estimate | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Structural Fill", unit: "CY", unitPrice: 8.50, productionRate: 2030, notes: "Internal estimate | Prod: TxDOT embankment MED" },
      { category: "BUILDING_PAD", description: "Fine Grade", unit: "SF", unitPrice: 0.45, productionRate: 5000, notes: "Internal estimate" },
      { category: "BUILDING_PAD", description: "Furnish & Place Topsoil (4\")", unit: "SY", unitPrice: 1.84, productionRate: 2500, notes: "TxDOT Austin Dist 160-6003 | Prod: TxDOT seeding MED" },
      { category: "BUILDING_PAD", description: "General Use Compost (4\")", unit: "SY", unitPrice: 5.05, productionRate: 2500, notes: "TxDOT Austin Dist 161-6022" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type A Gr 1-2)(Final Pos)", unit: "CY", unitPrice: 65.23, productionRate: 750, notes: "TxDOT Statewide 247-6041 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type B Gr 1-2)(Final Pos)", unit: "CY", unitPrice: 40.00, productionRate: 750, notes: "TxDOT Statewide 247-6045 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type D Gr 1-2)(Final Pos)", unit: "CY", unitPrice: 40.09, productionRate: 750, notes: "TxDOT Statewide 247-6053 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type A Gr 3)", unit: "CY", unitPrice: 30.00, productionRate: 750, notes: "TxDOT Austin Dist 247-6043 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type A Gr 5)", unit: "CY", unitPrice: 46.33, productionRate: 750, notes: "TxDOT Austin Dist 247-6366 | Prod: TxDOT 2024 MED" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type B Gr 3)", unit: "CY", unitPrice: 45.00, productionRate: 750, notes: "TxDOT Austin Dist 247-6047" },
      { category: "BUILDING_PAD", description: "Flex Base (Comp in Place)(Type D Gr 5)", unit: "CY", unitPrice: 55.00, productionRate: 750, notes: "TxDOT Austin Dist 247-6392" },
      { category: "BUILDING_PAD", description: "Flex Base (Type A Gr 5)", unit: "TON", unitPrice: 59.88, productionRate: 750, notes: "TxDOT Austin Dist 247-6481" },
      { category: "BUILDING_PAD", description: "Subgrade Widening (Ord Comp)", unit: "STA", unitPrice: 669.69, productionRate: 0, notes: "TxDOT Austin Dist 112-6001" },
      { category: "BUILDING_PAD", description: "Sprinkling (Dust Control)", unit: "MG", unitPrice: 150.00, productionRate: 0, notes: "TxDOT Austin Dist 204-6003" },
      { category: "BUILDING_PAD", description: "Proof Roll", unit: "SF", unitPrice: 0.15, productionRate: 10000, notes: "Internal estimate" },

      // ─── SITE CLEARING ─────────────────────────────────────
      // Production rates: Removing Conc Pav MED 1,974 SY/day, Removing Conc MED 105 CY/day
      // Removing Stab Base & Asph MED 2,915 SY/day, Preparing ROW MED 3 AC/day
      { category: "SITE_CLEARING", description: "Preparing ROW", unit: "STA", unitPrice: 1092.86, productionRate: 3, notes: "TxDOT Austin Dist 100-6002 | Prod: TxDOT MED 3 AC/day" },
      { category: "SITE_CLEARING", description: "Remove Concrete Pavement", unit: "SY", unitPrice: 14.50, productionRate: 1974, notes: "TxDOT Travis Co 104-7008 | Prod: TxDOT 2024 MED" },
      { category: "SITE_CLEARING", description: "Remove Concrete (Driveways)", unit: "SY", unitPrice: 28.76, productionRate: 1974, notes: "TxDOT Travis Co 104-7011" },
      { category: "SITE_CLEARING", description: "Remove Concrete (Sidewalk/Ramp)", unit: "SY", unitPrice: 37.17, productionRate: 1974, notes: "TxDOT Travis Co 104-7013" },
      { category: "SITE_CLEARING", description: "Remove Concrete (Curb & Gutter)", unit: "LF", unitPrice: 11.45, productionRate: 0, notes: "TxDOT Travis Co 104-7017" },
      { category: "SITE_CLEARING", description: "Remove Concrete (Foundations)", unit: "CY", unitPrice: 500.00, productionRate: 105, notes: "TxDOT Travis Co 104-7024 | Prod: TxDOT MED" },
      { category: "SITE_CLEARING", description: "Remove Concrete (Riprap)", unit: "SY", unitPrice: 24.35, productionRate: 1974, notes: "TxDOT Travis Co 104-7006" },
      { category: "SITE_CLEARING", description: "Remove Stab Base & Asphalt Pavement", unit: "SY", unitPrice: 18.50, productionRate: 2915, notes: "TxDOT Travis Co 105-7015 | Prod: TxDOT 2024 MED" },
      { category: "SITE_CLEARING", description: "Remove Structures (Pipe)", unit: "LF", unitPrice: 45.00, productionRate: 0, notes: "TxDOT Travis Co 496-7007" },
      { category: "SITE_CLEARING", description: "Remove Structures (Inlet)", unit: "EA", unitPrice: 1750.00, productionRate: 0, notes: "TxDOT Travis Co 496-7002" },
      { category: "SITE_CLEARING", description: "Structural Excavation (Box)", unit: "CY", unitPrice: 21.84, productionRate: 2050, notes: "TxDOT Austin Dist 400-6002" },
      { category: "SITE_CLEARING", description: "Blading", unit: "HR", unitPrice: 90.05, productionRate: 0, notes: "TxDOT Austin Dist 150-6002" },
      // Fence removal / relocation
      { category: "SITE_CLEARING", description: "Remove Fence (Chain Link)", unit: "LF", unitPrice: 5.00, productionRate: 500, notes: "TxDOT Statewide avg 550-6003 ($5.96) & 550-2003 ($3.54)" },
      { category: "SITE_CLEARING", description: "Remove Fence (Wire/Barbed Wire)", unit: "LF", unitPrice: 2.50, productionRate: 800, notes: "Derived from TxDOT 542-6001 + wire fence labor premium" },
      { category: "SITE_CLEARING", description: "Relocate Fence (Chain Link)", unit: "LF", unitPrice: 18.00, productionRate: 200, notes: "Derived: remove ($5) + reinstall salvaged ($13) per TxDOT 550-6001" },
      // Power line / pole demolition
      { category: "SITE_CLEARING", description: "Demo Overhead Power Line", unit: "LF", unitPrice: 8.00, productionRate: 800, notes: "Industry avg de-energized distribution conductor removal ($5-$15/LF mid)" },
      { category: "SITE_CLEARING", description: "Demo Power Pole (Wood Distribution)", unit: "EA", unitPrice: 1500.00, productionRate: 5, notes: "Industry avg 30-40ft wood pole extract + load + dispose ($1,500-$3,000)" },

      // ─── PAVING ────────────────────────────────────────────
      // Production rates: ACP MED 978 TON/day, Curb & Gutter MED 554 LF/day, Sidewalks MED 132 SY/day
      { category: "PAVING", description: "Dense-Graded HMA Type-B PG64-22", unit: "TON", unitPrice: 73.54, productionRate: 978, notes: "TxDOT Austin Dist 340-6008 | Prod: TxDOT ACP MED" },
      { category: "PAVING", description: "Dense-Graded HMA Type-D PG64-22", unit: "TON", unitPrice: 82.10, productionRate: 978, notes: "TxDOT Austin Dist 340-6040" },
      { category: "PAVING", description: "Dense-Graded HMA Type-D SAC-A PG70-22", unit: "TON", unitPrice: 75.00, productionRate: 978, notes: "TxDOT Austin Dist 341-6041" },
      { category: "PAVING", description: "Dense-Graded HMA Type-D SAC-B PG70-22", unit: "TON", unitPrice: 82.97, productionRate: 978, notes: "TxDOT Austin Dist 341-6042" },
      { category: "PAVING", description: "Prime Coat (Multi Option)", unit: "GAL", unitPrice: 4.20, productionRate: 4500, notes: "TxDOT Austin Dist 310-6001 | Prod: TxDOT 2024 MED" },
      { category: "PAVING", description: "Prime Coat (AE-P)", unit: "GAL", unitPrice: 5.72, productionRate: 4500, notes: "TxDOT Austin Dist 310-6005" },
      { category: "PAVING", description: "Plane Asphalt Pavement (0\"-1\")", unit: "SY", unitPrice: 0.73, productionRate: 7430, notes: "TxDOT Austin Dist 354-6001 | Prod: TxDOT milling MED" },
      { category: "PAVING", description: "Plane Asphalt Pavement (1.5\")", unit: "SY", unitPrice: 0.99, productionRate: 7430, notes: "TxDOT Austin Dist 354-6041" },
      { category: "PAVING", description: "Flexible Pavement Repair (6\")", unit: "SY", unitPrice: 29.37, productionRate: 0, notes: "TxDOT Austin Dist 351-6002" },
      { category: "PAVING", description: "Concrete Curb & Gutter (Type I)", unit: "LF", unitPrice: 17.54, productionRate: 554, notes: "TxDOT Austin Dist 529-6007 | Prod: TxDOT 2024 MED" },
      { category: "PAVING", description: "Concrete Curb & Gutter (Type II)", unit: "LF", unitPrice: 19.35, productionRate: 554, notes: "TxDOT Austin Dist 529-6008 | Prod: TxDOT 2024 MED" },
      { category: "PAVING", description: "Concrete Curb (Mono)(Type II)", unit: "LF", unitPrice: 26.13, productionRate: 554, notes: "TxDOT Austin Dist 529-6005" },
      { category: "PAVING", description: "Concrete Sidewalks (4\")", unit: "SY", unitPrice: 56.73, productionRate: 132, notes: "TxDOT Austin Dist 531-6001 | Prod: TxDOT 2024 MED" },
      { category: "PAVING", description: "Concrete Sidewalks (5\")", unit: "SY", unitPrice: 46.33, productionRate: 132, notes: "TxDOT Austin Dist 531-6002 | Prod: TxDOT 2024 MED" },
      { category: "PAVING", description: "Concrete Sidewalks (6\")", unit: "SY", unitPrice: 66.45, productionRate: 132, notes: "TxDOT Austin Dist 531-6003" },
      { category: "PAVING", description: "Driveways (Concrete)", unit: "SY", unitPrice: 73.34, productionRate: 132, notes: "TxDOT Austin Dist 530-6004" },
      { category: "PAVING", description: "Driveways (ACP)", unit: "SY", unitPrice: 62.19, productionRate: 978, notes: "TxDOT Austin Dist 530-6005" },
      { category: "PAVING", description: "Driveways (Surf Treat)", unit: "SY", unitPrice: 21.92, productionRate: 0, notes: "TxDOT Austin Dist 530-6006" },
      { category: "PAVING", description: "Concrete Median", unit: "SY", unitPrice: 49.19, productionRate: 132, notes: "TxDOT Austin Dist 536-6002" },
      { category: "PAVING", description: "Curb Ramps (Type 1)", unit: "EA", unitPrice: 1334.72, productionRate: 0, notes: "TxDOT Austin Dist 531-6004" },
      { category: "PAVING", description: "Curb Ramps (Type 7)", unit: "EA", unitPrice: 1405.29, productionRate: 0, notes: "TxDOT Austin Dist 531-6010" },
      { category: "PAVING", description: "Landscape Pavers", unit: "SY", unitPrice: 53.84, productionRate: 0, notes: "TxDOT Austin Dist 528-6004" },
      { category: "PAVING", description: "Subgrade Preparation", unit: "SF", unitPrice: 0.65, productionRate: 4000, notes: "Internal estimate" },

      // ─── PONDS ─────────────────────────────────────────────
      { category: "PONDS", description: "Pond Excavation", unit: "CY", unitPrice: 5.00, productionRate: 2050, notes: "Internal estimate | Prod: TxDOT excavation MED" },
      { category: "PONDS", description: "Riprap (Concrete)(4\")", unit: "CY", unitPrice: 616.21, productionRate: 0, notes: "TxDOT Travis Co 432-7001" },
      { category: "PONDS", description: "Riprap (Concrete)(5\")", unit: "CY", unitPrice: 602.77, productionRate: 0, notes: "TxDOT Travis Co 432-7002" },
      { category: "PONDS", description: "Riprap (Stone Common)(Dry)(24\")", unit: "CY", unitPrice: 215.00, productionRate: 0, notes: "TxDOT Travis Co 432-7034" },
      { category: "PONDS", description: "Riprap (Stone Protection)(12\")", unit: "CY", unitPrice: 188.20, productionRate: 0, notes: "TxDOT Travis Co 432-7041" },
      { category: "PONDS", description: "Riprap (Stone Common)(Grout)(6\")", unit: "CY", unitPrice: 700.85, productionRate: 0, notes: "TxDOT Travis Co 432-7036" },

      // ─── EROSION ───────────────────────────────────────────
      { category: "EROSION", description: "Temp Sediment Control Fence (Install)", unit: "LF", unitPrice: 2.32, productionRate: 0, notes: "TxDOT Austin Dist 506-6038" },
      { category: "EROSION", description: "Temp Sediment Control Fence (Remove)", unit: "LF", unitPrice: 0.69, productionRate: 0, notes: "TxDOT Austin Dist 506-6039" },
      { category: "EROSION", description: "Rock Filter Dams (Install)(Type 1)", unit: "LF", unitPrice: 22.45, productionRate: 0, notes: "TxDOT Austin Dist 506-6001" },
      { category: "EROSION", description: "Rock Filter Dams (Install)(Type 2)", unit: "LF", unitPrice: 28.83, productionRate: 0, notes: "TxDOT Austin Dist 506-6002" },
      { category: "EROSION", description: "Rock Filter Dams (Install)(Type 3)", unit: "LF", unitPrice: 43.04, productionRate: 0, notes: "TxDOT Austin Dist 506-6003" },
      { category: "EROSION", description: "Rock Filter Dams (Remove)", unit: "LF", unitPrice: 9.86, productionRate: 0, notes: "TxDOT Austin Dist 506-6011" },
      { category: "EROSION", description: "Biodeg Erosion Control Logs (Install)(8\")", unit: "LF", unitPrice: 5.72, productionRate: 0, notes: "TxDOT Austin Dist 506-6040" },
      { category: "EROSION", description: "Biodeg Erosion Control Logs (Install)(12\")", unit: "LF", unitPrice: 1.77, productionRate: 0, notes: "TxDOT Austin Dist 506-6041" },
      { category: "EROSION", description: "Biodeg Erosion Control Logs (Remove)", unit: "LF", unitPrice: 1.15, productionRate: 0, notes: "TxDOT Austin Dist 506-6043" },
      { category: "EROSION", description: "Construction Exit (Install)(Type 1)", unit: "SY", unitPrice: 12.33, productionRate: 0, notes: "TxDOT Austin Dist 506-6020" },
      { category: "EROSION", description: "Construction Exit (Remove)", unit: "SY", unitPrice: 7.09, productionRate: 0, notes: "TxDOT Austin Dist 506-6024" },
      { category: "EROSION", description: "Sandbags for Erosion Control", unit: "EA", unitPrice: 0.27, productionRate: 0, notes: "TxDOT Austin Dist 506-6035" },
      { category: "EROSION", description: "Blading Work (Erosion & Sediment Ctrl)", unit: "HR", unitPrice: 150.00, productionRate: 0, notes: "TxDOT Austin Dist 506-6032" },
      { category: "EROSION", description: "Soil Retention Blanket (Class 1)(Type A)", unit: "SY", unitPrice: 0.82, productionRate: 0, notes: "TxDOT Austin Dist 169-6001" },
      { category: "EROSION", description: "Soil Retention Blanket (Class 1)(Type B)", unit: "SY", unitPrice: 1.34, productionRate: 0, notes: "TxDOT Austin Dist 169-6002" },
      { category: "EROSION", description: "Soil Retention Blanket (Class 1)(Type C)", unit: "SY", unitPrice: 1.43, productionRate: 0, notes: "TxDOT Austin Dist 169-6003" },
      { category: "EROSION", description: "Soil Retention Blanket (Class 2)(Type F)", unit: "SY", unitPrice: 1.66, productionRate: 0, notes: "TxDOT Austin Dist 169-6006" },
      { category: "EROSION", description: "Straw/Hay Mulch Seed (Temp)(Warm)", unit: "SY", unitPrice: 0.75, productionRate: 2500, notes: "TxDOT Austin Dist 164-6047 | Prod: TxDOT seeding MED" },
      { category: "EROSION", description: "Straw/Hay Mulch Seed (Temp)(Cool)", unit: "SY", unitPrice: 0.75, productionRate: 2500, notes: "TxDOT Austin Dist 164-6049" },
      { category: "EROSION", description: "Fertilizer", unit: "AC", unitPrice: 220.00, productionRate: 0, notes: "TxDOT Austin Dist 166-6001" },
      { category: "EROSION", description: "Vegetative Watering", unit: "MG", unitPrice: 24.14, productionRate: 0, notes: "TxDOT Austin Dist 168-6001" },
      { category: "EROSION", description: "Wildflower Seeding", unit: "AC", unitPrice: 1565.25, productionRate: 0, notes: "TxDOT Austin Dist 180-6001" },
      { category: "EROSION", description: "Inlet Protection", unit: "EA", unitPrice: 150.00, productionRate: 0, notes: "Internal estimate" },
      { category: "EROSION", description: "Construction Entrance", unit: "EA", unitPrice: 3500.00, productionRate: 0, notes: "Internal estimate" },

      // ─── UTILITIES ─────────────────────────────────────────
      // Production rates: RC Pipe MED 119 LF/day, CMP MED 117 LF/day, Box Culvert MED 74 LF/day
      // Junction Box MED 0.7 EA/day, Headwall MED 0.4 EA/day
      { category: "UTILITIES", description: "RC Pipe (Class III)(18\")", unit: "LF", unitPrice: 70.20, productionRate: 119, notes: "TxDOT Austin Dist 464-6003 | Prod: TxDOT 2024 MED" },
      { category: "UTILITIES", description: "RC Pipe (Class III)(24\")", unit: "LF", unitPrice: 88.88, productionRate: 119, notes: "TxDOT Austin Dist 464-6005 | Prod: TxDOT 2024 MED" },
      { category: "UTILITIES", description: "RC Pipe (Class III)(30\")", unit: "LF", unitPrice: 74.12, productionRate: 119, notes: "TxDOT Austin Dist 464-6007" },
      { category: "UTILITIES", description: "RC Pipe (Class III)(36\")", unit: "LF", unitPrice: 138.79, productionRate: 119, notes: "TxDOT Austin Dist 464-6008" },
      { category: "UTILITIES", description: "CMP (Galv Steel)(18\")", unit: "LF", unitPrice: 51.88, productionRate: 117, notes: "TxDOT Austin Dist 460-6002 | Prod: TxDOT CMP MED" },
      { category: "UTILITIES", description: "CMP (Galv Steel)(24\")", unit: "LF", unitPrice: 51.88, productionRate: 117, notes: "TxDOT Austin Dist 460-6003" },
      { category: "UTILITIES", description: "CMP (Galv Steel)(36\")", unit: "LF", unitPrice: 110.00, productionRate: 117, notes: "TxDOT Austin Dist 460-6005" },
      { category: "UTILITIES", description: "Concrete Box Culvert (3ft x 2ft)", unit: "LF", unitPrice: 428.77, productionRate: 74, notes: "TxDOT Austin Dist 462-6001 | Prod: TxDOT 2024 MED" },
      { category: "UTILITIES", description: "Concrete Box Culvert (5ft x 3ft)", unit: "LF", unitPrice: 300.00, productionRate: 74, notes: "TxDOT Austin Dist 462-6007" },
      { category: "UTILITIES", description: "Concrete Box Culvert (7ft x 5ft)", unit: "LF", unitPrice: 650.00, productionRate: 74, notes: "TxDOT Austin Dist 462-6016" },
      { category: "UTILITIES", description: "Manhole (Complete)(48\")", unit: "EA", unitPrice: 3626.25, productionRate: 0, notes: "TxDOT Austin Dist 465-6002" },
      { category: "UTILITIES", description: "Inlet (Complete)(PCO)(3ft)", unit: "EA", unitPrice: 4053.40, productionRate: 0, notes: "TxDOT Austin Dist 465-6013" },
      { category: "UTILITIES", description: "Inlet (Complete)(PCU)(3ft)(Both)", unit: "EA", unitPrice: 5493.02, productionRate: 0, notes: "TxDOT Austin Dist 465-6032" },
      { category: "UTILITIES", description: "Headwall (18\")", unit: "EA", unitPrice: 2890.00, productionRate: 0.4, notes: "TxDOT Austin Dist 466-6095 | Prod: TxDOT 2024 MED" },
      { category: "UTILITIES", description: "Trench Excavation Protection", unit: "LF", unitPrice: 2.78, productionRate: 0, notes: "TxDOT Austin Dist 402-6001" },
      { category: "UTILITIES", description: "Temporary Special Shoring", unit: "SF", unitPrice: 14.02, productionRate: 538, notes: "TxDOT Austin Dist 403-6001 | Prod: TxDOT 2024 MED" },
      { category: "UTILITIES", description: "Flowable Backfill", unit: "CY", unitPrice: 124.79, productionRate: 0, notes: "TxDOT Austin Dist 401-6001" },
      { category: "UTILITIES", description: "Cement Stabilized Backfill", unit: "CY", unitPrice: 133.18, productionRate: 0, notes: "TxDOT Austin Dist 400-6005" },
      { category: "UTILITIES", description: "Cut & Restore Concrete Paving", unit: "SY", unitPrice: 125.61, productionRate: 0, notes: "TxDOT Austin Dist 400-6007" },
      { category: "UTILITIES", description: "Cut & Restore Asphalt Paving", unit: "SY", unitPrice: 147.59, productionRate: 0, notes: "TxDOT Austin Dist 400-6008" },
      { category: "UTILITIES", description: "Jack and Bore Culvert", unit: "LF", unitPrice: 1095.00, productionRate: 40, notes: "TxDOT Travis Co 476-7023 | Prod: TxDOT 2024 MED" },
      // City of Austin water/wastewater bid prices
      { category: "UTILITIES", description: "Water Pipe (6\") DI Class 350", unit: "LF", unitPrice: 150.00, productionRate: 119, notes: "City of Austin 7056-6002" },
      { category: "UTILITIES", description: "Water Pipe (8\") DI Class 350", unit: "LF", unitPrice: 57.00, productionRate: 119, notes: "City of Austin 7056-6003" },
      { category: "UTILITIES", description: "Water Pipe (12\") DI Restrained Joint", unit: "LF", unitPrice: 120.00, productionRate: 119, notes: "City of Austin 7056-6069" },
      { category: "UTILITIES", description: "Gate Valve (6\")", unit: "EA", unitPrice: 1665.00, productionRate: 0, notes: "City of Austin 7056-6020" },
      { category: "UTILITIES", description: "Gate Valve (8\")", unit: "EA", unitPrice: 2200.00, productionRate: 0, notes: "City of Austin 7056-6021" },
      { category: "UTILITIES", description: "Fire Hydrant", unit: "EA", unitPrice: 5078.91, productionRate: 0, notes: "City of Austin 7056-6033" },
      { category: "UTILITIES", description: "Sanitary Sewer Pipe (6\") PVC SDR26", unit: "LF", unitPrice: 110.00, productionRate: 119, notes: "City of Austin 7060-6023" },
      { category: "UTILITIES", description: "Sanitary Sewer Pipe (8\") PVC SDR26", unit: "LF", unitPrice: 130.00, productionRate: 119, notes: "City of Austin 7060-6024" },
      { category: "UTILITIES", description: "Sanitary Manhole (48\") Precast w/CIP BS", unit: "EA", unitPrice: 5500.00, productionRate: 0, notes: "City of Austin 7060-6007" },
      { category: "UTILITIES", description: "Pipe Encasement (16\") Steel", unit: "LF", unitPrice: 79.00, productionRate: 0, notes: "City of Austin 7056-6056" },
      { category: "UTILITIES", description: "Pipe Encasement (36\") Steel (Bore)", unit: "LF", unitPrice: 1750.00, productionRate: 0, notes: "City of Austin 7056-6058" },

      // ─── TRUCKING ──────────────────────────────────────────
      { category: "TRUCKING", description: "Articulated Truck (CAT 730) Rental", unit: "MO", unitPrice: 16100.00, productionRate: 0, notes: "Holt CAT rate guide (10% discount available)" },
      { category: "TRUCKING", description: "Articulated Truck (CAT 735) Rental", unit: "MO", unitPrice: 18900.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "TRUCKING", description: "Articulated Truck (CAT 740) Rental", unit: "MO", unitPrice: 20800.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "TRUCKING", description: "Water Truck (Articulated)(CAT W00 730)", unit: "MO", unitPrice: 19600.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "TRUCKING", description: "Water Truck (HINO 268A)", unit: "MO", unitPrice: 3350.00, productionRate: 0, notes: "ASCO Equipment - active TerraFirma contract" },
      { category: "TRUCKING", description: "Water Truck (4000 gal)", unit: "MO", unitPrice: 5800.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "TRUCKING", description: "1/2 Ton Pickup Rental", unit: "MO", unitPrice: 1198.00, productionRate: 0, notes: "Barco Rent-A-Truck TerraFirma pricing" },
      { category: "TRUCKING", description: "3/4 Ton Pickup Rental", unit: "MO", unitPrice: 1198.00, productionRate: 0, notes: "Barco Rent-A-Truck TerraFirma pricing" },
      { category: "TRUCKING", description: "1 Ton Flatbed Rental", unit: "MO", unitPrice: 1798.00, productionRate: 0, notes: "Barco Rent-A-Truck TerraFirma pricing" },
      { category: "TRUCKING", description: "1 Ton Service Body Rental", unit: "MO", unitPrice: 2198.00, productionRate: 0, notes: "Barco Rent-A-Truck TerraFirma pricing" },
      { category: "TRUCKING", description: "Scraper (CAT 621) Rental", unit: "MO", unitPrice: 26100.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "TRUCKING", description: "Scraper (CAT 623) Rental", unit: "MO", unitPrice: 29600.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "TRUCKING", description: "Scraper (CAT 631) Rental", unit: "MO", unitPrice: 34700.00, productionRate: 0, notes: "Holt CAT rate guide" },

      // ─── SURVEY ──────────────────────────────────────────
      // Source: RSMeans 0221 Surveys
      // Topographical Surveys
      { category: "SURVEY", description: "Topographical Surveying, Conventional, Minimum", unit: "Acre", unitPrice: 645.30, productionRate: 3.30, notes: "RSMeans 0221 | Crew A7 | Bare Total $436.75" },
      { category: "SURVEY", description: "Topographical Surveying, Conventional, Maximum", unit: "Acre", unitPrice: 4482.00, productionRate: 0.60, notes: "RSMeans 0221 | Crew A8 | Bare Total $2,993.00" },
      // Boundary and Survey Markers
      { category: "SURVEY", description: "Lot Location & Lines, Large Quantities, Minimum", unit: "Acre", unitPrice: 1065.50, productionRate: 2.00, notes: "RSMeans 0221 | Crew A7 | Bare Total $719.50" },
      { category: "SURVEY", description: "Lot Location & Lines, Average", unit: "Acre", unitPrice: 1709.00, productionRate: 1.25, notes: "RSMeans 0221 | Crew A7 | Bare Total $1,149.00" },
      { category: "SURVEY", description: "Lot Location & Lines, Small Quantities, Maximum", unit: "Acre", unitPrice: 2736.00, productionRate: 1.00, notes: "RSMeans 0221 | Crew A8 | Bare Total $1,823.50" },
      { category: "SURVEY", description: "Monuments, 3' Long", unit: "EA", unitPrice: 239.55, productionRate: 10.00, notes: "RSMeans 0221 | Crew A7 | Bare Total $168.05" },
      { category: "SURVEY", description: "Property Lines, Perimeter, Cleared Land", unit: "LF", unitPrice: 2.14, productionRate: 1000.00, notes: "RSMeans 0221 | Crew A7 | Bare Total $1.44" },
      { category: "SURVEY", description: "Property Lines, Perimeter, Wooded Land", unit: "LF", unitPrice: 3.12, productionRate: 875.00, notes: "RSMeans 0221 | Crew A8 | Bare Total $2.10" },
      // Aerial Surveys
      { category: "SURVEY", description: "Aerial Surveying incl Ground Control, Min Fee, 10 Acres", unit: "Total", unitPrice: 4700.00, productionRate: 0, notes: "RSMeans 0221 | Lump sum minimum" },
      { category: "SURVEY", description: "Aerial Surveying incl Ground Control, 100 Acres", unit: "Total", unitPrice: 9400.00, productionRate: 0, notes: "RSMeans 0221 | Lump sum" },
      { category: "SURVEY", description: "Aerial Surveying, From Existing Photography, Deduct", unit: "Total", unitPrice: 1625.00, productionRate: 0, notes: "RSMeans 0221 | Deduct from aerial survey cost" },
      { category: "SURVEY", description: "Aerial Survey, 2' Contours, 10 Acres", unit: "Acre", unitPrice: 470.00, productionRate: 0, notes: "RSMeans 0221" },
      { category: "SURVEY", description: "Aerial Survey, 2' Contours, 100 Acres", unit: "Acre", unitPrice: 94.00, productionRate: 0, notes: "RSMeans 0221" },
      { category: "SURVEY", description: "Aerial Survey, 2' Contours, 1,000 Acres", unit: "Acre", unitPrice: 90.00, productionRate: 0, notes: "RSMeans 0221" },
      { category: "SURVEY", description: "Aerial Survey, 2' Contours, 10,000 Acres", unit: "Acre", unitPrice: 85.00, productionRate: 0, notes: "RSMeans 0221" },
      // ─── MISC (Equipment Rental Rates) ─────────────────────
      { category: "MISC", description: "Dozer (CAT D3) Rental", unit: "MO", unitPrice: 6450.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (CAT D4) Rental", unit: "MO", unitPrice: 8150.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (CAT D5) Rental", unit: "MO", unitPrice: 10900.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (CAT D6) Rental", unit: "MO", unitPrice: 14900.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (CAT D6 XE) Rental", unit: "MO", unitPrice: 16200.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (CAT D7) Rental", unit: "MO", unitPrice: 21300.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (CAT D8) Rental", unit: "MO", unitPrice: 28100.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Dozer (Case 1150M) Rental", unit: "MO", unitPrice: 6898.00, productionRate: 0, notes: "ASCO Equipment - active TerraFirma contract" },
      { category: "MISC", description: "Excavator (CAT 320) Rental", unit: "MO", unitPrice: 7750.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Excavator (CAT 323) Rental", unit: "MO", unitPrice: 8500.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Excavator (CAT 330) Rental", unit: "MO", unitPrice: 11700.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Excavator (CAT 336) Rental", unit: "MO", unitPrice: 12300.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Excavator (CAT 349/350) Rental", unit: "MO", unitPrice: 17300.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Mini Excavator (CAT 308CR) Rental", unit: "MO", unitPrice: 4400.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Mini Excavator (CAT 315) Rental", unit: "MO", unitPrice: 6500.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Motor Grader (CAT 120/140) Rental", unit: "MO", unitPrice: 12200.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Motor Grader (CAT 140 AWD) Rental", unit: "MO", unitPrice: 13500.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Soil Compactor (CAT CS11GC) Rental", unit: "MO", unitPrice: 5700.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Soil Compactor (CAT CS12) Rental", unit: "MO", unitPrice: 6700.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Soil Compactor (CAT CS14) Rental", unit: "MO", unitPrice: 7250.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Roller (Case SV208) Rental", unit: "MO", unitPrice: 3480.00, productionRate: 0, notes: "ASCO Equipment - active TerraFirma contract" },
      { category: "MISC", description: "Compact Track Loader (CAT 265) Rental", unit: "MO", unitPrice: 3800.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Compact Track Loader (CAT 275) Rental", unit: "MO", unitPrice: 5000.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Skid Steer (CAT 260) Rental", unit: "MO", unitPrice: 2200.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Skid Steer (CAT 270) Rental", unit: "MO", unitPrice: 2800.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Track Loader (CAT 953) Rental", unit: "MO", unitPrice: 9800.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Track Loader (CAT 963) Rental", unit: "MO", unitPrice: 12500.00, productionRate: 0, notes: "Holt CAT rate guide" },
      { category: "MISC", description: "Backhoe Loader (CAT 420) Rental", unit: "MO", unitPrice: 3200.00, productionRate: 0, notes: "Holt CAT rate guide (avg configs)" },
      { category: "MISC", description: "Backhoe Loader (CAT 430) Rental", unit: "MO", unitPrice: 3750.00, productionRate: 0, notes: "Holt CAT rate guide (avg configs)" },
      { category: "MISC", description: "Telehandler (CAT TH1055) Rental", unit: "MO", unitPrice: 4500.00, productionRate: 0, notes: "Holt CAT rate guide" },

      // ─── MISC (Mobilization / General) ─────────────────────
      { category: "MISC", description: "Mobilization (Lump Sum)", unit: "LS", unitPrice: 266206.98, productionRate: 0, notes: "TxDOT Austin Dist 500-6001 12mo avg" },
      { category: "MISC", description: "Barricades, Signs & Traffic Handling", unit: "MO", unitPrice: 8686.80, productionRate: 0, notes: "TxDOT Austin Dist 502-6001" },
      { category: "MISC", description: "Constructing Detours", unit: "SY", unitPrice: 70.54, productionRate: 0, notes: "TxDOT Austin Dist 508-6001" },
      { category: "MISC", description: "One-Way Traffic Control (Flagger)", unit: "HR", unitPrice: 110.00, productionRate: 0, notes: "TxDOT Austin Dist 510-6001" },
      { category: "MISC", description: "Portable Changeable Message Sign", unit: "MO", unitPrice: 5620.00, productionRate: 0, notes: "TxDOT Austin Dist 510-6003" },
      { category: "MISC", description: "Permanent CTB (Single Slope)(Type 1)(42\")", unit: "LF", unitPrice: 59.11, productionRate: 400, notes: "TxDOT Austin Dist 514-6001 | Prod: TxDOT 2024 MED" },
      { category: "MISC", description: "Wire Fence (Metal W-Beam)(Timber Post)", unit: "LF", unitPrice: 22.13, productionRate: 0, notes: "TxDOT Austin Dist 540-6001" },
      { category: "MISC", description: "Soil Nail Anchors", unit: "LF", unitPrice: 12.60, productionRate: 415, notes: "TxDOT Austin Dist 410-6001 | Prod: TxDOT 2024 MED" },
      { category: "MISC", description: "Retaining Wall (MSE)", unit: "SF", unitPrice: 22.00, productionRate: 358, notes: "TxDOT Austin Dist 423 range | Prod: TxDOT 2024 MED" },
    ],
  });

  console.log(`  Created ${unitPrices.count} unit prices`);

  // ═══════════════════════════════════════════════════════════
  // DEFAULT PRICING CONFIGS
  // ═══════════════════════════════════════════════════════════

  const standardConfig = await prisma.defaultPricingConfig.create({
    data: {
      name: "TerraFirma Standard",
      overhead: 10,
      profit: 10,
      bond: 2,
      tax: 0,
      mobilization: 15000,
      insuranceRate: 1.5,
      isDefault: true,
    },
  });

  const competitiveConfig = await prisma.defaultPricingConfig.create({
    data: {
      name: "Competitive Bid",
      overhead: 8,
      profit: 8,
      bond: 2,
      tax: 0,
      mobilization: 10000,
      insuranceRate: 1.5,
      isDefault: false,
    },
  });

  const highMarginConfig = await prisma.defaultPricingConfig.create({
    data: {
      name: "Negotiated / High Margin",
      overhead: 12,
      profit: 15,
      bond: 2,
      tax: 0,
      mobilization: 20000,
      insuranceRate: 1.5,
      isDefault: false,
    },
  });

  console.log(`  Created pricing presets:`);
  console.log(`    - ${standardConfig.name} (DEFAULT)`);
  console.log(`    - ${competitiveConfig.name}`);
  console.log(`    - ${highMarginConfig.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
