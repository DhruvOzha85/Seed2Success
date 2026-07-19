# Dataset Registry

To guarantee reproducibility and trace errors back to their source, the data must be treated as carefully as the code.

## 1. Versioning Architecture
We utilize a Data Version Control (DVC) or Delta Lake methodology.
Instead of passing around CSVs, datasets are stored in an object store (S3) and referenced by immutable hashes.

## 2. Dataset Metadata
Every dataset version tracks:
- **`Version_ID`**: e.g. `v2.1`
- **`Hash`**: SHA-256 of the parquet file.
- **`Schema Profile`**: Number of rows, columns, data types.
- **`Missing Values %`**: Quality control metric.
- **`Source Lineage`**: Did this come from NASA, SoilGrids, or Farmer Feedback?
- **`Validation Status`**: Is this raw data, or has it passed human HITL verification?

## 3. The "Time Travel" Requirement
If a farmer complains that they received a bizarre recommendation in March 2025, the MLOps engineer must be able to load the EXACT dataset and the EXACT model that existed in March 2025 to debug the issue. The Dataset Registry makes this possible.
