import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import xgboost as xgb


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = PROJECT_ROOT / "models" / "framingham_prototype"

PREPROCESSOR_PATH = MODEL_DIR / "pintig_preprocessor.joblib"
MODEL_PATH = MODEL_DIR / "pintig_survival_xgboost.json"
BASELINE_HAZARD_PATH = MODEL_DIR / "pintig_xgb_baseline_hazard.csv"
METADATA_PATH = MODEL_DIR / "pintig_model_metadata.json"


class ModelService:
    def __init__(self):
        required = [
            PREPROCESSOR_PATH,
            MODEL_PATH,
            BASELINE_HAZARD_PATH,
            METADATA_PATH,
        ]
        missing = [str(path) for path in required if not path.exists()]
        if missing:
            raise FileNotFoundError(
                "Missing required model files:\n" + "\n".join(missing)
            )

        self.preprocessor = joblib.load(PREPROCESSOR_PATH)
        self.model = xgb.Booster()
        self.model.load_model(MODEL_PATH)
        self.baseline = pd.read_csv(BASELINE_HAZARD_PATH)

        with METADATA_PATH.open("r", encoding="utf-8") as file:
            self.metadata = json.load(file)

        self.feature_columns = self.metadata["predictors"]
        self.horizon_days = float(self.metadata["horizon_days"])
        self.horizon_years = int(round(self.horizon_days / 365.25))

        eligible = self.baseline[
            self.baseline["event_time_days"] <= self.horizon_days
        ]
        if eligible.empty:
            raise ValueError(
                "Baseline hazard file has no values at or before the model horizon."
            )

        self.h0_horizon = float(
            eligible["baseline_cumulative_hazard"].iloc[-1]
        )
        self.transformed_feature_names = (
            self.preprocessor.get_feature_names_out()
        )

    @staticmethod
    def _original_feature_name(name: str) -> str:
        clean = name.split("__", 1)[-1]
        if clean.startswith("education_code_"):
            return "education_code"
        return clean

    def predict(self, payload: dict) -> dict:
        row = pd.DataFrame([payload])[self.feature_columns]
        transformed = self.preprocessor.transform(row)
        dmatrix = xgb.DMatrix(transformed)

        margin = float(self.model.predict(dmatrix, output_margin=True)[0])
        relative_hazard = float(np.exp(np.clip(margin, -30, 30)))
        risk_probability = float(
            np.clip(1.0 - np.exp(-self.h0_horizon * relative_hazard), 0.0, 1.0)
        )

        shap_row = self.model.predict(dmatrix, pred_contribs=True)[0]
        aggregated = {}
        for feature_name, value in zip(
            self.transformed_feature_names, shap_row[:-1]
        ):
            original = self._original_feature_name(feature_name)
            aggregated[original] = aggregated.get(original, 0.0) + float(value)

        top_contributors = [
            {
                "feature": feature,
                "contribution": value,
                "direction": (
                    "increases model risk score"
                    if value > 0
                    else "decreases model risk score"
                    if value < 0
                    else "neutral"
                ),
            }
            for feature, value in sorted(
                aggregated.items(),
                key=lambda item: abs(item[1]),
                reverse=True,
            )[:5]
        ]

        return {
            "model_name": "PINTIG Framingham teaching-data prototype",
            "horizon_years": self.horizon_years,
            "risk_probability": round(risk_probability, 6),
            "risk_percent": round(risk_probability * 100, 2),
            "risk_score_margin": round(margin, 6),
            "top_contributors": top_contributors,
            "warning": (
                "Prototype/research output only. This model was developed "
                "from a statistically modified Framingham teaching dataset "
                "and is not clinically validated for Filipino adults."
            ),
        }
