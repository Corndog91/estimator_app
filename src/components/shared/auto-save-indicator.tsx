"use client";

import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AutoSaveIndicator({ status }: { status: SaveStatus }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs transition-opacity",
      status === "idle" && "opacity-0",
    )}>
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-red-600" />
          <span className="text-red-600">Error saving</span>
        </>
      )}
    </div>
  );
}
