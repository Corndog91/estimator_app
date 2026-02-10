"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Layers,
  Calculator,
  DollarSign,
  Percent,
  GitBranch,
  FileBarChart,
  History,
  Info,
} from "lucide-react";

const sidebarItems = [
  { href: "", label: "Overview", icon: Info },
  { href: "/job-info", label: "Job Info", icon: FileText },
  { href: "/bid", label: "BID Sections", icon: Layers },
  { href: "/calculators", label: "Calculators", icon: Calculator },
  { href: "/cost-writeup", label: "Cost Write-Up", icon: DollarSign },
  { href: "/markup", label: "Markup", icon: Percent },
  { href: "/alternates", label: "Alternates", icon: GitBranch },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/history", label: "History", icon: History },
];

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <nav className="w-56 border-r bg-muted/30 p-4 space-y-1">
      {sidebarItems.map((item) => {
        const href = `${basePath}${item.href}`;
        const isActive =
          item.href === ""
            ? pathname === basePath
            : pathname.startsWith(href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-background shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
