"""
COMPLEX FEATURE #1 — AI Disease Detection
Uses OpenAI Vision to analyze a leaf image and return structured guidance.
"""
import base64, json
from typing import Optional
from openai import OpenAI
from config.settings import settings
from schemas import DiseaseOut

_client: Optional[OpenAI] = None
def client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client

SYSTEM_PROMPT = """You are an expert plant pathologist. Analyze the provided leaf image.
Respond ONLY with strict JSON in this schema:
{
  "disease_name": str,
  "confidence": float (0-1),
  "severity": "low" | "medium" | "high",
  "treatment": str,        # step-by-step protocol
  "prevention": str,       # cultural/biological prevention
  "chemicals": [str]       # safe chemical recommendations w/ active ingredient
}
If the leaf looks healthy, set disease_name="Healthy"."""

def detect_from_bytes(image_bytes: bytes, mime: str = "image/jpeg", crop_hint: str = "") -> DiseaseOut:
    b64 = base64.b64encode(image_bytes).decode()
    user_text = f"Crop hint: {crop_hint or 'unknown'}. Analyze the leaf disease."
    resp = client().chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text": user_text},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            ]},
        ],
        temperature=0.2,
    )
    data = json.loads(resp.choices[0].message.content)
    # Defensive normalization
    data.setdefault("chemicals", [])
    data["confidence"] = float(data.get("confidence", 0.0))
    return DiseaseOut(**data)
