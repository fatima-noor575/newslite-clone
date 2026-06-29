import logging, time
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger("agropilot")
logging.basicConfig(level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s | %(message)s")

limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

async def request_log_mw(request: Request, call_next):
    t = time.time()
    resp = await call_next(request)
    logger.info(f"{request.method} {request.url.path} -> {resp.status_code} ({(time.time()-t)*1000:.0f}ms)")
    return resp
