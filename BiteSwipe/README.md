# BiteSwipe

Aplicatie de tip Tinder pentru rezervari la restaurante.

## Structura proiectului

```
biteswipe/
├── backend/            # Python + FastAPI (Coleg 1)
├── database/           # SQL scripts pentru Supabase (Coleg 2)
├── frontend-client/    # PWA pentru clienti (Coleg 3)
└── frontend-restaurant/# Panou web pentru angajati restaurant (Coleg 4)
```

## Setup rapid

### 1. Baza de date (Supabase)
Ruleaza fisierele SQL in ordine din Supabase > SQL Editor:
```
database/01_schema.sql
database/02_seed.sql
database/03_rls_policies.sql
```

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env         # completeaza cu cheile din Supabase
uvicorn main:app --reload
```
API disponibil la: http://localhost:8000
Documentatie automata: http://localhost:8000/docs

### 3. Frontend
Deschide direct in browser:
- `frontend-client/index.html` — aplicatia clientului
- `frontend-restaurant/index.html` — panoul restaurantului

## Chei Supabase
Gasesti valorile in: Supabase Dashboard > Settings > API
- `https://xmtdxyqqosdimesjeykm.supabase.co` — Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGR4eXFxb3NkaW1lc2pleWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjA0MjUsImV4cCI6MjA4OTQzNjQyNX0.nv4w11hZxAFBByzMxmJzfEnQK_nY9agkl7ExQZqNHTA` — anon / public key
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdGR4eXFxb3NkaW1lc2pleWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg2MDQyNSwiZXhwIjoyMDg5NDM2NDI1fQ.HTZkqf5haoAJhp4PErPUbvI5nBFqYXC0GqB2Bj48e0A` — service_role key (doar pe backend, nu in frontend!)

## Echipa
| Modul | Responsabil |
|-------|-------------|
| Backend API | Coleg 1 |
| Baza de date | Coleg 2 |
| Frontend client (swipe) | Coleg 3 |
| Frontend restaurant (panou) | Coleg 4 |
