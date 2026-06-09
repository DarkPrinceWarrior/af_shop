from slowapi import Limiter
from slowapi.util import get_remote_address

# Per-client-IP rate limiter. Uses in-memory storage by default; for multi-worker
# / multi-replica deployments configure a shared store (e.g. storage_uri=redis://…).
limiter = Limiter(key_func=get_remote_address)
