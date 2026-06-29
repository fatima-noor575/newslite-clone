import { api } from "@/lib/api";
import type { DiseaseResult, IrrigationResult, ProfitResult } from "@/types";

export const detectDisease = (cropId: number, file: File) => {
  const fd = new FormData(); fd.append("crop_id", String(cropId)); fd.append("file", file);
  return api.post<DiseaseResult>("/ai/disease-detect", fd,
    { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
};

export const recommendIrrigation = (body: { crop_id: number; soil_moisture_pct: number; last_irrigation_days: number }) =>
  api.post<IrrigationResult>("/ai/irrigation", body).then(r => r.data);

export const calcProfit = (body: { crop_id: number; expected_price_per_kg: number; expected_yield_kg: number; extra_costs?: number }) =>
  api.post<ProfitResult>("/ai/profit", body).then(r => r.data);

export const chat = (message: string, language = "en") =>
  api.post<{ answer: string }>("/ai/chat", { message, language }).then(r => r.data);
