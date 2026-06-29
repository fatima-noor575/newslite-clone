export type Farm = { id: number; name: string; location?: string; area?: number; soil_type?: string };
export type Crop = { id: number; farm_id: number; crop_name: string; planting_date?: string; expected_harvest?: string };
export type DiseaseResult = { disease_name: string; confidence: number; severity: string; treatment: string; prevention: string; chemicals: string[] };
export type IrrigationResult = { water_amount_liters_per_acre: number; recommendation: string; next_schedule: string; reasoning: string };
export type ProfitResult = { total_expenses: number; estimated_revenue: number; estimated_profit: number; roi_pct: number; break_even_price_per_kg: number };
export type Notification = { id: number; type: string; message: string; status: string; created_at: string };
