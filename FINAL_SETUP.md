# 🎉 FINAL SETUP - You're Almost There!

## ✅ What's Already Done
- ✅ Backend fully configured
- ✅ Frontend cloned and configured
- ✅ Dependencies installed
- ✅ Environment variables set

## 🚀 3 Steps to Launch

### Step 1: Setup Supabase Database (5 minutes)
1. Go to: https://supabase.com/dashboard/project/vzimszxjonqgdleoixvi/sql
2. Open file: `SUPABASE_SETUP.sql` (in root folder)
3. Copy ALL the SQL code
4. Paste in Supabase SQL Editor
5. Click "Run" button
6. ✅ Database tables created!

### Step 2: Start Backend (1 minute)
Open Terminal 1:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

Wait for: `Application startup complete`

### Step 3: Start Frontend (1 minute)
Open Terminal 2:
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## 🌐 Access Your App
Open browser: **http://localhost:5173**

## 🎯 Test Everything

### 1. Landing Page ✅
- Should see beautiful landing page
- Click "Get Started" button

### 2. Sign Up ✅
- Create account with email
- Or use Google OAuth
- Should redirect to chat page

### 3. Chat Interface ✅
- Type a message
- AI should respond
- Messages saved automatically

### 4. Make Yourself Admin (Optional)
Go to Supabase SQL Editor and run:
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'your-email@example.com';
```

Then access: http://localhost:5173/admin

## 📊 URLs Reference
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Supabase Dashboard | https://supabase.com/dashboard/project/vzimszxjonqgdleoixvi |

## 🎨 Features to Test
- [ ] Landing page loads
- [ ] Sign up with email
- [ ] Login with Google
- [ ] Send chat messages
- [ ] View chat history
- [ ] Click "View FAQs" button
- [ ] Click "Latest Announcements" button
- [ ] Access profile page
- [ ] Access admin dashboard (if admin)
- [ ] Create/Edit/Delete FAQs (if admin)
- [ ] Create/Edit/Delete Announcements (if admin)

## 🐛 Quick Troubleshooting

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### Can't login
- Check Supabase dashboard is accessible
- Verify .env file has correct credentials
- Try clearing browser cache

### Chat not working
- Check backend is running (http://localhost:8000/docs)
- Check browser console for errors (F12)
- Verify Gemini API key is correct

### Database errors
- Make sure you ran SUPABASE_SETUP.sql
- Check tables exist in Supabase dashboard

## 📁 Project Structure
```
campus-chatbot/
├── backend/              # FastAPI backend
│   ├── main.py          # ✅ Running on :8000
│   └── .env             # ✅ Configured
│
├── frontend/            # Vite + React frontend
│   ├── src/            # ✅ All components ready
│   └── .env            # ✅ Configured
│
├── SUPABASE_SETUP.sql  # 👈 RUN THIS FIRST!
├── FINAL_SETUP.md      # 👈 YOU ARE HERE
└── INTEGRATION_COMPLETE.md
```

## 🎊 Success Checklist
- [ ] Ran SUPABASE_SETUP.sql in Supabase
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can access landing page
- [ ] Can sign up/login
- [ ] Can chat with AI
- [ ] Chat history saves
- [ ] (Optional) Admin access works

## 🆘 Need Help?
1. Check backend logs in Terminal 1
2. Check frontend logs in Terminal 2
3. Check browser console (F12)
4. Review INTEGRATION_COMPLETE.md for details

## 🎉 You're Done!
Once all 3 steps are complete, you have a fully functional AI-powered campus chatbot! 🚀

---

**Next Action**: Run `SUPABASE_SETUP.sql` in Supabase SQL Editor, then start both services!
