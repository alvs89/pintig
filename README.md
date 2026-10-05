# PINTIG

PINTIG is a prototype project for Framingham-based 10-year myocardial
infarction and fatal coronary heart disease risk prediction.

## Backend

The FastAPI backend loads the saved XGBoost survival model and exposes:

- `GET /health`
- `GET /model-info`
- `POST /predict`

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for environment setup and a smoke-test
request.

The model is a research prototype trained on a statistically modified teaching
dataset. Its output is not clinical advice and has not been clinically
validated for Filipino adults.
