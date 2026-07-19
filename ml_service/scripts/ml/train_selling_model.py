import os
import pandas as pd
import numpy as np
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

def load_and_prepare_data():
    # Load Mandi prices (for base prices)
    mandi_path = "data/raw/market/agmarknet_prices_portal/current_daily_mandi_prices.csv"
    if not os.path.exists(mandi_path):
        raise FileNotFoundError(f"Missing data at {mandi_path}")
        
    df = pd.read_csv(mandi_path)
    
    # We will generate synthetic combinations of user inputs based on real base prices
    # user inputs: cropType, quantityValue, quantityUnit, sellingUrgency, qualitySignal, defectLevel
    
    # Filter columns
    df = df[['state', 'district', 'commodity', 'modal_price']].dropna()
    df['commodity'] = df['commodity'].str.lower()
    
    # We will generate synthetic samples around these real base prices
    samples = []
    
    urgency_mult = {"Ask the system for a recommendation": 1.0, "Need cash within 1 week": 0.95, "Can wait 1-2 months": 1.05}
    quality_mult = {"good": 1.05, "average": 1.0, "poor": 0.90}
    defect_mult = {"low": 1.0, "medium": 0.90, "high": 0.75}
    
    # Expand dataset
    for _, row in df.iterrows():
        base_price = row['modal_price']
        for urgency, u_m in urgency_mult.items():
            for quality, q_m in quality_mult.items():
                for defect, d_m in defect_mult.items():
                    # Add some random noise
                    noise = np.random.uniform(0.98, 1.02)
                    final_price = base_price * u_m * q_m * d_m * noise
                    
                    samples.append({
                        'state': str(row['state']).lower(),
                        'district': str(row['district']).lower(),
                        'cropType': str(row['commodity']).lower(),
                        'sellingUrgency': urgency,
                        'qualitySignal': quality,
                        'defectLevel': defect,
                        'selling_price': final_price
                    })
                    
    return pd.DataFrame(samples)

from sklearn.linear_model import Ridge

def train_model():
    print("Preparing data...")
    df = load_and_prepare_data()
    
    X = df.drop(columns=['selling_price'])
    y = df['selling_price']
    
    print(f"Training on {len(df)} samples...")
    
    cat_cols = ['state', 'district', 'cropType', 'sellingUrgency', 'qualitySignal', 'defectLevel']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=True), cat_cols)
        ]
    )
    
    # Use Ridge regression for fast, high-quality training on sparse one-hot encoded data
    model = Ridge(alpha=1.0)
    
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    
    pipeline.fit(X, y)
    
    preds = pipeline.predict(X)
    mae = mean_absolute_error(y, preds)
    r2 = r2_score(y, preds)
    
    print(f"Training complete. MAE: {mae:.2f}, R2: {r2:.4f}")
    
    os.makedirs("models", exist_ok=True)
    joblib.dump(pipeline, "models/selling_model.pkl")
    print("Model saved to models/selling_model.pkl")

if __name__ == "__main__":
    train_model()
