from fastapi import APIRouter, HTTPException
import joblib
import os
from models.schemas import SellingRequest, SellingResponse
from services.selling_prediction import SellingPredictionEngine

# Trigger reload for new model

router = APIRouter()

# Load model globally so it stays in memory
MODEL_PATH = "models/selling_model.pkl"
engine = None

if os.path.exists(MODEL_PATH):
    try:
        pipeline = joblib.load(MODEL_PATH)
        engine = SellingPredictionEngine(pipeline)
    except Exception as e:
        print(f"Error loading selling model: {e}")

@router.post("/predict", response_model=SellingResponse)
async def predict_selling_price(request: SellingRequest):
    if not engine:
        raise HTTPException(status_code=503, detail="Selling model is not available.")
    
    price_per_quintal = engine.predict(
        state=request.state,
        district=request.district,
        crop_type=request.cropType,
        selling_urgency=request.sellingUrgency,
        quality_signal=request.qualitySignal,
        defect_level=request.defectLevel
    )
    
    # Calculate total revenue
    qty_multiplier = 1.0
    if request.quantityUnit.lower() == "tonnes":
        qty_multiplier = 10.0 # 1 tonne = 10 quintals
    elif request.quantityUnit.lower() == "kg":
        qty_multiplier = 0.01 # 1 kg = 0.01 quintals
        
    total_revenue = price_per_quintal * (request.quantityValue * qty_multiplier)
    
    return SellingResponse(
        success=True,
        estimated_price_per_quintal=round(price_per_quintal, 2),
        total_estimated_revenue=round(total_revenue, 2)
    )
