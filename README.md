```markdown
# PINTIG

PINTIG is an explainable non-laboratory cardiovascular risk stratification system developed to support 10-year time-to-event risk estimation using survival machine learning. The project brings together the study's data-processing workflow, model integration, web-based assessment interface, and model explanation components in a single reproducible codebase.

## System Overview

The system follows a simple assessment workflow:

```text
User input
   ↓
React + TypeScript interface
   ↓
FastAPI prediction service
   ↓
Preprocessing pipeline
   ↓
Survival model inference
   ↓
10-year risk estimate
   ↓
Model explanation
```

The web interface collects the non-laboratory variables required by the model and sends them to the backend for validation and inference. The backend applies the saved preprocessing pipeline and survival model, converts the model output into a time-specific risk estimate, and returns the result together with the leading feature contributions used for explanation.

## Technology Stack

- **Frontend:** React, TypeScript, and Vite
- **Backend:** Python and FastAPI
- **Survival modeling:** XGBoost with a survival objective
- **Explainability:** TreeSHAP
- **Data analysis:** Python-based preprocessing, evaluation, and reporting

## Repository Structure

```text
pintig/
├── analysis/      # Evaluation outputs and analysis reports
├── backend/       # FastAPI application and model service
├── data/          # Study data and processed datasets
├── frontend/      # React + TypeScript web interface
├── models/        # Saved preprocessing and survival-model artifacts
├── requirements.txt
└── BACKEND_SETUP.md
```

## Backend API

The FastAPI service provides the following endpoints:

- `GET /health` — verifies that the API and saved model are available
- `GET /model-info` — returns model and study configuration information
- `POST /predict` — accepts assessment inputs and returns the estimated 10-year risk and model contributors

Environment setup and a backend smoke test are documented in [BACKEND_SETUP.md](BACKEND_SETUP.md).

## Research Scope

The study uses longitudinal cardiovascular data to develop and evaluate the end-to-end risk-estimation workflow, including preprocessing, survival modeling, model explanation, API integration, and interface presentation.

PINTIG is designed for **future-risk estimation and risk stratification**, not for diagnosing existing cardiovascular disease. Model explanations describe how input features influence the model prediction and should not be interpreted as causal effects.

The repository is maintained for academic research and system-development purposes. Model outputs are not a substitute for clinical assessment, diagnosis, or treatment decisions.
```