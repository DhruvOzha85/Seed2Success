import os
import sys
import numpy as np
from datetime import datetime, timedelta

# Add ml_service to path so we can import the database models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml_service")))

from core.database import SessionLocal
from models.domain import PredictionLog

# Add alerts path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from alerts.notifier import trigger_alert

# These are mocked baselines. In production, these would be loaded from the Dataset Registry (e.g., mean Temp of dataset_v1)
TRAINING_BASELINES = {
    "temperature": 25.5,  # degrees C
    "rainfall": 150.0,    # mm
    "ph": 6.5
}
DRIFT_THRESHOLD = 0.15  # 15% deviation is considered critical drift

def calculate_drift():
    print("Starting Automated Drift Detection Cron Job...")
    db = SessionLocal()
    
    try:
        # Fetch predictions from the last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_logs = db.query(PredictionLog).filter(PredictionLog.timestamp >= seven_days_ago).all()
        
        if not recent_logs:
            print("Not enough recent data to calculate drift. Exiting.")
            return

        live_temps = []
        live_rains = []
        live_phs = []
        
        for log in recent_logs:
            features = log.raw_features
            if features:
                live_temps.append(features.get("temperature", 0))
                live_rains.append(features.get("rainfall", 0))
                live_phs.append(features.get("ph", 0))
                
        if not live_temps:
            return
            
        # Calculate live means
        live_means = {
            "temperature": np.mean(live_temps),
            "rainfall": np.mean(live_rains),
            "ph": np.mean(live_phs)
        }
        
        drift_detected = False
        drift_details = []
        
        # Compare live vs training baseline
        for feature, baseline in TRAINING_BASELINES.items():
            live_val = live_means[feature]
            deviation = abs(live_val - baseline) / baseline
            
            if deviation > DRIFT_THRESHOLD:
                drift_detected = True
                drift_details.append(f"{feature.upper()} drifted by {deviation*100:.1f}% (Baseline: {baseline}, Live: {live_val:.1f})")
                
        if drift_detected:
            trigger_alert(
                alert_title="Feature Drift Exceeded 15% Threshold",
                severity="CRITICAL",
                details=" | ".join(drift_details) + "\nRecommendation: Trigger automated retraining pipeline using latest Dataset Registry snapshot."
            )
        else:
            print(f"Drift Analysis Complete. All features within {DRIFT_THRESHOLD*100}% of baseline. System is healthy.")
            
    finally:
        db.close()

if __name__ == "__main__":
    calculate_drift()
