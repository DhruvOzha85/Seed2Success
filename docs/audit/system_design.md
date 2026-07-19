# CTO System Design & Database Audit

**Date:** July 2026  
**Auditor:** Principal Software Architect  
**Status:** Pre-Series A Review  

## 1. Overview
This report evaluates the data layer of Seed2Success. A platform's longevity is dictated by its data models. We currently handle highly dimensional data: Farmer Passports, Prediction Logs, Continuous Learning Feedback, and Vector Embeddings.

## 2. Schema Evaluation
### Current Data Models
- `FarmPassport`: Stores `session_id` and `preferred_language`.
- `PredictionLog`: Stores `prediction_id`, `raw_features` (JSON), and `timestamp`.
- `FeedbackLog`: Links to `prediction_id` and stores harvest outcomes.

### Strengths
- **Extensible JSON:** Using a `JSON` column for `raw_features` is an excellent design choice. It allows Data Scientists to add new features (e.g., Satellite NDVI) without requiring expensive database migrations.
- **Relational Integrity:** The Foreign Key relationship between `PredictionLog` and `FeedbackLog` enables perfect MLOps traceability.

### Weaknesses (Technical Debt)
- **No Geographical Indexing:** The Database currently cannot efficiently query "Show me all diseases reported within 50km of District X". 
- **Missing PII Separation:** If we collect real farmer names or phone numbers, they are currently destined for the same table as the ML logs.

## 3. Database Migration Strategy
To handle millions of farmers, we must retire SQLite.

### Target Architecture
1. **Primary Relational DB (PostgreSQL):**
   - We must migrate from SQLite to PostgreSQL. 
   - **PostGIS Extension:** Crucial for executing geographical bounding-box queries for our weather and disease alerting modules.
2. **Telemetry & Logs (NoSQL / Time-Series):**
   - The `PredictionLog` table will quickly grow to billions of rows. Relational DBs are bad at this.
   - **Action:** Move ML telemetry to a Time-Series database (like InfluxDB or AWS Timestream) or an OLAP data warehouse (Snowflake / BigQuery).
3. **Vector Database:**
   - ChromaDB is currently running locally. 
   - **Action:** Deploy Pinecone or a managed Chroma/Milvus instance for the RAG engine to support distributed similarity search.

## 4. Normalization Review
The current schemas are in 3NF (Third Normal Form). However, for the Analytics Dashboard, we should create materialized views (denormalized tables) that pre-calculate District-level aggregates nightly, ensuring the dashboard loads in <100ms.
