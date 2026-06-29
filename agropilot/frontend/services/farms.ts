import { api } from "@/lib/api"; import type { Farm } from "@/types";
export const listFarms   = () => api.get<Farm[]>("/farms").then(r => r.data);
export const createFarm  = (b: Partial<Farm>) => api.post<Farm>("/farms", b).then(r => r.data);
export const updateFarm  = (id: number, b: Partial<Farm>) => api.patch<Farm>(`/farms/${id}`, b).then(r => r.data);
export const deleteFarm  = (id: number) => api.delete(`/farms/${id}`).then(r => r.data);
