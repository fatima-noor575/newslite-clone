"""
COMPLEX FEATURE #3 — Profit Calculator
ROI, profit, break-even price/yield, and risk-adjusted scenario analysis.
"""
from dataclasses import dataclass
from schemas import ProfitOut

@dataclass
class ProfitInputs:
    total_expenses: float
    expected_yield_kg: float
    expected_price_per_kg: float
    extra_costs: float = 0.0

def compute(p: ProfitInputs) -> ProfitOut:
    total_cost = p.total_expenses + p.extra_costs
    revenue = p.expected_yield_kg * p.expected_price_per_kg
    profit = revenue - total_cost
    roi = (profit / total_cost * 100) if total_cost > 0 else 0.0
    break_even_price = (total_cost / p.expected_yield_kg) if p.expected_yield_kg > 0 else 0.0
    return ProfitOut(
        total_expenses=round(total_cost, 2),
        estimated_revenue=round(revenue, 2),
        estimated_profit=round(profit, 2),
        roi_pct=round(roi, 2),
        break_even_price_per_kg=round(break_even_price, 2),
    )

def scenarios(p: ProfitInputs):
    """±15% yield & price stress test."""
    out = {}
    for label, dy, dp in [("pessimistic", -0.15, -0.15), ("base", 0, 0), ("optimistic", 0.15, 0.15)]:
        sp = ProfitInputs(p.total_expenses,
                          p.expected_yield_kg * (1 + dy),
                          p.expected_price_per_kg * (1 + dp),
                          p.extra_costs)
        out[label] = compute(sp)
    return out
