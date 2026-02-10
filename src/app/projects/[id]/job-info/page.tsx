"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AutoSaveIndicator } from "@/components/shared/auto-save-indicator";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface JobInfoData {
  owner: string;
  architect: string;
  engineer: string;
  generalContractor: string;
  projectLocation: string;
  planDate: string;
  specDate: string;
  technicianName: string;
  notes: string;
  retainingWalls: boolean;
  trenchSafety: boolean;
  geotextile: boolean;
  underdrains: boolean;
  erosionControl: boolean;
  demolition: boolean;
  stormDrainage: boolean;
  sanitarySewer: boolean;
  waterLine: boolean;
  gasLine: boolean;
  electricConduit: boolean;
  siteLighting: boolean;
  landscaping: boolean;
  irrigation: boolean;
  fencing: boolean;
  signage: boolean;
}

const defaultJobInfo: JobInfoData = {
  owner: "", architect: "", engineer: "", generalContractor: "",
  projectLocation: "", planDate: "", specDate: "", technicianName: "", notes: "",
  retainingWalls: false, trenchSafety: false, geotextile: false, underdrains: false,
  erosionControl: false, demolition: false, stormDrainage: false, sanitarySewer: false,
  waterLine: false, gasLine: false, electricConduit: false, siteLighting: false,
  landscaping: false, irrigation: false, fencing: false, signage: false,
};

const scopeItems: { key: keyof JobInfoData; label: string }[] = [
  { key: "retainingWalls", label: "Retaining Walls" },
  { key: "trenchSafety", label: "Trench Safety" },
  { key: "geotextile", label: "Geotextile" },
  { key: "underdrains", label: "Underdrains" },
  { key: "erosionControl", label: "Erosion Control" },
  { key: "demolition", label: "Demolition" },
  { key: "stormDrainage", label: "Storm Drainage" },
  { key: "sanitarySewer", label: "Sanitary Sewer" },
  { key: "waterLine", label: "Water Line" },
  { key: "gasLine", label: "Gas Line" },
  { key: "electricConduit", label: "Electric Conduit" },
  { key: "siteLighting", label: "Site Lighting" },
  { key: "landscaping", label: "Landscaping" },
  { key: "irrigation", label: "Irrigation" },
  { key: "fencing", label: "Fencing" },
  { key: "signage", label: "Signage" },
];

export default function JobInfoPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [data, setData] = useState<JobInfoData>(defaultJobInfo);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((project) => {
        if (project.jobInfo) {
          setData({
            ...defaultJobInfo,
            ...project.jobInfo,
            planDate: project.jobInfo.planDate ? project.jobInfo.planDate.split("T")[0] : "",
            specDate: project.jobInfo.specDate ? project.jobInfo.specDate.split("T")[0] : "",
          });
        }
        setLoaded(true);
      });
  }, [projectId]);

  const save = useCallback(
    async (updates: Partial<JobInfoData>) => {
      setSaveStatus("saving");
      try {
        const body: Record<string, unknown> = { ...updates };
        if ("planDate" in body) body.planDate = body.planDate ? new Date(body.planDate as string).toISOString() : null;
        if ("specDate" in body) body.specDate = body.specDate ? new Date(body.specDate as string).toISOString() : null;

        const res = await fetch(`/api/projects/${projectId}/job-info`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    },
    [projectId]
  );

  const updateField = useCallback(
    (field: keyof JobInfoData, value: string | boolean) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof JobInfoData) => {
      save({ [field]: data[field] });
    },
    [data, save]
  );

  const handleToggle = useCallback(
    (field: keyof JobInfoData, value: boolean) => {
      setData((prev) => ({ ...prev, [field]: value }));
      save({ [field]: value });
    },
    [save]
  );

  if (!loaded) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Job Information</h3>
        <AutoSaveIndicator status={saveStatus} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Contacts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Owner</Label>
            <Input value={data.owner} onChange={(e) => updateField("owner", e.target.value)} onBlur={() => handleBlur("owner")} />
          </div>
          <div className="space-y-2">
            <Label>Architect</Label>
            <Input value={data.architect} onChange={(e) => updateField("architect", e.target.value)} onBlur={() => handleBlur("architect")} />
          </div>
          <div className="space-y-2">
            <Label>Engineer</Label>
            <Input value={data.engineer} onChange={(e) => updateField("engineer", e.target.value)} onBlur={() => handleBlur("engineer")} />
          </div>
          <div className="space-y-2">
            <Label>General Contractor</Label>
            <Input value={data.generalContractor} onChange={(e) => updateField("generalContractor", e.target.value)} onBlur={() => handleBlur("generalContractor")} />
          </div>
          <div className="space-y-2">
            <Label>Technician Name</Label>
            <Input value={data.technicianName} onChange={(e) => updateField("technicianName", e.target.value)} onBlur={() => handleBlur("technicianName")} />
          </div>
          <div className="space-y-2">
            <Label>Project Location</Label>
            <Input value={data.projectLocation} onChange={(e) => updateField("projectLocation", e.target.value)} onBlur={() => handleBlur("projectLocation")} />
          </div>
          <div className="space-y-2">
            <Label>Plan Date</Label>
            <Input type="date" value={data.planDate} onChange={(e) => updateField("planDate", e.target.value)} onBlur={() => handleBlur("planDate")} />
          </div>
          <div className="space-y-2">
            <Label>Spec Date</Label>
            <Input type="date" value={data.specDate} onChange={(e) => updateField("specDate", e.target.value)} onBlur={() => handleBlur("specDate")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scope Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scopeItems.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Switch
                  checked={data[key] as boolean}
                  onCheckedChange={(v) => handleToggle(key, v)}
                />
                <Label className="text-sm cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={data.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            onBlur={() => handleBlur("notes")}
            placeholder="Additional project notes..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
