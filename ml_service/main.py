from fastapi import FastAPI
import joblib
from contextlib import asynccontextmanager

from core.config import settings
from core.logger import setup_logger
from api.routes import router as ml_router
from api.feedback_routes import router as feedback_router
from core.database import Base, engine
from api.vision import router as vision_router
from api.selling_routes import router as selling_router

# Create the SQLite Database on Startup
Base.metadata.create_all(bind=engine)


logger = setup_logger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load the model ONCE
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info("Service started successfully.")
    yield
    
    # Shutdown
    logger.info("Shutting down ML service.")

from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.security import limiter, verify_api_key

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# 1. Rate Limiting Setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Universal JSON Envelope & Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal Server Error", "details": str(exc)}
    )

# 3. Apply API Key Security globally to our routers
security_dependency = [Depends(verify_api_key)]

app.include_router(ml_router, prefix="/api/v1", dependencies=security_dependency)
app.include_router(feedback_router, prefix="/api/v1", dependencies=security_dependency)
app.include_router(vision_router, prefix="/api/v1/vision", dependencies=security_dependency)
app.include_router(selling_router, prefix="/api/v1/selling", dependencies=security_dependency)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
