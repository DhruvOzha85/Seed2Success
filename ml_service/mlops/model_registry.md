# Model Registry

The Model Registry acts as the definitive source of truth for all production-ready ML artifacts.

## 1. Immutability
Once a model is registered (e.g., `model_v1.pkl`), it can NEVER be overwritten, modified, or deleted. Future iterations must be saved as `model_v2`, `model_v3`.

## 2. Deployment Stages
Every model in the registry possesses a strict Deployment State:
- **`[STAGING]`**: The model is currently being tested on staging servers with synthetic data.
- **`[SHADOW]`**: The model is deployed to production, receiving real farmer traffic, but its predictions are NOT returned to the user. (Used for A/B metric comparison).
- **`[PRODUCTION]`**: The model is actively serving users. There can only be ONE production model at a time.
- **`[ARCHIVED]`**: An older model retained for rollback purposes.

## 3. Metadata Ledger
For governance, the registry maintains a ledger connecting the model to its origins:
| Model ID | Dataset ID | Status | Author | Approval Timestamp | MAE |
| :--- | :--- | :--- | :--- | :--- | :--- |
| s2s_rf_v1 | ds_v1 | PRODUCTION | Alice | 2026-07-15 08:00Z | 0.22 |
| s2s_rf_v2 | ds_v2 | SHADOW | Bob | 2026-12-01 14:00Z | 0.19 |
