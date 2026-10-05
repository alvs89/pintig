from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .model_service import ModelService
from .schemas import PredictionInput, PredictionResponse


app = FastAPI(
    title="PINTIG Prototype API",
    version="0.1.0",
    description=(
        "Prototype 10-year MI/fatal-CHD survival-risk inference API. "
        "For research/system-development use only."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

model_service = ModelService()


@app.get("/")
def root():
    return {"name": "PINTIG Prototype API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": True}


@app.get("/model-info")
def model_info():
    return {
        "model_name": "Survival XGBoost",
        "endpoint": model_service.metadata["endpoint"],
        "horizon_days": model_service.horizon_days,
        "predictors": model_service.feature_columns,
        "validation": model_service.metadata["validation"],
        "limitation": model_service.metadata["important_limitation"],
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionInput):
    return model_service.predict(payload.model_dump())
