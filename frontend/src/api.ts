import type { PredictionInput, PredictionResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function predictRisk(payload: PredictionInput): Promise<PredictionResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error(
      `Unable to reach the backend at ${API_BASE_URL}. Start FastAPI and verify the frontend API URL.`
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as {
      detail?: Array<{ msg?: string }> | string;
    } | null;
    const detail = Array.isArray(body?.detail)
      ? body.detail.map((item) => item.msg).filter(Boolean).join("; ")
      : body?.detail;
    throw new Error(detail || `Prediction failed (${response.status})`);
  }

  return response.json();
}
