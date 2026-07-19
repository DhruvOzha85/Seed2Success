# Governance and Audit Trail

An enterprise AI platform must be strictly auditable to prevent rogue deployments and ensure legal compliance.

## 1. Traceability
Every prediction returned to a farmer includes a `prediction_id`.
Using this ID, the MLOps engineer can trace:
- The exact raw input the farmer provided.
- The exact weather/soil features fetched.
- The exact SHAP explanation.
- The exact `model_vX` used to generate the prediction.
- The exact `dataset_vX` used to train that model.

## 2. Role-Based Access Control (RBAC)
- **Data Scientists:** Can train models and push them to the Registry in `STAGING`.
- **MLOps Engineers:** Can promote models to `SHADOW` testing.
- **Platform Admins / Tech Leads:** Can approve the final promotion of a model to `PRODUCTION`.

## 3. Audit Logging
Every action taken in the MLOps platform is logged:
- `[2026-12-01 14:00:00] Alice trained model_v2.`
- `[2026-12-01 16:30:00] Bob promoted model_v2 to SHADOW.`
- `[2026-12-08 09:00:00] Admin Charlie promoted model_v2 to PRODUCTION.`
- `[2026-12-08 10:15:00] Admin Charlie rolled back model_v2 to model_v1 due to latency issues.`
