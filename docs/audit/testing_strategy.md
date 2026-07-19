# CTO Testing Strategy Report

**Date:** July 2026  
**Auditor:** Principal QA Engineer  
**Status:** Pre-Series A Review  

## 1. Overview
The current Seed2Success platform has zero automated tests. Code is tested manually by running the FastAPI server. This is a severe risk; as the platform grows, a change to the RAG engine could silently break the ML inference pipeline.

## 2. Testing Pyramid Implementation
Before launching to external users, we must implement a strict `pytest` testing pyramid.

### 1. Unit Tests (Fast & Isolated)
- **Target:** The Core `ml_service/services/` logic, database schemas, and helper functions.
- **Mocking:** All Database, LLM, and Vector DB connections must be mocked using `unittest.mock`.
- **Coverage Goal:** 85%+ code coverage.

### 2. API / Integration Tests
- **Target:** The FastAPI routes (`/predict`, `/voice`, `/vision`).
- **Tool:** `fastapi.testclient.TestClient`.
- **Strategy:** Spin up an ephemeral SQLite test database, send HTTP POST requests, and assert the JSON response matches the OpenAPI schema and correct HTTP status codes.

### 3. ML & LLM Specific Testing
Traditional unit tests (assert 1+1=2) do not work for Generative AI or Machine Learning.
- **Model Regression Tests:** Nightly jobs that run a golden dataset of 1,000 farmers through the `best_model.pkl` to assert that accuracy hasn't degraded due to library updates.
- **LLM Evals:** Use a framework like `DeepEval` or `Ragas` to score the Gemini responses for Faithfulness (no hallucinations) and Answer Relevancy.

### 4. Load & Stress Testing
- **Tool:** `Locust` or `k6`.
- **Strategy:** Simulate 1,000 concurrent farmers sending Crop Prediction requests to evaluate if the async FastAPI event loop handles the CPU-bound `scikit-learn` load before timing out.
