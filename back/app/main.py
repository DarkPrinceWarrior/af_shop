import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.services.realtime import order_connection_manager


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


@asynccontextmanager
async def lifespan(_app: FastAPI):  # noqa: ANN201
    # Start the Redis realtime subscriber (no-op when REDIS_URL is unset).
    subscriber = asyncio.create_task(order_connection_manager.run_subscriber())
    try:
        yield
    finally:
        subscriber.cancel()


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

# Interactive docs and the OpenAPI schema are exposed only outside production
# to avoid leaking the API surface.
_docs_enabled = settings.ENVIRONMENT == "local"

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=(f"{settings.API_V1_STR}/openapi.json" if _docs_enabled else None),
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)
app.mount(settings.MEDIA_URL, StaticFiles(directory=settings.MEDIA_ROOT), name="media")
app.include_router(api_router, prefix=settings.API_V1_STR)
