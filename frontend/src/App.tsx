import { ClipboardEvent, FormEvent, KeyboardEvent, useState } from "react";
import { predictRisk } from "./api";
import type { PredictionInput, PredictionResponse } from "./types";

const initialForm: PredictionInput = {
  age_years: 55,
  sex_male: 1,
  sbp_mmhg: 150,
  dbp_mmhg: 90,
  bmi_kg_m2: 29,
  current_smoker: 1,
  cigarettes_per_day: 20,
  bp_medication: 0,
  heart_rate_bpm: 70,
  education_code: 2,
  prior_stroke: 0
};

const labels: Record<string, string> = {
  sex_male: "Sex",
  cigarettes_per_day: "Cigarettes per day",
  age_years: "Age",
  sbp_mmhg: "Systolic blood pressure",
  dbp_mmhg: "Diastolic blood pressure",
  bmi_kg_m2: "Body mass index",
  current_smoker: "Current smoking",
  bp_medication: "BP medication",
  heart_rate_bpm: "Heart rate",
  education_code: "Education",
  prior_stroke: "Prior stroke"
};

const ranges: Partial<Record<keyof PredictionInput, [number, number, string]>> = {
  age_years: [18, 100, "years"],
  sbp_mmhg: [70, 300, "mmHg"],
  dbp_mmhg: [40, 180, "mmHg"],
  bmi_kg_m2: [10, 70, "kg/m²"],
  cigarettes_per_day: [0, 100, "cigarettes/day"],
  heart_rate_bpm: [30, 220, "bpm"]
};

const numericFields = new Set<keyof PredictionInput>([
  "age_years",
  "sbp_mmhg",
  "dbp_mmhg",
  "bmi_kg_m2",
  "cigarettes_per_day",
  "heart_rate_bpm"
]);

function App() {
  const [form, setForm] = useState<PredictionInput>(initialForm);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PredictionInput, string>>>({});

  const setNum = (key: keyof PredictionInput, value: number) =>
    setForm((prev) => ({ ...prev, [key]: value } as PredictionInput));

  function numericKeyDown(
    key: keyof PredictionInput,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End"
    ];
    const isShortcut = event.ctrlKey || event.metaKey;
    const isAllowedCharacter = /[0-9.]/.test(event.key);
    if (event.key.length === 1 && !isAllowedCharacter && !isShortcut) {
      event.preventDefault();
      setFieldErrors((prev) => ({
        ...prev,
        [key]: `${labels[key] ?? key} must be a number.`
      }));
    }
    if (event.key === "." && event.currentTarget.value.includes(".")) {
      event.preventDefault();
      setFieldErrors((prev) => ({
        ...prev,
        [key]: `${labels[key] ?? key} must be a number.`
      }));
    }
    if (allowedControlKeys.includes(event.key)) {
      return;
    }
  }

  function numericPaste(
    key: keyof PredictionInput,
    event: ClipboardEvent<HTMLInputElement>
  ) {
    if (!/^\d*\.?\d*$/.test(event.clipboardData.getData("text"))) {
      event.preventDefault();
      setFieldErrors((prev) => ({
        ...prev,
        [key]: `${labels[key] ?? key} must be a number.`
      }));
    }
  }

  function fieldValidationMessage(key: keyof PredictionInput, value: number) {
    const range = ranges[key];
    if (!Number.isFinite(value)) {
      return `${labels[key] ?? key} must be a number.`;
    }
    if (range && (value < range[0] || value > range[1])) {
      return `${labels[key] ?? key} must be between ${range[0]} and ${range[1]} ${range[2]}.`;
    }
    return undefined;
  }

  function setNumericField(key: keyof PredictionInput, rawValue: string) {
    // Reject pasted or injected characters too; the controlled value remains unchanged.
    if (!/^\d*\.?\d*$/.test(rawValue)) {
      return;
    }
    const value = rawValue.trim() === "" ? Number.NaN : Number(rawValue);
    setNum(key, value);
    setFieldErrors((prev) => ({
      ...prev,
      [key]: fieldValidationMessage(key, value)
    }));
  }

  function setSmoker(value: 0 | 1) {
    setForm((prev) => ({
      ...prev,
      current_smoker: value,
      cigarettes_per_day: value === 0 ? 0 : prev.cigarettes_per_day
    }));
    if (value === 0) {
      setFieldErrors((prev) => ({ ...prev, cigarettes_per_day: undefined }));
    }
  }

  function validateForm() {
    const errors: Partial<Record<keyof PredictionInput, string>> = {};
    for (const key of numericFields) {
      const value = form[key] as number;
      const message = fieldValidationMessage(key, value);
      if (message) {
        errors[key] = message;
      }
    }
    setFieldErrors(errors);
    const firstError = Object.values(errors)[0];
    return firstError ?? "";
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
    try {
      const payload = {
        ...form,
        cigarettes_per_day: form.current_smoker === 0 ? 0 : form.cigarettes_per_day
      };
      setResult(await predictRisk(payload));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">PINTIG</div>
          <div className="subtitle">Explainable 10-Year Coronary Risk Prototype</div>
        </div>
        <span className="badge">Research Prototype</span>
      </header>

      <main className="page">
        <section className="hero">
          <p className="eyebrow">NON-LABORATORY SURVIVAL RISK ASSESSMENT</p>
          <h1>Estimate 10-year MI / fatal-CHD risk</h1>
          <p>Enter baseline non-laboratory information to generate a prototype Survival XGBoost estimate.</p>
        </section>

        <div className="layout">
          <section className="panel">
            <h2>Assessment inputs</h2>
            <form className="form-grid" onSubmit={submit} noValidate>
              <label>Age (years)<input type="text" inputMode="decimal" min="18" max="100" value={Number.isFinite(form.age_years) ? form.age_years : ""} aria-invalid={Boolean(fieldErrors.age_years)} aria-describedby="age-error" onKeyDown={e=>numericKeyDown("age_years",e)} onPaste={e=>numericPaste("age_years",e)} onChange={e=>setNumericField("age_years",e.target.value)} onBlur={e=>setFieldErrors(prev=>({...prev,age_years:fieldValidationMessage("age_years",Number(e.target.value))}))} />{fieldErrors.age_years && <small id="age-error" className="field-error">{fieldErrors.age_years}</small>}</label>
              <label>Sex<select aria-label="Sex" value={form.sex_male} onChange={e=>setNum("sex_male",+e.target.value)}><option value={1}>Male</option><option value={0}>Female</option></select></label>
              <label>Systolic BP (mmHg)<input type="text" inputMode="decimal" min="70" max="300" value={Number.isFinite(form.sbp_mmhg) ? form.sbp_mmhg : ""} aria-invalid={Boolean(fieldErrors.sbp_mmhg)} aria-describedby="sbp-error" onKeyDown={e=>numericKeyDown("sbp_mmhg",e)} onPaste={e=>numericPaste("sbp_mmhg",e)} onChange={e=>setNumericField("sbp_mmhg",e.target.value)} onBlur={e=>setFieldErrors(prev=>({...prev,sbp_mmhg:fieldValidationMessage("sbp_mmhg",Number(e.target.value))}))} />{fieldErrors.sbp_mmhg && <small id="sbp-error" className="field-error">{fieldErrors.sbp_mmhg}</small>}</label>
              <label>Diastolic BP (mmHg)<input type="text" inputMode="decimal" min="40" max="180" value={Number.isFinite(form.dbp_mmhg) ? form.dbp_mmhg : ""} aria-invalid={Boolean(fieldErrors.dbp_mmhg)} aria-describedby="dbp-error" onKeyDown={e=>numericKeyDown("dbp_mmhg",e)} onPaste={e=>numericPaste("dbp_mmhg",e)} onChange={e=>setNumericField("dbp_mmhg",e.target.value)} onBlur={e=>setFieldErrors(prev=>({...prev,dbp_mmhg:fieldValidationMessage("dbp_mmhg",Number(e.target.value))}))} />{fieldErrors.dbp_mmhg && <small id="dbp-error" className="field-error">{fieldErrors.dbp_mmhg}</small>}</label>
              <label>BMI (kg/m²)<input type="text" inputMode="decimal" min="10" max="70" step="0.1" value={Number.isFinite(form.bmi_kg_m2) ? form.bmi_kg_m2 : ""} aria-invalid={Boolean(fieldErrors.bmi_kg_m2)} aria-describedby="bmi-error" onKeyDown={e=>numericKeyDown("bmi_kg_m2",e)} onPaste={e=>numericPaste("bmi_kg_m2",e)} onChange={e=>setNumericField("bmi_kg_m2",e.target.value)} onBlur={e=>setFieldErrors(prev=>({...prev,bmi_kg_m2:fieldValidationMessage("bmi_kg_m2",Number(e.target.value))}))} />{fieldErrors.bmi_kg_m2 && <small id="bmi-error" className="field-error">{fieldErrors.bmi_kg_m2}</small>}</label>
              <label>Heart rate (bpm)<input type="text" inputMode="decimal" min="30" max="220" value={Number.isFinite(form.heart_rate_bpm) ? form.heart_rate_bpm : ""} aria-invalid={Boolean(fieldErrors.heart_rate_bpm)} aria-describedby="heart-rate-error" onKeyDown={e=>numericKeyDown("heart_rate_bpm",e)} onPaste={e=>numericPaste("heart_rate_bpm",e)} onChange={e=>setNumericField("heart_rate_bpm",e.target.value)} onBlur={e=>setFieldErrors(prev=>({...prev,heart_rate_bpm:fieldValidationMessage("heart_rate_bpm",Number(e.target.value))}))} />{fieldErrors.heart_rate_bpm && <small id="heart-rate-error" className="field-error">{fieldErrors.heart_rate_bpm}</small>}</label>
              <label>Current smoker<select value={form.current_smoker} onChange={e=>setSmoker(Number(e.target.value) as 0 | 1)}><option value={1}>Yes</option><option value={0}>No</option></select></label>
              <label>Cigarettes/day<input type="text" inputMode="decimal" min="0" max="100" disabled={form.current_smoker===0} value={form.current_smoker===0?0:(Number.isFinite(form.cigarettes_per_day) ? form.cigarettes_per_day : "")} aria-invalid={Boolean(fieldErrors.cigarettes_per_day)} aria-describedby="cigarettes-error" onKeyDown={e=>numericKeyDown("cigarettes_per_day",e)} onPaste={e=>numericPaste("cigarettes_per_day",e)} onChange={e=>setNumericField("cigarettes_per_day",e.target.value)} onBlur={e=>setFieldErrors(prev=>({...prev,cigarettes_per_day:fieldValidationMessage("cigarettes_per_day",Number(e.target.value))}))} />{fieldErrors.cigarettes_per_day && <small id="cigarettes-error" className="field-error">{fieldErrors.cigarettes_per_day}</small>}</label>
              <label>BP medication<select value={form.bp_medication} onChange={e=>setNum("bp_medication",+e.target.value)}><option value={0}>No</option><option value={1}>Yes</option></select></label>
              <label>Prior stroke<select value={form.prior_stroke} onChange={e=>setNum("prior_stroke",+e.target.value)}><option value={0}>No</option><option value={1}>Yes</option></select></label>
              <label className="wide">Education category<select value={form.education_code} onChange={e=>setNum("education_code",+e.target.value)}><option value={1}>Category 1</option><option value={2}>Category 2</option><option value={3}>Category 3</option><option value={4}>Category 4</option></select><small>Temporary Framingham coding; this will be updated when the final research dataset is defined.</small></label>
              <div className="actions wide"><button type="button" className="secondary" onClick={()=>{setForm(initialForm);setFieldErrors({});setError("");setResult(null);}}>Reset</button><button className="primary" disabled={loading}>{loading?"Calculating…":"Generate 10-year estimate"}</button></div>
            </form>
            {error && <div className="error" role="alert" aria-live="assertive">{error}</div>}
          </section>

          <section className="panel result-panel">
            {!result ? (
              <div className="empty"><div className="heart">♥</div><h2>Risk result will appear here</h2><p>Submit the assessment to view the probability and model contributors.</p></div>
            ) : (
              <>
                <p className="eyebrow">10-YEAR MODEL ESTIMATE</p>
                <div className="risk-card"><div className="risk-number">{result.risk_percent.toFixed(1)}<span>%</span></div><div><strong>Estimated 10-year risk</strong><p>MI or fatal coronary heart disease</p></div></div>
                <p className="endpoint-label">Endpoint: first MI or fatal coronary heart disease within 10 years</p>
                <h3>Top model contributors</h3>
                <p className="note">These explain this model prediction; they do not establish causality.</p>
                <div className="contributors">
                  {result.top_contributors.map(item => <div className="contributor" key={item.feature}><div><strong>{labels[item.feature] ?? item.feature}</strong><span>{item.direction}</span></div><b className={item.contribution>=0?"up":"down"}>{item.contribution>=0?"↑":"↓"}</b></div>)}
                </div>
                <div className="warning"><strong>Prototype limitation</strong><p>{result.warning}</p></div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
