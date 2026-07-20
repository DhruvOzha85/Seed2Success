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
    if engine:
        price_per_quintal = engine.predict(
            state=request.state,
            district=request.district,
            crop_type=request.cropType,
            selling_urgency=request.sellingUrgency,
            quality_signal=request.qualitySignal,
            defect_level=request.defectLevel
        )
    else:
        # Heuristic Fallback
        base_price = 2000.0
        
        # Adjust for quality
        if request.qualitySignal.lower() == "grade a":
            base_price *= 1.2
        elif request.qualitySignal.lower() == "grade c":
            base_price *= 0.8
            
        # Adjust for defect level
        if request.defectLevel.lower() == "high":
            base_price *= 0.7
        elif request.defectLevel.lower() == "low":
            base_price *= 0.95
            
        # Adjust for urgency
        if request.sellingUrgency.lower() == "rush":
            base_price *= 0.85
            
        price_per_quintal = base_price
    
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
