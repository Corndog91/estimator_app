"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";

const statuses = ["ALL", "DRAFT", "IN_PROGRESS", "REVIEW", "COMPLETE", "ARCHIVED"];

export function ProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const currentStatus = searchParams.get("status") ?? "ALL";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/projects?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParams("search", search)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-1">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={currentStatus === status ? "secondary" : "ghost"}
            size="sm"
            onClick={() => updateParams("status", status)}
            className="text-xs"
          >
            {status.replace("_", " ")}
          </Button>
        ))}
      </div>
    </div>
  );
}
