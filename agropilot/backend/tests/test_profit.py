from services.ai.profit import compute, scenarios, ProfitInputs

def test_profit_basic():
    out = compute(ProfitInputs(total_expenses=10000, expected_yield_kg=1500, expected_price_per_kg=20))
    assert out.estimated_revenue == 30000
    assert out.estimated_profit == 20000
    assert round(out.roi_pct) == 200
    assert round(out.break_even_price_per_kg, 2) == 6.67

def test_scenarios():
    s = scenarios(ProfitInputs(total_expenses=5000, expected_yield_kg=1000, expected_price_per_kg=10))
    assert s["pessimistic"].estimated_profit < s["base"].estimated_profit < s["optimistic"].estimated_profit
