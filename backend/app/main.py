from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .api import events, decisions, actions, metrics, webhooks
from .core.database import engine, Base

settings = get_settings()
app = FastAPI(title=settings.app_name, debug=settings.debug)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(decisions.router, prefix="/api/decisions", tags=["decisions"])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(webhooks.router, prefix="/api", tags=["webhooks"])

@app.get("/")
async def root():
    return {"message": "RecoverIQ API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RecoverIQ"}