import pandas as pd
import json
import numpy as np

# Load dataset
df = pd.read_csv('C:/Users/ozhad/OneDrive/Desktop/Seed2Success/S2S/ml_service/data/processed/integration/master_crop_agronomic_features.csv')

# Convert numeric columns
for col in ['avg_temp', 'total_rainfall', 'yield_t_ha']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Calculate stats for each crop
crop_stats = {}
for crop in df['crop'].unique():
    crop_df = df[df['crop'] == crop]
    if len(crop_df) > 0:
        temp_min = crop_df['avg_temp'].quantile(0.10)
        temp_max = crop_df['avg_temp'].quantile(0.90)
        rain_min = crop_df['total_rainfall'].quantile(0.10)
        rain_max = crop_df['total_rainfall'].quantile(0.90)
        yield_avg = crop_df['yield_t_ha'].median() * 2.47 # to acre
        
        crop_stats[crop] = {
            "ideal_temp_min": round(temp_min, 1) if not pd.isna(temp_min) else 15.0,
            "ideal_temp_max": round(temp_max, 1) if not pd.isna(temp_max) else 35.0,
            "rainfall_min": round(rain_min, 1) if not pd.isna(rain_min) else 50.0,
            "rainfall_max": round(rain_max, 1) if not pd.isna(rain_max) else 200.0,
            "avg_yield_per_acre": round(yield_avg, 2) if not pd.isna(yield_avg) else 2.0,
            "season": crop_df['season'].mode()[0] if not crop_df['season'].empty else "Various"
        }

# Load existing crops.json
with open('C:/Users/ozhad/OneDrive/Desktop/Seed2Success/S2S/BackEnd/seed-data/crops.json', 'r') as f:
    existing_crops = json.load(f)

# Build map of existing
existing_map = {c['crop_name'].upper(): c for c in existing_crops}

new_crops = []
for crop in df['crop'].unique():
    crop_upper = crop.upper()
    stats = crop_stats[crop]
    
    if crop_upper in existing_map:
        c = existing_map[crop_upper]
        # Update with data-driven values
        c['ideal_temp_min'] = stats['ideal_temp_min']
        c['ideal_temp_max'] = stats['ideal_temp_max']
        c['rainfall_min'] = stats['rainfall_min']
        c['rainfall_max'] = stats['rainfall_max']
        c['avg_yield_per_acre'] = stats['avg_yield_per_acre']
        new_crops.append(c)
    else:
        # Create new entry
        pretty_name = crop.title()
        new_crops.append({
            "id": crop.lower().replace(" ", "_"),
            "crop_name": pretty_name,
            "ideal_temp_min": stats['ideal_temp_min'],
            "ideal_temp_max": stats['ideal_temp_max'],
            "rainfall_min": stats['rainfall_min'],
            "rainfall_max": stats['rainfall_max'],
            "water_requirement": "medium",
            "labour_need": "medium",
            "avg_cost_per_acre": 10000,
            "avg_yield_per_acre": stats['avg_yield_per_acre'],
            "avg_market_price": 20000,
            "crops_to_avoid_after": [],
            "season": stats['season'].title(),
            "growing_days": 120
        })

with open('C:/Users/ozhad/OneDrive/Desktop/Seed2Success/S2S/BackEnd/seed-data/crops.json', 'w') as f:
    json.dump(new_crops, f, indent=2)

print(f"Successfully generated {len(new_crops)} crops using data-driven statistics!")
