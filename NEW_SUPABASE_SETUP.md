# 🆕 Setting Up with NEW Supabase Project

## Step 1: Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details and create
4. Wait for project to be ready (~2 minutes)

## Step 2: Get Your New Credentials
From your new Supabase project settings:
- **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
- **Anon/Public Key**: `eyJhbGc...` (long string)

## Step 3: Update Environment Files

### Backend `.env`
```env
SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
SUPABASE_SERVICE_KEY=YOUR_NEW_ANON_KEY
SUPABASE_JWT_SECRET=YOUR_NEW_ANON_KEY
GEMINI_API_KEY=AIzaSyAAG1UkDK8WxYaftZfv4HWoCoFsV-8zj-c
```

### Frontend `.env`
```env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=AIzaSyAAG1UkDK8WxYaftZfv4HWoCoFsV-8zj-c
```

## Step 4: Run Database Setup
1. Go to your new Supabase project SQL Editor
2. Copy all SQL from `SUPABASE_SETUP.sql`
3. Paste and run

## Step 5: Configure Google OAuth (Optional)
1. In Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Add redirect URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

## Step 6: Start Services
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## ✅ What's Left After This?

### Nothing! The app is fully routed and ready:

**Frontend Routes (Already Configured):**
- `/` - Landing page
- `/auth` - Login/Signup
- `/chat` - Chat interface (protected)
- `/admin` - Admin dashboard (protected, admin only)
- `/profile` - User profile (protected)

**Backend Routes (Already Configured):**
- `GET /api/v1/faqs` - Get FAQs
- `POST /api/v1/faqs` - Create FAQ (admin)
- `GET /api/v1/announcements` - Get announcements
- `POST /api/v1/announcements` - Create announcement (admin)
- `POST /api/v1/chat-logs` - Save chat (not used by frontend currently)

### The Frontend Already Has:
✅ React Router configured
✅ Protected routes with auth checks
✅ Admin route guards
✅ Supabase auth integration
✅ All pages built and styled
✅ API integration ready

### The Backend Already Has:
✅ All API endpoints
✅ CORS configured for localhost:5173
✅ JWT authentication middleware
✅ Role-based access control

## 🎯 After Setup, You Can:
1. Sign up with email or Google
2. Chat with AI immediately
3. View FAQs and announcements
4. Make yourself admin (see below)
5. Access admin dashboard

## 🔐 Make Yourself Admin
After signing up, run this in Supabase SQL Editor:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'your-email@example.com';
```

## 🚀 That's It!
No routing work needed - everything is already wired up and ready to go!

The only changes needed were the environment variables, which you'll update in Step 3.
