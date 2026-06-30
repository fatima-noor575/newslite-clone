import { api } from "@/lib/api";
import type { Crop } from "@/types";

export const listCrops  = () => api.get<Crop[]>("/crops").then(r => r.data);
export const createCrop = (b: Partial<Crop>) => api.post<Crop>("/crops", b).then(r => r.data);
export const updateCrop = (id: number, b: Partial<Crop>) => api.patch<Crop>(`/crops/${id}`, b).then(r => r.data);
export const deleteCrop = (id: number) => api.delete(`/crops/${id}`).then(r => r.data);
