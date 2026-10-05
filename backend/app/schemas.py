from typing import Literal

from pydantic import BaseModel, Field, model_validator


class PredictionInput(BaseModel):
    age_years: float = Field(..., ge=18, le=100)
    sex_male: Literal[0, 1]
    sbp_mmhg: float = Field(..., ge=70, le=300)
    dbp_mmhg: float = Field(..., ge=40, le=180)
    bmi_kg_m2: float = Field(..., ge=10, le=70)
    current_smoker: Literal[0, 1]
    cigarettes_per_day: float = Field(..., ge=0, le=100)
    bp_medication: Literal[0, 1]
    heart_rate_bpm: float = Field(..., ge=30, le=220)
    education_code: Literal[1, 2, 3, 4]
    prior_stroke: Literal[0, 1]

    @model_validator(mode="after")
    def validate_smoking(self):
        if self.current_smoker == 0 and self.cigarettes_per_day > 0:
            raise ValueError(
                "cigarettes_per_day must be 0 when current_smoker is 0."
            )
        return self


class Contribution(BaseModel):
    feature: str
    contribution: float
    direction: str


class PredictionResponse(BaseModel):
    model_name: str
    horizon_years: int
    risk_probability: float
    risk_percent: float
    risk_score_margin: float
    top_contributors: list[Contribution]
    warning: str
