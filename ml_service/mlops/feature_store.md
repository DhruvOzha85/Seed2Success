# Feature Store Architecture

The Feature Store eliminates the "training-serving skew" problem, ensuring that the feature transformations applied during training are mathematically identical to those applied during live API inference.

## 1. Feature Definitions
Every feature used by the model is defined as code.
Example Feature: `avg_temperature_30d`
- **Source:** NASA POWER API
- **Transformation:** Moving average of `T2M` over the last 30 days.
- **Validation Rule:** Must be between -10°C and 55°C.

## 2. Offline vs Online Store
- **Offline Store (Data Warehouse/Parquet):** Used by Data Scientists to generate massive historical batches for training `model_v2`.
- **Online Store (Redis/FastAPI Cache):** Used by the live inference service to fetch pre-computed features in <10ms for immediate prediction.

## 3. Governance
Every feature has an `Owner`. If the `soil_ph` feature breaks because the SoilGrids API changed its JSON format, the alert is routed directly to the feature owner.
