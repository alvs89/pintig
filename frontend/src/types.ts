export type PredictionInput = {
  age_years: number;
  sex_male: 0 | 1;
  sbp_mmhg: number;
  dbp_mmhg: number;
  bmi_kg_m2: number;
  current_smoker: 0 | 1;
  cigarettes_per_day: number;
  bp_medication: 0 | 1;
  heart_rate_bpm: number;
  education_code: 1 | 2 | 3 | 4;
  prior_stroke: 0 | 1;
};

export type Contribution = {
  feature: string;
  contribution: number;
  direction: string;
};

export type PredictionResponse = {
  model_name: string;
  horizon_years: number;
  risk_probability: number;
  risk_percent: number;
  risk_score_margin: number;
  top_contributors: Contribution[];
  warning: string;
};
