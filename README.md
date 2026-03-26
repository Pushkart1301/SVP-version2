# Student Vacation Planner 2.0

Student Vacation Planner 2.0 is a full-stack academic assistant that helps students:

- track subject-wise attendance
- map weekly lecture schedules
- upload academic calendars for OCR + AI extraction
- generate vacation suggestions based on attendance and timetable context
- receive study-plan and attendance guidance

The project uses a Next.js frontend and a FastAPI + MongoDB backend.

## Features

- Attendance calendar with day-wise lecture marking
- Subject management with target attendance thresholds
- Weekly timetable mapping
- Dashboard with attendance analytics and progress charts
- Academic calendar upload with OCR and AI-based event extraction
- Vacation planning workflows
- Study-plan generation
- In-app attendance notifications

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Axios
- Lucide React

### Backend

- FastAPI
- Motor (MongoDB async driver)
- Pydantic / pydantic-settings
- Groq API
- pytesseract
- pdfplumber
- JWT auth

## Repository Structure

```text
svp_2_0/
├── frontend/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Shared UI components
│   ├── contexts/            # React context providers
│   └── lib/                 # API client and utilities
├── backend/
│   ├── app/
│   │   ├── core/            # Config, DB, security, engines
│   │   ├── models/          # Pydantic models
│   │   ├── routers/         # API route handlers
│   │   └── services/        # OCR, AI, notifications, planner logic
│   ├── main.py              # FastAPI entrypoint
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- Python 3.10+
- MongoDB connection string
- Groq API key
- Tesseract OCR installed on your machine if you want image OCR to work reliably

### Tesseract Note

`pytesseract` requires the Tesseract OCR binary to be installed separately.

On Windows, install Tesseract and make sure it is available in your system `PATH`.

## Environment Variables

Create a `backend/.env` file using `backend/.env.example`.

Example:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=svp_db
SECRET_KEY=change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=43200
GROQ_API_KEY=your_groq_api_key
```

Optional frontend environment variable:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

If `NEXT_PUBLIC_API_URL` is not set, the frontend already defaults to `http://127.0.0.1:8000/api/v1`.

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd svp_2_0
```

### 2. Setup the backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

#### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` from `.env.example`, then run the backend:

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

### 3. Setup the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## How to Use

After both services are running:

1. Open `http://localhost:3000`
2. Register a new account
3. Add your subjects
4. Create your weekly timetable
5. Open the attendance calendar and start marking daily attendance
6. Upload your academic calendar in the planner page
7. Use the dashboard and planner pages to review attendance and suggestions

## Main User Flow

### Auth

- Register with email + password
- Log in to receive a JWT token
- Token is stored in the browser and used for authenticated API requests

### Subjects

- Add subjects with:
  - name
  - code
  - target attendance percentage

### Timetable

- Add common or custom time slots
- Map subjects across weekdays
- Save weekly schedule

### Attendance

- Open the attendance calendar
- Click a date
- Mark each scheduled subject as present or absent
- Attendance is saved immediately

### Planner

- Upload academic calendar PDF/image
- Extract holidays and exams through OCR + AI
- Generate vacation suggestions
- Generate study plans

## API Overview

Base API prefix:

```text
/api/v1
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/me`

### Subjects

- `GET /subjects`
- `POST /subjects`
- `DELETE /subjects/{subject_id}`

### Attendance

- `GET /attendance/schedule`
- `POST /attendance/schedule`
- `POST /attendance`
- `GET /attendance/history`
- `GET /attendance/stats`
- `GET /attendance/stats/overall`
- `DELETE /attendance/clear`

### Planner

- `POST /planner/academic-calendar/upload`
- `POST /planner/recommend`
- `POST /planner/vacation/generate`
- `POST /planner/study-plan/generate`

### Notifications

- `GET /notifications`
- `PUT /notifications/{notification_id}/read`
- `PUT /notifications/read-all`

## Useful Scripts

### Frontend

```bash
npm run dev
npm run build
npm run start
```

### Backend

```bash
uvicorn main:app --reload
```

## Deployment Notes

- Frontend is suitable for Vercel-style deployment
- Backend is configured with a `Procfile` for Render/Heroku-style deployment
- Set production values for:
  - `MONGODB_URL`
  - `SECRET_KEY`
  - `GROQ_API_KEY`
- Make sure OCR dependencies are available in the deployment environment if you use image OCR

## Important Notes

- Do not commit real secrets in `.env`
- Use a strong `SECRET_KEY` in production
- Groq features require a valid API key
- OCR quality depends on input quality and Tesseract availability

## License

Add your preferred license here if you plan to make the repository public.
# SVP-version2
