import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  REVIEW: { label: "Review", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  COMPLETE: { label: "Complete", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  ARCHIVED: { label: "Archived", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "" };
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
