import os
import sys
from datetime import datetime

# Add ml_service to path so we can import the database models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml_service")))

from core.database import SessionLocal
from models.domain import PredictionLog

def inject_mock_anomalies():
    db = SessionLocal()
    try:
        # We will inject a sudden severe drought (Rainfall drops from baseline 150 to 50, Temps spike to 35)
        for i in range(10):
            log = PredictionLog(
                session_id=f"farmer_mock_{i}",
                predicted_crop="WHEAT",
                predicted_yield=1.5,
                confidence=0.85,
                raw_features={
                    "temperature": 35.0, # Massive heatwave
                    "rainfall": 50.0,    # Severe drought
                    "ph": 6.4
                },
                timestamp=datetime.utcnow()
            )
            db.add(log)
        db.commit()
        print("Injected 10 prediction logs simulating a severe drought.")
    finally:
        db.close()

if __name__ == "__main__":
    inject_mock_anomalies()
