"""Speech-to-text and text-to-speech (EN/UR/PN)."""
from openai import OpenAI
from config.settings import settings

_c = None
def c():
    global _c
    if _c is None: _c = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _c

def stt(audio_bytes: bytes, language: str = "en") -> str:
    import io
    f = io.BytesIO(audio_bytes); f.name = "audio.webm"
    r = c().audio.transcriptions.create(model="whisper-1", file=f, language=language)
    return r.text

def tts(text: str, voice: str = "alloy") -> bytes:
    r = c().audio.speech.create(model="tts-1", voice=voice, input=text)
    return r.read()

def translate(text: str, target: str) -> str:
    sys = f"Translate the following text to {target}. Output ONLY the translation."
    r = c().chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"system","content":sys},{"role":"user","content":text}],
        temperature=0)
    return r.choices[0].message.content.strip()
