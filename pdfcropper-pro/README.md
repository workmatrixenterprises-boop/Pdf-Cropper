# PDF Cropper Pro (Ecommerce Label Tools)

Includes:
- Ecommerce label crop tools (preset crop)
- Manual Crop tool (draw rectangle on page 1 -> crop all pages)
- PDF Merge
- ReArrange PDF
- Amazon FNSKU label generator (barcode + optional price -> 4x6 PDF)

Tech:
- Frontend: Next.js (App Router) + Tailwind
- Backend: FastAPI + PyMuPDF
- Optional: Docker Compose + Nginx

## Quickstart (Local, without Docker)

### 1) Backend
```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# CMD:
# .venv\Scripts\activate.bat

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs on: http://localhost:8000

### 2) Frontend
Open a new terminal:
```bash
cd frontend
npm install
# Set API base (Windows PowerShell)
$env:NEXT_PUBLIC_API_BASE="http://localhost:8000"
npm run dev
```

Frontend runs on: http://localhost:3000

## Docker (Production-style)
```bash
docker compose up --build
```
Then open: http://localhost

---

### Notes
- Presets are in `backend/presets.py` (ratios of the page).
- The Meesho preset keeps top 50% of the page by default. Tune if needed.
