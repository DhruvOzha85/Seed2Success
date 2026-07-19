# Drift Detection

Models decay over time. The `drift/` module (built on methodologies like Evidently AI) statistically monitors the environment to prevent silent model failure.

## 1. Feature Drift (Data Drift)
Are the inputs changing?
- We compare the distribution of live inference data against the distribution of the training dataset.
- **Methods:** Kolmogorov-Smirnov (K-S) test for continuous variables (Temperature, Rainfall), Chi-Squared for categorical variables.
- *Example:* A massive drought hits India. The incoming rainfall features drop severely compared to the training data. The model is now operating in an unknown space and will likely fail.

## 2. Concept Drift
Has the underlying reality changed?
- We track this by comparing ML predictions against actual farmer feedback.
- *Example:* The model correctly predicts the weather and soil, and suggests Wheat. But due to a new government subsidy, farmers are planting Rice instead. The relationship between the features and the "best crop" target has fundamentally shifted.

## 3. Alerts
When drift exceeds a statistical threshold (e.g., p-value < 0.05 on feature distributions across a rolling 7-day window), an automated alert is fired to the MLOps team to investigate retraining.
