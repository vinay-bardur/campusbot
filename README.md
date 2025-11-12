# ClarifyAI 🎓

Intelligent campus assistant chatbot with admin dashboard for managing FAQs and announcements.

## 🏗️ Tech Stack
- **Frontend**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + Supabase + Groq AI (Llama 3.1)
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API with Llama 3.1-8B-Instant

## 🚀 Quick Start

### 1. Setup Supabase Database
1. Create a new Supabase project
2. Go to SQL Editor
3. Run `SUPABASE_SETUP.sql`

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_anon_key
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
VITE_GROQ_API_KEY=your_groq_api_key
```

### 3. Start Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access App
Open: http://localhost:5173

## ✨ Features
- 🤖 AI-powered chatbot using Groq (Llama 3.1)
- 🔐 Secure authentication (Google OAuth + Email)
- 📊 Admin dashboard for content management
- 💬 Real-time chat interface with history
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS

## 🔐 Make User Admin
After signing up, run in Supabase SQL Editor:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'your-email@example.com';
```

## 📁 Project Structure
```
clarifyai/
├── backend/              # FastAPI backend
│   ├── routers/         # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth middleware
│   └── main.py          # Entry point
├── frontend/            # Vite + React frontend
│   ├── src/
│   │   ├── pages/      # All pages
│   │   ├── components/ # UI components
│   │   └── lib/        # Utilities
│   └── .env
└── SUPABASE_SETUP.sql   # Database setup
```

## 🔗 URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📝 License
MIT
