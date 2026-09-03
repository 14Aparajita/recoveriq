from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from .core.config import get_settings
from .api import events, decisions, actions, metrics, webhooks, auth, eval, users, alerts, merchants, analytics, admin, webhook_logs
from .websocket import manager
from .core.database import engine, Base
import logging

logger = logging.getLogger(__name__)

settings = get_settings()

# Create FastAPI app FIRST
app = FastAPI(title=settings.app_name, debug=settings.debug)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc) if settings.debug else None},
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred"},
    )

# Include all routers
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(decisions.router, prefix="/api/decisions", tags=["decisions"])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(webhooks.router, prefix="/api", tags=["webhooks"])
app.include_router(auth.router)
app.include_router(eval.router)
app.include_router(users.router)
app.include_router(alerts.router)
app.include_router(merchants.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(webhook_logs.router)   # <-- new router

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "RecoverIQ API", "status": "running"}