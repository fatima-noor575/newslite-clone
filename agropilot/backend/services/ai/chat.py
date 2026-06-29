"""AI farm-manager chat with multilingual support (EN/UR/PN)."""
from openai import OpenAI
from config.settings import settings

_client = None
def client():
    global _client
    if _client is None: _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client

LANG_NAME = {"en": "English", "ur": "Urdu", "pn": "Punjabi"}

def ask(message: str, language: str = "en") -> str:
    sys = (f"You are AgroPilot — an expert AI farm manager. "
           f"Always reply in {LANG_NAME.get(language,'English')}. "
           f"Give concise, actionable, farmer-friendly advice.")
    r = client().chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"system","content":sys},{"role":"user","content":message}],
        temperature=0.4,
    )
    return r.choices[0].message.content.strip()
