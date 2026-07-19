import os
import time
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import RandomizedSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from category_encoders import TargetEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
import shap

print("Loading data...")
df = pd.read_csv("data/processed/integration/master_crop_agronomic_features.csv")

# Filter out rows with missing weather/soil/yield for a clean ML subset
df = df.dropna(subset=['avg_temp', 'ph', 'yield_t_ha'])

# Fatal leak removal
df = df.drop(columns=['production_tonnes'])

# Target transformation (handle huge skewness)
# Log1p(yield) because some yields are near 0
df['log_yield'] = np.log1p(df['yield_t_ha'])
df = df.drop(columns=['yield_t_ha'])

# Temporal Split (Train <= 2012, Val 2013-2015)
train = df[df['crop_year'] <= 2012].copy()
val = df[df['crop_year'] > 2012].copy()

# Features and target
target = 'log_yield'
features = [c for c in train.columns if c not in [target, 'crop_year']]

X_train = train[features]
y_train = train[target]
X_val = val[features]
y_val = val[target]

print(f"Train size: {len(X_train)} | Val size: {len(X_val)}")

# Preprocessing
num_cols = ['area_ha', 'avg_temp', 'avg_humidity', 'total_rainfall', 'ph', 'nitrogen', 'soc', 'clay', 'sand', 'silt', 'cec', 'bulk_density']
cat_onehot = ['season']
cat_target = ['state', 'district', 'crop']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_cols),
        ('cat_oh', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_onehot),
        ('cat_te', TargetEncoder(), cat_target)
    ]
)

# Models
# ponytail: Using extreme small trees/iterations and skipping heavy exhaustive search. Upgrade path: Optuna hyperparameter sweeps on a GPU instance.
models = {
    'RandomForest': RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1),
    'XGBoost': XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1),
    'LightGBM': LGBMRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1, verbose=-1),
    'CatBoost': CatBoostRegressor(iterations=100, depth=6, learning_rate=0.1, random_state=42, verbose=0, thread_count=-1)
}

results = []
best_model = None
best_r2 = -float('inf')
best_name = ""

for name, model in models.items():
    print(f"\nTraining {name}...")
    start_time = time.time()
    
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', model)
    ])
    
    pipeline.fit(X_train, y_train)
    
    preds = pipeline.predict(X_val)
    train_time = time.time() - start_time
    
    mae = mean_absolute_error(y_val, preds)
    rmse = np.sqrt(mean_squared_error(y_val, preds))
    r2 = r2_score(y_val, preds)
    
    print(f"{name} -> MAE: {mae:.4f} | RMSE: {rmse:.4f} | R2: {r2:.4f} | Time: {train_time:.1f}s")
    
    results.append({
        'Model': name,
        'MAE': round(mae, 4),
        'RMSE': round(rmse, 4),
        'R2': round(r2, 4),
        'Time(s)': round(train_time, 1)
    })
    
    if r2 > best_r2:
        best_r2 = r2
        best_model = pipeline
        best_name = name

# Ensure dirs
os.makedirs("models", exist_ok=True)
os.makedirs("data/reports/figures", exist_ok=True)

print(f"\nBest model is {best_name}! Saving...")
joblib.dump(best_model, f"models/best_model.pkl")

# Generate Reports
res_df = pd.DataFrame(results).sort_values(by='R2', ascending=False)
with open("data/reports/model_comparison.md", "w") as f:
    f.write("# Model Comparison\n\n")
    f.write(res_df.to_markdown(index=False))

with open("data/reports/evaluation_report.md", "w") as f:
    f.write(f"# Best Model Evaluation: {best_name}\n\n")
    f.write("## 1. Experiment Details\n")
    f.write("- **Dataset Version:** master_crop_agronomic_features.csv (Clean Pilot Subset)\n")
    f.write(f"- **Features Used:** {len(features)} base features\n")
    f.write(f"- **Model:** {best_name}\n")
    f.write(f"- **Training Time:** {res_df[res_df['Model']==best_name]['Time(s)'].values[0]} seconds\n")
    f.write("## 2. Validation Scores (Temporal Split 2013-2015)\n")
    f.write(f"- **R²:** {best_r2:.4f}\n")
    f.write(f"- **MAE (Log Scale):** {res_df[res_df['Model']==best_name]['MAE'].values[0]:.4f}\n")
    f.write(f"- **RMSE (Log Scale):** {res_df[res_df['Model']==best_name]['RMSE'].values[0]:.4f}\n")
    f.write("\n## 3. Production Readiness\n")
    if best_r2 > 0.7:
        f.write("**Status: READY.** The model explains over 70% of the variance on purely out-of-time unseen future data. The temporal split ensures no data leakage.\n")
    else:
        f.write("**Status: NOT READY.** Explainability (R²) is too low for deployment. We need to integrate the 20 engineered features from Phase 3.\n")

print("\nGenerating Explainability (Feature Importance)...")
# Get feature names from preprocessor
preproc = best_model.named_steps['preprocessor']
num_f = num_cols
cat_oh_f = preproc.named_transformers_['cat_oh'].get_feature_names_out(cat_onehot).tolist()
cat_te_f = cat_target
all_feature_names = num_f + cat_oh_f + cat_te_f

# Feature Importance
model_core = best_model.named_steps['model']
if hasattr(model_core, 'feature_importances_'):
    importances = model_core.feature_importances_
    indices = np.argsort(importances)[-15:] # top 15
    plt.figure(figsize=(10,6))
    plt.title(f"Top 15 Feature Importances ({best_name})")
    plt.barh(range(len(indices)), importances[indices], align="center")
    plt.yticks(range(len(indices)), [all_feature_names[i] for i in indices])
    plt.tight_layout()
    plt.savefig("data/reports/figures/feature_importance.png")
    plt.close()

# SHAP (on a sample for speed)
print("Generating SHAP (on 500 samples)...")
X_val_transformed = preproc.transform(X_val)
X_val_sample = X_val_transformed[:500]

# ponytail: SHAP TreeExplainer can be slow, using a tiny 500 row sample.
explainer = shap.TreeExplainer(model_core)
shap_values = explainer.shap_values(X_val_sample)

shap.summary_plot(shap_values, X_val_sample, feature_names=all_feature_names, show=False)
plt.tight_layout()
plt.savefig("data/reports/figures/shap_summary.png")
plt.close()

print("DONE! Pipeline complete.")
