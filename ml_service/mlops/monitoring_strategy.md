# Monitoring Strategy

The `monitoring/` module ensures the Inference Service is healthy from an infrastructure and ML perspective.

## 1. Service Level Indicators (SLIs)
We track the following via Prometheus & Grafana:
- **Prediction Latency:** P50, P90, P99 (Target: P99 < 300ms).
- **Prediction Volume:** Requests per second.
- **Error Rate:** HTTP 500s or timeouts.

## 2. ML Indicators
- **Confidence Distribution:** Are we suddenly seeing a massive spike in low-confidence (<0.50) predictions? This indicates the model is struggling.
- **Crop Distribution:** Is the model suddenly predicting "RICE" for 99% of requests? This indicates a catastrophic bug in the feature pipeline.
- **Model Availability:** Can the API load the `best_model.pkl` successfully?

## 3. Logs & Telemetry
Every single API request generates a telemetry JSON log containing the Request ID, Farmer ID, Inference Time, Provider Used, and exact Feature vector. These logs are aggregated into an ELK stack or DataDog.
