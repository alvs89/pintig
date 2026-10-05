# PINTIG Framingham Cleaning Report

## Source
- Raw examination records: **11,627**
- Raw columns: **39**
- Unique participants: **4,434**

## Cohort construction
1. Kept `PERIOD == 1`: **4,434** baseline participants.
2. Kept `PREVCHD == 0`: **4,240** participants for first-coronary-event modeling.

## Outcome
- `MI_FCHD`: myocardial infarction or fatal coronary heart disease.
- `TIMEMIFC`: days from baseline to first event or censoring.
- Full-follow-up events: **609**

## 10-year derived endpoint
- Horizon: **3652.5 days**
- Events within 10 years: **191**
- Participants observed at least 10 years: **3,777**

## Missing values

| Variable | Missing |
|---|---:|
| `participant_id` | 0 |
| `age_years` | 0 |
| `sex_male` | 0 |
| `sbp_mmhg` | 0 |
| `dbp_mmhg` | 0 |
| `bmi_kg_m2` | 19 |
| `current_smoker` | 0 |
| `cigarettes_per_day` | 29 |
| `bp_medication` | 53 |
| `heart_rate_bpm` | 1 |
| `education_code` | 105 |
| `prior_stroke` | 0 |
| `event_mi_fatal_chd` | 0 |
| `time_mi_fatal_chd_days` | 0 |
| `event_10y` | 0 |
| `time_10y_days` | 0 |
| `observed_at_least_10y` | 0 |

## Important preprocessing decisions
- Kept only baseline measurements to avoid treating repeat visits as independent participants.
- Excluded prevalent CHD to support first-event risk modeling.
- Excluded laboratory variables (`TOTCHOL`, `GLUCOSE`, `HDLC`, `LDLC`).
- Excluded `DIABETES` from this strict non-laboratory prototype because its teaching-dataset definition can incorporate glucose measurement.
- Excluded other future outcome/time variables from the predictor set to prevent target leakage.
- Did **not** impute missing predictor values globally. Imputation should be learned only inside the training/cross-validation pipeline.
- Duplicate participant IDs after cleaning: **0**
- Raw `framingham.csv` was not modified.