# Seed2Success — Comprehensive Technical Documentation

This document provides an in-depth technical overview of the **Seed2Success** platform, an Enterprise AI Agricultural application. The platform relies on a distributed microservice architecture spanning a React frontend, a Node.js API Gateway (Backend), and a Python FastAPI Machine Learning (ML) Inference service.

---

## 1. High-Level Architecture

Seed2Success uses a decoupled 3-tier architecture, ensuring that heavy machine learning data processing tasks scale independently from standard web traffic and authentication workflows.

```mermaid
flowchart LR
    subgraph FE["Frontend Layer (React + Vite)"]
        A1[Dashboards: Planning, Health, Harvest, Selling]
    end

    subgraph BE["API Gateway (Node.js + Express)"]
        B1[Auth & JWT]
        B2[Rate Limiting & Security]
        B3[MongoDB Connection]
        B4[Proxy to ML via X-API-Key]
    end

    subgraph ML["ML Service (FastAPI + Python)"]
        C1[Data Aggregation: Open-Meteo & SoilGrids]
        C2[RandomForest Model (Predictive)]
        C3[SHAP TreeExplainer (Explainability)]
        C4[LLM Router (Gemini/Groq)]
    end

    FE -- HTTPS/JWT --> BE
    BE -- REST / X-API-Key --> ML
```

---

## 2. Component Breakdown

### 2.1. Frontend (`frontEnd/`)
**Stack:** React, Vite, TailwindCSS, React Router DOM, Axios, i18next
**Role:** The client-facing application providing farmers with localized, real-time insights based on their input.

**Key Features:**
- **Module-Based Dashboards:** Includes distinct modules like AI Prediction, Crop Health, Harvesting, and Selling.
- **Internationalization (i18n):** Supports multiple languages (`i18next-browser-languagedetector`) making it accessible for local farmers.
- **Vite Build System:** Fast hot-reloading during development and optimized bundling for production.
- **API Communication:** Interacts exclusively with the Node.js Backend Gateway via `Axios`, passing JWTs in headers for authenticated endpoints.

### 2.2. Backend / API Gateway (`BackEnd/`)
**Stack:** Node.js, Express, MongoDB (via Mongoose), JWT, Helmet, Express-Rate-Limit
**Role:** Acts as the secure gateway for the platform. It handles user state, persistent storage, and forwards specialized predictive queries to the ML service.

**Key Features:**
- **Authentication & Security:** Uses `bcryptjs` for password hashing and `jsonwebtoken` (JWT) for secure session management. Uses `helmet` for HTTP header security.
- **Global Rate Limiting:** Enforces a limit (e.g., 100 requests per 15 minutes per IP) to prevent DDoS and brute-force attacks.
- **Database:** Connects to a cloud MongoDB Atlas cluster (configured in `.env`) to store users, historical predictions, and feedback.
- **Secure ML Proxying:** Communicates with the ML Service using a shared internal secret (`INTERNAL_API_KEY`) to prevent external internet traffic from directly hitting the ML engine.

**Core Routes:**
- `/api/auth`: Registration and login.
- `/api/recommend-crop`: Core endpoint for farm inputs (triggers ML inference).
- `/api/crop-health`, `/api/harvest`, `/api/selling`: Module-specific data handlers.
- `/api/history`, `/api/schemes`, `/api/profile`: User data retrieval and management.

### 2.3. Machine Learning Service (`ml_service/`)
**Stack:** Python, FastAPI, Scikit-Learn, Pandas, SHAP, SQLite
**Role:** The intelligence core of the platform. It fetches external environmental data, runs machine learning models, explains the models, and synthesizes natural language feedback.

**Key Features:**
- **Predictive Engine:** Uses an optimized `RandomForestRegressor` (loaded via `joblib` from `best_model.pkl`) to calculate predicted crop yields and suggest optimal planting configurations.
- **Data Aggregation Engine:** Dynamically queries external APIs (Weather & Soil) asynchronously based purely on the farmer's GPS coordinates.
- **Explainable AI (XAI):** Implements `SHAP` (SHapley Additive exPlanations) to interpret the Random Forest's output. Instead of a black box, the platform knows *why* a crop was recommended (e.g., nitrogen levels vs. rainfall).
- **Generative AI Router (LLM):** Passes the SHAP outputs to an LLM to generate a human-readable narrative. It primarily attempts to use **Google Gemini**, with a graceful fallback to **Groq (Llama-3)** in case of rate limits, and finally to a deterministic string builder if all networks fail.
- **SQLite Database:** Uses a local SQLite database (`s2s_platform.db`) to track MLOps metrics and model feedback loops.

---

## 3. External API Integrations

The platform extensively relies on external data sources and intelligence APIs:

1. **Open-Meteo API (Free/Open):** Fetches localized, historical, and forecasted weather data (Temperature, Rainfall, Humidity).
2. **SoilGrids API:** Queries specific GPS coordinates to retrieve soil profiles (pH, Nitrogen, Soil Organic Carbon, Bulk Density) removing the need for manual soil testing by the farmer.
3. **Google Gemini API:** Primary generative AI used to translate tabular machine learning predictions into localized, conversational advice.
4. **Groq API (Llama-3):** High-speed LLM fallback to ensure narrative generation remains available.
5. **Google Vision API & Plant ID API:** Utilized for the Crop Health module. Analyzes images uploaded by the farmer to identify plant species and diagnose diseases.

---

## 4. End-to-End Data Flow (Crop Recommendation)

1. **Input:** A farmer logs into the React frontend and provides their GPS coordinates (Latitude & Longitude) and budget/land area.
2. **Proxy:** The frontend sends an HTTPS POST request with a JWT to the Node.js Backend Gateway.
3. **Validation:** The Node.js server verifies the JWT, checks rate limits, and forwards the GPS data to the Python FastAPI ML Service along with a secret `X-API-Key`.
4. **Data Enrichment:** The ML Service runs asynchronous tasks to fetch current Weather from Open-Meteo and Soil properties from SoilGrids.
5. **Inference:** The aggregated data is fed into the `RandomForestRegressor` (`best_model.pkl`) which outputs a primary crop recommendation, estimated yield (tons/hectare), and top 3 alternatives.
6. **Explainability & Generation:** The `SHAP` explainer calculates feature importance. These values are piped into the **Gemini** (or **Groq**) LLM, which writes a personalized paragraph for the farmer.
7. **Response:** The completed JSON payload (Predictions + Narrative) is returned to Node.js, saved to MongoDB (History), and sent back to the React UI for display.

---

## 5. Security & Deployment Posture

- **Secrets Management:** All API keys, database URIs, and JWT secrets are strictly managed via `.env` files across the three directories.
- **Internal APIs:** The Python ML Service is not meant to be exposed to the public internet directly. It is secured by a shared `INTERNAL_API_KEY` validated on every request (`core/security.py`).
- **File Uploads:** Handled securely via `multer` in Node.js, configured to accept only safe image payloads (up to 5mb) for Vision processing.
