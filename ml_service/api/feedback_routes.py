from fastapi import APIRouter, HTTPException, Depends
from models.schemas import FeedbackRequest, FeedbackResponse
from core.database import SessionLocal
from models.domain import FeedbackLog

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest, db: SessionLocal = Depends(get_db)):
    try:
        feedback = FeedbackLog(
            prediction_id=request.prediction_id,
            feedback_type=request.feedback_type,
            actual_crop_planted=request.actual_crop_planted,
            actual_yield_obtained=request.actual_yield_obtained,
            farmer_rating=request.farmer_rating,
            comments=request.comments
        )
        db.add(feedback)
        db.commit()
        return {"status": "success", "message": "Feedback ingested into Continuous Learning Pipeline."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
