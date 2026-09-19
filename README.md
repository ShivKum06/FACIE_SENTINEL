# FACIE Sentinel

### Adaptive API Security Gateway with Risk Detection & Anomaly Detection

Facie Sentinel is an adaptive API security platform that detects, analyzes, and responds to suspicious API activity in real time.

It combines **rule-based threat detection, machine learning, risk scoring, and an adaptive Facie policy engine** to protect APIs from common security threats.

---

## 🚀 Features

- 🔍 Real-time API threat detection
- 🤖 ML-based anomaly detection using Isolation Forest
- 🎯 Risk scoring from 0–100
- 🧠 Adaptive Facie security policy
- 🔐 BOLA / IDOR protection
- 🧱 Mass assignment protection
- 🕵️ PII and sensitive-data redaction
- 🚦 Rate abuse and brute-force detection
- 💉 Injection detection
- 🔎 API enumeration detection
- 📊 Real-time security dashboard
- ⚡ WebSocket security events
- 🗄️ SQLite incident logging
- 🧪 Attack simulation tools
- 🐳 Docker support

---

## 🏗️ Architecture

```text
                    API Client
                        │
                        ▼
                ┌───────────────┐
                │ FastAPI Gateway│
                └───────┬───────┘
                        │
                        ▼
                Threat Detection
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        Rule Detection       ML Anomaly
              │                   │
              └─────────┬─────────┘
                        ▼
                  Risk Engine
                        │
                        ▼
                 Facie Policy
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           ALLOW      REVIEW      BLOCK
                        │
                        ▼
               Incident Logging
                        │
                        ▼
                   Dashboard
🧠 How It Works

Every API request passes through multiple security layers:

Request
   ↓
Security Rules
   ↓
ML Anomaly Detection
   ↓
Risk Score
   ↓
Facie Policy
   ↓
Security Action
   ↓
Logging + Dashboard

The system can respond with:

ALLOW
MONITOR
RATE_LIMIT
REVIEW
BLOCK
🛡️ Threat Detection

Facie Sentinel currently covers:

Threat	Protection
Injection	Suspicious payload detection
Brute Force	Repeated failed login detection
Rate Abuse	Request frequency monitoring
API Enumeration	Object access pattern analysis
BOLA / IDOR	Resource ownership validation
Mass Assignment	Unauthorized field detection
Data Exposure	PII redaction
Anomalous Behavior	ML-based detection
🤖 Facie Adaptive Policy

Facie is the adaptive policy layer of Sentinel.

It maps a security state to an appropriate action:

Security State
      ↓
Facie Policy
      ↓
ALLOW / MONITOR / RATE_LIMIT / REVIEW / BLOCK

Reviewer feedback can be used to update the policy over time.

The policy state is stored in:

facie_policy.json
🔧 Tech Stack
Backend
Python
FastAPI
Uvicorn
Pydantic
Machine Learning
Scikit-learn
Isolation Forest
Database
SQLite
Frontend
HTML
CSS
JavaScript
Deployment
Docker
Docker Compose
📁 Project Structure
Facie-Sentinel/
│
├── frontend/
├── sentinel/
│   ├── database.py
│   ├── detection.py
│   ├── facie.py
│   ├── main.py
│   ├── ml_anomaly.py
│   ├── ml_features.py
│   ├── ml_train.py
│   ├── models.py
│   ├── protection.py
│   ├── response.py
│   └── risk.py
│
├── simulator/
│   ├── normal.py
│   ├── enumeration.py
│   ├── brute_force.py
│   └── injection.py
│
├── tests/
├── requirements.txt
├── docker-compose.yml
└── README.md
🚀 Installation
1. Clone the repository
git clone https://github.com/ShivKum06/Facie-Sentinel.git
cd Facie-Sentinel
2. Create a virtual environment

Windows:

python -m venv venv
venv\Scripts\activate

Linux / macOS:

python3 -m venv venv
source venv/bin/activate
3. Install dependencies
pip install -r requirements.txt
4. Start the server
uvicorn sentinel.main:app --reload

API:

https://<your-project>.vercel.app

Swagger documentation:

https://<your-project>.vercel.app/docs
🐳 Docker

Run the application using:

docker compose up

Stop it using:

docker compose down
🧪 Attack Simulations

The project includes built-in simulators for testing Sentinel.

Normal Traffic
python simulator/normal.py
Brute Force
python simulator/brute_force.py
API Enumeration
python simulator/enumeration.py
Injection
python simulator/injection.py

These simulations allow the security system to be demonstrated without using a real external application.

## Vercel Deployment

**Live dashboard (`index.html`):** https://faciesentinel-fx6x.vercel.app/

**Main branch deployment (`index.html`):** https://faciesentinel-fx6x-git-main-sentinel-ark.vercel.app/

**Latest deployment:** https://faciesentinel-fx6x-e3kffxh7r-sentinel-ark.vercel.app/

1. Import the repo into Vercel and deploy the root project.
2. Keep the backend as the FastAPI app in `sentinel.main` via `/api/index.py`.
3. Set optional environment variables as needed:
   - `SENTINEL_MAX_BODY_BYTES=1048576`
   - `SENTINEL_DB_PATH=/tmp/sentinel.db`
   - `SENTINEL_AUDIT_LOG_PATH=/tmp/sentinel_audit.log`
   - `FACIE_STATE_FILE=/tmp/facie_policy.json`
4. The dashboard uses same-domain requests such as `/api/stats`, `/api/incidents`, `/api/events`, and `/api/facie/status`.
5. Test URLs: `https://<your-project>.vercel.app/`, `https://<your-project>.vercel.app/docs`, `https://<your-project>.vercel.app/api/stats`, and `https://<your-project>.vercel.app/api/incidents`.
6. SQLite is kept isolated and may be ephemeral on Vercel serverless instances; it is not guaranteed to persist across cold starts.
📊 Dashboard

Facie Sentinel includes a dashboard for monitoring:

API requests
Threats
Incidents
Risk scores
Security actions
Facie policy activity
Real-time events

WebSocket endpoint:

/ws/events
🧪 Testing

Run the test suite:

python -m pytest -q
🔮 Future Improvements
 Redis-based distributed tracking
 PostgreSQL support
 JWT / OAuth2 authentication
 Advanced anomaly detection
 Improved adaptive learning
 Email / Slack alerts
 Threat intelligence integration
 Kubernetes deployment
 Prometheus / Grafana monitoring
 Automated model retraining
⚠️ Project Status

Facie Sentinel is currently a security research and demonstration project.

It is designed to demonstrate concepts including:

API security
Machine learning for cybersecurity
Behavioral anomaly detection
Risk-based security decisions
Adaptive security policies
Human-in-the-loop security

It should not be considered a production-ready security gateway without additional testing, hardening, and infrastructure.

🛡️ Facie Sentinel

Detect. Analyze. Adapt. Protect.


### That's the one I'd use.

You **do not need to add anything else right now**. Later, if you have screenshots of your dashboard, we c
