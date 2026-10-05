# PINTIG Framingham EDA Report

## Cohort
- Participants: **4,240**
- Full-follow-up MI/fatal-CHD events: **609 (14.4%)**
- 10-year MI/fatal-CHD events: **191 (4.5%)**
- Participants observed for at least 10 years: **3,777 (89.1%)**
- Median available follow-up: **24.0 years**

## Missingness
Missingness is low overall. The largest missingness is **education_code: 105 (2.48%)**.
No outcome or survival-time values are missing.

## Baseline profile
- Age: mean **49.6** years; range **32-70**
- SBP: mean **132.4** mmHg
- BMI: mean **25.8** kg/m²
- Male: **42.9%**
- Current smoker: **49.4%**

## 10-year event-group signal
Participants with a 10-year event were, on average:
- older (**53.3 vs 49.4 years**),
- had higher SBP (**145.5 vs 131.7 mmHg**),
- and were more often male (**74.3% vs 41.4%**).

These are descriptive comparisons only; they are not causal claims or model-selection evidence.

## Data-quality decisions
- **No global imputation** was performed.
- **No outliers were deleted** without evidence that they are data-entry errors.
- Missing-value imputation must be fitted only on training folds.
- Outcome/time variables and future-event variables must remain excluded from predictors to avoid leakage.

## Next step
Build the leakage-safe modeling pipeline:
1. preprocessing within resampling,
2. Cox proportional-hazards benchmark,
3. Survival XGBoost,
4. internal validation using resampling rather than a simple one-time 80/20 split,
5. C-index, time-dependent AUC, Brier score, and 10-year calibration,
6. SHAP only after the final model pipeline is established.
