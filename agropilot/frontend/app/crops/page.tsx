"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCrops, createCrop, updateCrop, deleteCrop } from "@/services/crops";
import { listFarms } from "@/services/farms";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { Crop } from "@/types";

/**
 * Crop Management — full CRUD against the FastAPI /crops endpoints.
 * Features:
 *   - Validated form (zod) for Create + Edit
 *   - Inline edit / delete actions in the table
 *   - Farm dropdown sourced from /farms
 *   - Optimistic toasts + React Query cache invalidation
 */

// ---------- validation ----------
const cropSchema = z.object({
  farm_id: z.coerce.number().int().positive({ message: "Select a farm" }),
  crop_name: z.string().trim().min(2, "Crop name is required").max(80),
  planting_date: z.string().optional().or(z.literal("")),
  expected_harvest: z.string().optional().or(z.literal("")),
}).refine(
  (v) => !v.planting_date || !v.expected_harvest || v.expected_harvest >= v.planting_date,
  { message: "Harvest date must be after planting date", path: ["expected_harvest"] },
);

type CropForm = z.infer<typeof cropSchema>;
const emptyForm: CropForm = { farm_id: 0, crop_name: "", planting_date: "", expected_harvest: "" };

export default function CropsPage() {
  const qc = useQueryClient();
  const { data: crops = [], isLoading } = useQuery({ queryKey: ["crops"], queryFn: listCrops });
  const { data: farms = [] } = useQuery({ queryKey: ["farms"], queryFn: listFarms });

  const [form, setForm] = useState<CropForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const farmName = useMemo(() => {
    const m = new Map<number, string>();
    farms.forEach((f) => m.set(f.id, f.name));
    return (id: number) => m.get(id) ?? `#${id}`;
  }, [farms]);

  // ---------- mutations ----------
  const onSuccess = (msg: string) => {
    qc.invalidateQueries({ queryKey: ["crops"] });
    setForm(emptyForm); setEditingId(null); setErrors({});
    toast.success(msg);
  };
  const onError = (e: any) => toast.error(e?.response?.data?.detail ?? "Request failed");

  const createMut = useMutation({ mutationFn: (b: CropForm) => createCrop(cleanPayload(b)), onSuccess: () => onSuccess("Crop added"), onError });
  const updateMut = useMutation({ mutationFn: (b: CropForm) => updateCrop(editingId!, cleanPayload(b)), onSuccess: () => onSuccess("Crop updated"), onError });
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteCrop(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crops"] }); toast.success("Crop deleted"); }, onError });

  const cleanPayload = (b: CropForm) => ({
    farm_id: b.farm_id,
    crop_name: b.crop_name.trim(),
    planting_date: b.planting_date || undefined,
    expected_harvest: b.expected_harvest || undefined,
  });

  // ---------- handlers ----------
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = cropSchema.safeParse(form);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { map[i.path[0] as string] = i.message; });
      setErrors(map); return;
    }
    setErrors({});
    (editingId ? updateMut : createMut).mutate(parsed.data);
  };

  const startEdit = (c: Crop) => {
    setEditingId(c.id);
    setForm({
      farm_id: c.farm_id,
      crop_name: c.crop_name,
      planting_date: c.planting_date ?? "",
      expected_harvest: c.expected_harvest ?? "",
    });
    setErrors({});
  };
  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setErrors({}); };

  // ---------- render ----------
  const field = (name: keyof CropForm) => errors[name] && (
    <p className="text-xs text-red-600 mt-1">{errors[name]}</p>
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Crop Management</h1>
        <span className="text-sm opacity-60">{crops.length} crop{crops.length === 1 ? "" : "s"}</span>
      </div>

      {/* --------- form --------- */}
      <form onSubmit={submit} className="border rounded-lg p-4 mb-8 bg-neutral-50 dark:bg-neutral-900/40">
        <h2 className="font-semibold mb-3">{editingId ? "Edit crop" : "Add a new crop"}</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs opacity-70">Farm *</label>
            <select
              className="border rounded px-3 py-2 bg-transparent w-full"
              value={form.farm_id || ""}
              onChange={(e) => setForm({ ...form, farm_id: Number(e.target.value) })}
            >
              <option value="">— select farm —</option>
              {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            {field("farm_id")}
          </div>
          <div>
            <label className="text-xs opacity-70">Crop name *</label>
            <input
              className="border rounded px-3 py-2 bg-transparent w-full"
              placeholder="e.g. Wheat"
              value={form.crop_name}
              onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
            />
            {field("crop_name")}
          </div>
          <div>
            <label className="text-xs opacity-70">Planting date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 bg-transparent w-full"
              value={form.planting_date}
              onChange={(e) => setForm({ ...form, planting_date: e.target.value })}
            />
            {field("planting_date")}
          </div>
          <div>
            <label className="text-xs opacity-70">Expected harvest</label>
            <input
              type="date"
              className="border rounded px-3 py-2 bg-transparent w-full"
              value={form.expected_harvest}
              onChange={(e) => setForm({ ...form, expected_harvest: e.target.value })}
            />
            {field("expected_harvest")}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={createMut.isPending || updateMut.isPending}
            className="rounded bg-agro-600 text-white px-4 py-2 disabled:opacity-50"
          >
            {editingId ? "Update crop" : "Add crop"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded border px-4 py-2">Cancel</button>
          )}
        </div>
      </form>

      {/* --------- table --------- */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-neutral-900">
            <tr>
              <th className="p-2 text-left">Crop</th>
              <th className="p-2 text-left">Farm</th>
              <th className="p-2 text-center">Planted</th>
              <th className="p-2 text-center">Harvest</th>
              <th className="p-2 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="p-6 text-center opacity-60">Loading…</td></tr>
            )}
            {!isLoading && crops.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center opacity-60">No crops yet. Add your first crop above.</td></tr>
            )}
            {crops.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2 font-medium">{c.crop_name}</td>
                <td className="p-2">{farmName(c.farm_id)}</td>
                <td className="p-2 text-center">{c.planting_date ?? "—"}</td>
                <td className="p-2 text-center">{c.expected_harvest ?? "—"}</td>
                <td className="p-2 text-right pr-4 space-x-2">
                  <button onClick={() => startEdit(c)} className="text-agro-700 text-xs">Edit</button>
                  <button
                    onClick={() => { if (confirm(`Delete crop "${c.crop_name}"?`)) deleteMut.mutate(c.id); }}
                    className="text-red-600 text-xs"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
