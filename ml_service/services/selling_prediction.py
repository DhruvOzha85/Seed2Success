import pandas as pd
import numpy as np

class SellingPredictionEngine:
    def __init__(self, pipeline):
        self.pipeline = pipeline
        
    def predict(self, state: str, district: str, crop_type: str, selling_urgency: str, quality_signal: str, defect_level: str):
        # Create a dataframe for the model
        input_data = {
            'state': [str(state).lower()],
            'district': [str(district).lower()],
            'cropType': [str(crop_type).lower()],
            'sellingUrgency': [str(selling_urgency)],
            'qualitySignal': [str(quality_signal)],
            'defectLevel': [str(defect_level)]
        }
        
        df = pd.DataFrame(input_data)
        
        try:
            # Predict
            pred_price = self.pipeline.predict(df)[0]
        except Exception as e:
            # Fallback if unknown category causes an error
            pred_price = 2500.0 # Default fallback price
            
        return pred_price
