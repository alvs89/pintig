# PINTIG Prototype Survival-Model Validation

## Modeling setup
- **Cohort:** 4,240 baseline participants without prevalent CHD
- **Outcome:** MI or fatal coronary heart disease (`MI_FCHD`)
- **Prediction horizon:** 10 years
- **10-year events:** 191 (4.5%)
- **Predictors:** strict non-laboratory prototype variables
- **Internal validation:** 5-fold nested cross-validation
- **Benchmark:** Cox proportional hazards
- **Machine-learning model:** Survival XGBoost (`survival:cox`)

All imputation, scaling, and categorical encoding were fitted only inside training folds.

## Cross-validated performance

| Model | C-index | 10-year AUC | 10-year Brier score |
|---|---:|---:|---:|
| Cox PH | 0.764 ± 0.032 | 0.772 ± 0.032 | 0.0414 ± 0.0013 |
| Survival XGBoost | 0.760 ± 0.043 | 0.766 ± 0.044 | 0.0417 ± 0.0011 |

### Interpretation
In this prototype, **Cox performed slightly better on average than Survival XGBoost** for discrimination and Brier score. The difference is small, but the current evidence does **not** support claiming that XGBoost is superior.

This is useful for the thesis: the algorithm should be selected based on validated performance, not because machine learning is assumed to outperform conventional survival analysis.

## Calibration
Out-of-fold predictions were grouped into risk quintiles and compared against Kaplan-Meier observed 10-year risk. The calibration table is included in the workbook and CSV output.

## Final prototype XGBoost
After unbiased outer-fold validation was completed, XGBoost hyperparameters were selected again using 5-fold cross-validation on the full development cohort, and a final prototype model was fitted to all 4,240 participants.

Selected configuration:
```text
{
  "max_depth": 1,
  "eta": 0.03,
  "min_child_weight": 10,
  "subsample": 1.0,
  "colsample_bytree": 1.0,
  "lambda": 10,
  "alpha": 0,
  "nround": 400
}
```

## Explainability
TreeSHAP was computed for the final XGBoost prototype. The leading predictors by mean absolute contribution on the model-margin scale were:

- sex_male
- age_years
- sbp_mmhg
- cigarettes_per_day
- bmi_kg_m2
- education_code

These values describe **model contribution**, not causal cardiovascular effects.

## Important limitation
The Framingham file used here is an anonymized/statistically modified **teaching dataset**. These results are appropriate for developing and testing the PINTIG methodology and software pipeline, but they are **not final clinical-validation evidence and do not validate PINTIG for Filipino adults**.

## Next development step
The next step is to integrate the saved preprocessing + Survival XGBoost artifacts into the backend and build the individual SHAP explanation/risk-output workflow. When the approved PURE dataset becomes available, the same pipeline should be rerun using the final approved endpoint and predictor definitions.
