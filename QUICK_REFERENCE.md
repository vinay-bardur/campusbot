# 🚀 Quick Reference Card

## 📝 Lovable Prompt Location
**File**: `LOVABLE_PROMPT.md` (in root folder)
**Action**: Copy entire content → Paste in Lovable.dev

## 🔑 Environment Variables

### Frontend `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://vzimszxjonqgdleoixvi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aW1zenhqb25xZ2RsZW9peHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDYyNTcsImV4cCI6MjA3NTc4MjI1N30.JkmYJskXmHK-xoCr7Y7yK9BbphJSKSxp7-Lb61_CItc
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAAG1UkDK8WxYaftZfv4HWoCoFsV-8zj-c
```

### Backend `.env` (Already configured)
```env
SUPABASE_URL=https://vzimszxjonqgdleoixvi.supabase.co
SUPABASE_SERVICE_KEY=<already-set>
GEMINI_API_KEY=AIzaSyAAG1UkDK8WxYaftZfv4HWoCoFsV-8zj-c
```

## ⚡ Commands

### Start Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm install          # First time only
npm run dev
```

## 🌐 URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Supabase | https://vzimszxjonqgdleoixvi.supabase.co |

## 📂 Key Files
| File | Purpose |
|------|---------|
| `LOVABLE_PROMPT.md` | 📋 Paste this in Lovable |
| `SETUP_GUIDE.md` | 📖 Detailed setup steps |
| `CHECKLIST.md` | ✅ Step-by-step checklist |
| `backend/main.py` | 🔧 Backend entry point |
| `frontend/.env.local` | 🔑 Frontend config (create this) |

## 🎯 Workflow
1. **Generate**: Use Lovable prompt → Download → Extract to `frontend/`
2. **Configure**: Create `frontend/.env.local` with variables above
3. **Install**: `cd frontend && npm install`
4. **Run Backend**: Terminal 1 → `cd backend && uvicorn main:app --reload`
5. **Run Frontend**: Terminal 2 → `cd frontend && npm run dev`
6. **Access**: Open http://localhost:3000

## 🔐 Admin Access
To make a user admin:
```sql
-- Run in Supabase SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

## 🆘 Quick Troubleshooting
| Issue | Fix |
|-------|-----|
| Port 8000 in use | Kill process or use different port |
| Port 3000 in use | Kill process or Next.js will suggest 3001 |
| CORS error | Backend already configured for localhost:3000 |
| Auth error | Check Supabase credentials in .env.local |
| No AI response | Verify Gemini API key is correct |

## 📱 Test Checklist
- [ ] Landing page loads
- [ ] Can sign up/login
- [ ] Chat interface works
- [ ] AI responds to messages
- [ ] Admin dashboard accessible (if admin)

---
**Status**: ✅ Backend Ready | ⏳ Frontend: Import from Lovable
