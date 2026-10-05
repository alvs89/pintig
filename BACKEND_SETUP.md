# PINTIG Backend Starter

Copy these files into the root of your existing `PINTIG` project.

Expected model artifact folder:

```text
PINTIG/
└── models/
    └── framingham_prototype/
        ├── pintig_preprocessor.joblib
        ├── pintig_survival_xgboost.json
        ├── pintig_xgb_baseline_hazard.csv
        └── pintig_model_metadata.json
```

From the `PINTIG` root:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload
```

Open:

`http://127.0.0.1:8000/docs`

Use `/predict` with this smoke-test payload:

```json
{
  "age_years": 55,
  "sex_male": 1,
  "sbp_mmhg": 150,
  "dbp_mmhg": 90,
  "bmi_kg_m2": 29,
  "current_smoker": 1,
  "cigarettes_per_day": 20,
  "bp_medication": 0,
  "heart_rate_bpm": 70,
  "education_code": 2,
  "prior_stroke": 0
}
```

With the supplied prototype artifacts and matching package versions, the predicted 10-year risk should be approximately 19%.
