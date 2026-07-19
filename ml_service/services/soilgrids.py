import requests
from core.logger import setup_logger

logger = setup_logger("soilgrids")

import pandas as pd
import os

# Load dataset once globally
try:
    csv_path = os.path.join(os.path.dirname(__file__), "../data/processed/integration/master_crop_agronomic_features.csv")
    df_soil = pd.read_csv(csv_path)
    # Get median soil values per district
    soil_db = df_soil.groupby(['state', 'district'])[['ph', 'nitrogen', 'soc', 'clay', 'sand', 'silt', 'cec', 'bulk_density']].median().reset_index()
except Exception as e:
    logger.error(f"Failed to load dataset for soil: {e}")
    soil_db = pd.DataFrame()

def get_soil_properties(lat: float, lon: float, state: str = None, district: str = None) -> dict:
    """
    Fetches soil properties from ISRIC SoilGrids REST API.
    Falls back to dataset values for the given state and district if API fails.
    """
    url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    params = {
        "lat": lat,
        "lon": lon,
        "property": ["phh2o", "nitrogen", "soc", "clay", "sand", "silt", "cec", "bdod"],
        "depth": "0-5cm",
        "value": "mean"
    }
    
    try:
        # Reduced timeout since the API hangs frequently
        resp = requests.get(url, params=params, timeout=2)
        resp.raise_for_status()
        data = resp.json()
        
        props = {}
        for layer in data.get("properties", {}).get("layers", []):
            name = layer["name"]
            val = layer["depths"][0]["values"]["mean"]
            props[name] = val
            
        return {
            "ph": props.get("phh2o", 70) / 10.0,
            "nitrogen": props.get("nitrogen", 15) / 10.0,
            "soc": props.get("soc", 200) / 10.0,
            "clay": props.get("clay", 300) / 10.0,
            "sand": props.get("sand", 400) / 10.0,
            "silt": props.get("silt", 300) / 10.0,
            "cec": props.get("cec", 250) / 10.0,
            "bulk_density": props.get("bdod", 140) / 100.0
        }
    except Exception as e:
        logger.error(f"SoilGrids fetch failed: {e}. Falling back to dataset values.")
        
        if not soil_db.empty and state and district:
            match = soil_db[(soil_db['state'].str.upper() == state.upper()) & (soil_db['district'].str.upper() == district.upper())]
            if not match.empty:
                row = match.iloc[0]
                return {
                    "ph": float(row['ph']) if pd.notna(row['ph']) else 7.0,
                    "nitrogen": float(row['nitrogen']) if pd.notna(row['nitrogen']) else 1.5,
                    "soc": float(row['soc']) if pd.notna(row['soc']) else 20.0,
                    "clay": float(row['clay']) if pd.notna(row['clay']) else 30.0,
                    "sand": float(row['sand']) if pd.notna(row['sand']) else 40.0,
                    "silt": float(row['silt']) if pd.notna(row['silt']) else 30.0,
                    "cec": float(row['cec']) if pd.notna(row['cec']) else 25.0,
                    "bulk_density": float(row['bulk_density']) if pd.notna(row['bulk_density']) else 1.4
                }
                
        return {
            "ph": 7.0,
            "nitrogen": 1.5,
            "soc": 20.0,
            "clay": 30.0,
            "sand": 40.0,
            "silt": 30.0,
            "cec": 25.0,
            "bulk_density": 1.4
        }
