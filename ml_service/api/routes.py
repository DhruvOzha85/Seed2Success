from fastapi import APIRouter, HTTPException, Depends, Request
from models.schemas import ContextRequest, ContextResponse
import asyncio

router = APIRouter()

@router.get("/health")
async def health_check():
    from core.database import engine as db_engine
    from sqlalchemy import text
    
    health_status = {"status": "ok", "service": "Seed2Success ML Inference"}
    
    # Check Database Connection
    try:
        with db_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = "disconnected"
        health_status["status"] = "error"
        raise HTTPException(status_code=503, detail=health_status)
        

        
    return health_status

from core.security import limiter



@router.post("/context", response_model=ContextResponse)
@limiter.limit("10/minute")
async def get_context(
    payload: ContextRequest,
    request: Request
):
    from services.geocoding import geocoder
    from services.open_meteo import get_seasonal_weather
    from services.soilgrids import get_soil_properties
    from services.soil_health import calculate_soil_health_score
    try:
        # Offload network I/O
        if payload.state and payload.district:
            state = payload.state.upper()
            district = payload.district.upper()
        else:
            state, district = await asyncio.to_thread(geocoder.get_nearest_district, payload.latitude, payload.longitude)
            
        weather = await asyncio.to_thread(get_seasonal_weather, payload.latitude, payload.longitude)
        soil = await asyncio.to_thread(get_soil_properties, payload.latitude, payload.longitude, state, district)
        
        soil_health = calculate_soil_health_score(soil)
        
        return {
            "weather": weather,
            "soil": soil,
            "soil_health": soil_health,
            "state": state,
            "district": district
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

