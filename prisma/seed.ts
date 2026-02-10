import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@earthwork.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@earthwork.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Create estimator user
  const estimatorHash = await hash("estimator123", 12);
  const estimator = await prisma.user.upsert({
    where: { email: "estimator@earthwork.com" },
    update: {},
    create: {
      name: "John Estimator",
      email: "estimator@earthwork.com",
      passwordHash: estimatorHash,
      role: "ESTIMATOR",
    },
  });

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      projectNumber: "2024-001",
      name: "Sample Commercial Site",
      status: "IN_PROGRESS",
      createdById: admin.id,
      jobInfo: {
        create: {
          owner: "ABC Development Corp",
          architect: "Smith & Associates",
          engineer: "GeoTech Engineers",
          generalContractor: "BuildRight Construction",
          projectLocation: "123 Main St, Anytown, USA",
          technicianName: "John Estimator",
          retainingWalls: true,
          erosionControl: true,
          stormDrainage: true,
        },
      },
      bidSections: {
        create: [
          {
            name: "Building Pad - Main Office",
            sortOrder: 1,
            sectionType: "BUILDING_PAD",
            lineItems: {
              create: [
                { description: "Strip Topsoil (6\")", quantity: 5000, unit: "CY", unitPrice: 3.50, totalCost: 17500, productionRate: 800, days: 6.25, sortOrder: 1 },
                { description: "Mass Excavation", quantity: 12000, unit: "CY", unitPrice: 4.25, totalCost: 51000, productionRate: 1200, days: 10, sortOrder: 2 },
                { description: "Structural Fill", quantity: 8000, unit: "CY", unitPrice: 8.50, totalCost: 68000, productionRate: 600, days: 13.33, sortOrder: 3 },
                { description: "Fine Grade", quantity: 45000, unit: "SF", unitPrice: 0.45, totalCost: 20250, productionRate: 5000, days: 9, sortOrder: 4 },
              ],
            },
          },
          {
            name: "Paving - Parking Lot",
            sortOrder: 2,
            sectionType: "PAVING",
            lineItems: {
              create: [
                { description: "Subgrade Preparation", quantity: 30000, unit: "SF", unitPrice: 0.65, totalCost: 19500, productionRate: 4000, days: 7.5, sortOrder: 1 },
                { description: "Aggregate Base (8\")", quantity: 3000, unit: "CY", unitPrice: 28.00, totalCost: 84000, productionRate: 400, days: 7.5, sortOrder: 2 },
                { description: "Proof Roll", quantity: 30000, unit: "SF", unitPrice: 0.15, totalCost: 4500, productionRate: 10000, days: 3, sortOrder: 3 },
              ],
            },
          },
          {
            name: "Storm Water Pond",
            sortOrder: 3,
            sectionType: "PONDS",
            lineItems: {
              create: [
                { description: "Pond Excavation", quantity: 6000, unit: "CY", unitPrice: 5.00, totalCost: 30000, productionRate: 800, days: 7.5, sortOrder: 1 },
                { description: "Rip Rap", quantity: 500, unit: "TN", unitPrice: 45.00, totalCost: 22500, productionRate: 100, days: 5, sortOrder: 2 },
              ],
            },
          },
          {
            name: "Erosion Control",
            sortOrder: 4,
            sectionType: "EROSION",
            lineItems: {
              create: [
                { description: "Silt Fence", quantity: 2500, unit: "LF", unitPrice: 3.50, totalCost: 8750, productionRate: 500, days: 5, sortOrder: 1 },
                { description: "Inlet Protection", quantity: 12, unit: "EA", unitPrice: 150.00, totalCost: 1800, productionRate: 6, days: 2, sortOrder: 2 },
                { description: "Construction Entrance", quantity: 2, unit: "EA", unitPrice: 3500.00, totalCost: 7000, productionRate: 1, days: 2, sortOrder: 3 },
              ],
            },
          },
        ],
      },
      markupConfig: {
        create: {
          overhead: 10,
          profit: 10,
          bond: 2,
          tax: 0,
          mobilization: 15000,
          insuranceRate: 1.5,
        },
      },
    },
  });

  console.log("Seeded database with:");
  console.log(`  - Admin user: ${admin.email}`);
  console.log(`  - Estimator user: ${estimator.email}`);
  console.log(`  - Sample project: ${project.name} (${project.projectNumber})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
