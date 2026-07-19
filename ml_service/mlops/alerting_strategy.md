# Alerting Strategy

The `alerts/` module prevents silent failures by pushing critical notifications to the engineering team via Slack and PagerDuty.

## 1. Critical Alerts (Page On-Call Immediately)
- **High Failure Rate:** HTTP 500 errors > 2% for 5 minutes.
- **High Latency:** P99 Latency > 1000ms for 5 minutes.
- **Pipeline Failure:** The automated retraining cron job crashed.
- **Missing Data:** External API (NASA or SoilGrids) went down, causing the Feature Store to return NULLs.

## 2. Warning Alerts (Slack Notification, Next-Day Fix)
- **Data Drift Detected:** Feature drift exceeded 15% threshold.
- **Low Confidence Spike:** Average prediction confidence dropped below 0.65 for the day.
- **Model Drift:** MAE has slowly increased by 10% over the last month.

## 3. Alert Fatigue Prevention
Alerts are heavily deduplicated and require sustained threshold breaches (e.g., > 5 mins) to prevent spamming engineers over momentary network blips.
