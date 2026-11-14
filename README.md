# Rasheed FieldShift

> **“Your data. Your land. Smarter farming decisions.”**

A decision-support web application combining NASA Earth-observation datasets with locally validated agronomic knowledge to assist smallholder rain-fed farmers.

Developed for the **NASA Space Apps Challenge 2026** under the challenge: **“Field Shift: Adapting Farms with NASA Data.”**

---

## Initial Focus
- **Region**: Azare, Bauchi State, Nigeria (`11.6765° N, 10.1911° E`)
- **Farming System**: Rain-fed agriculture
- **Primary Crops under Investigation**: Millet (baseline), Sorghum, Cowpea, Groundnut, Maize, Rice, Sesame

---

## Architecture Overview

- **Frontend**: Next.js (React, TypeScript, Tailwind CSS)
- **Backend**: Python FastAPI service (Pandas, NumPy, Requests)
- **Data Pipeline**: NASA POWER Daily API (`PRECTOTCORR`, `T2M`, `GWETROOT`), with modular hooks for SMAP and IMERG.

---

## Directory Structure

```text
Rasheed-FieldShift/
├── frontend/                  # Next.js web application
├── backend/                   # Python FastAPI service
│   ├── app/
│   │   ├── main.py
│   │   ├── api/               # API route definitions
│   │   ├── core/              # Settings and configuration
│   │   └── services/          # NASA data retrieval and scenario models
│   ├── requirements.txt
│   └── .env.example
├── data/                      # Fixtures and offline fallback datasets
├── docs/                      # Research notes, agronomy data dictionary
├── .gitignore
└── README.md
```

---

## Quickstart

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

