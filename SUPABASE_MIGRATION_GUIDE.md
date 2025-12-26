# Supabase Migration Guide

## 🔄 Switching from localStorage to Supabase

This guide will help you migrate from the current localStorage implementation back to Supabase.

---

## 📋 Prerequisites

### 1. Create New Supabase Project
1. Go to https://supabase.com
2. Sign in / Create account
3. Click "New Project"
4. Fill in:
   - **Name**: ClarifyAI (or any name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 2. Get Your Credentials
After project is created:
1. Go to **Project Settings** (gear icon)
2. Click **API** in sidebar
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (different long string)

---

## 🗄️ Database Setup

### 1. Run SQL Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire content from `SUPABASE_SETUP.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Verify tables are created: Go to **Table Editor** and check for:
   - `faqs`
   - `announcements`
   - `conversations`
   - `chat_messages`
   - `user_roles`

---

## ⚙️ Configuration Changes

### Backend Configuration

**File**: `backend/.env`

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_anon_key_here

# Groq AI (keep existing)
GROQ_API_KEY=your_existing_groq_key
```

### Frontend Configuration

**File**: `frontend/.env`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API (keep existing)
VITE_API_URL=http://localhost:8000

# Groq AI (keep existing)
VITE_GROQ_API_KEY=your_existing_groq_key
```

---

## 🔐 Authentication Setup

### Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable email confirmations (optional)
   - ✅ Enable email change confirmations
   - Set **Site URL**: `http://localhost:5173`

### Enable Google OAuth (Optional)
1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Enable it
4. Add Google OAuth credentials:
   - Get from: https://console.cloud.google.com/apis/credentials
   - Add **Authorized redirect URIs**: 
     - `https://your-project-id.supabase.co/auth/v1/callback`
5. Save

---

## 📝 Code Changes Required

### 1. AuthContext.tsx
**File**: `frontend/src/contexts/AuthContext.tsx`

Replace the entire `useEffect` with:

```typescript
useEffect(() => {
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    }
  );

  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      checkAdminStatus(session.user.id);
    }
    
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);

const checkAdminStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(!!data);
  } catch (error) {
    console.error("Error in checkAdminStatus:", error);
    setIsAdmin(false);
  }
};
```

Add import back:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

### 2. Auth.tsx (Login Page)
**File**: `frontend/src/pages/Auth.tsx`

Replace `handleSignIn`:
```typescript
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    toast.error("Please enter email and password");
    return;
  }

  setLoading(true);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully!");
    navigate("/chat");
  } catch (error) {
    toast.error("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
```

Replace `handleSignUp`:
```typescript
const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    toast.error("Please enter email and password");
    return;
  }

  setLoading(true);

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/chat`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created! Check your email to verify.");
    setEmail("");
    setPassword("");
  } catch (error) {
    toast.error("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
```

Replace `handleGoogleSignIn`:
```typescript
const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/chat`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  } catch (error) {
    toast.error("Failed to sign in with Google");
  } finally {
    setLoading(false);
  }
};
```

Add import:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

### 3. Chat.tsx
**File**: `frontend/src/pages/Chat.tsx`

Replace imports:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

Replace `createNewConversation`:
```typescript
const createNewConversation = async () => {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "New Chat" })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    toast.error("Failed to create conversation");
    return null;
  }
};
```

Replace `saveMessage`:
```typescript
const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
  try {
    await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      });
  } catch (error) {
    console.error("Error saving message:", error);
  }
};
```

Replace `updateConversationTitle`:
```typescript
const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
  try {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (error) {
    console.error("Error updating title:", error);
  }
};
```

Replace `handleSelectConversation`:
```typescript
const handleSelectConversation = async (conversationId: string) => {
  setCurrentConversationId(conversationId);
  setIsLoading(true);

  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at");

    if (error) throw error;
    setMessages((data || []) as Message[]);
  } catch (error) {
    console.error("Error loading messages:", error);
    toast.error("Failed to load conversation");
  } finally {
    setIsLoading(false);
  }
};
```

Update `handleSend` to use `await` for async functions.

### 4. ChatSidebar.tsx
**File**: `frontend/src/components/chat/ChatSidebar.tsx`

Add import:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

Replace `loadConversations`:
```typescript
const loadConversations = async () => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    setConversations(data || []);
  } catch (error) {
    console.error("Error loading conversations:", error);
  }
};
```

Replace `handleSignOut`:
```typescript
const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success("Signed out successfully");
    navigate("/");
  } catch (error) {
    toast.error("Failed to sign out");
  }
};
```

Update `useEffect`:
```typescript
useEffect(() => {
  if (user) {
    loadConversations();
  }
}, [user]);
```

### 5. Admin.tsx
**File**: `frontend/src/pages/Admin.tsx`

Add import:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

Replace `loadData`:
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    const [faqsResult, announcementsResult] = await Promise.all([
      supabase.from("faqs").select("*").order("created_at", { ascending: false }),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    ]);

    if (faqsResult.error) throw faqsResult.error;
    if (announcementsResult.error) throw announcementsResult.error;

    setFaqs(faqsResult.data || []);
    setAnnouncements(announcementsResult.data || []);
  } catch (error) {
    console.error("Error loading data:", error);
    toast.error("Failed to load admin data");
  } finally {
    setLoading(false);
  }
};
```

Replace all CRUD functions with Supabase calls (refer to the original Admin.tsx before localStorage changes).

---

## 🔧 Make Admin User

After signing up with your email, run this SQL in Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'vinay.g.b@gmail.com';
```

---

## ✅ Testing Checklist

- [ ] Backend connects to Supabase (check logs)
- [ ] Sign up with email works
- [ ] Sign in with email works
- [ ] Google OAuth works (if enabled)
- [ ] Chat messages save to database
- [ ] Conversations load from database
- [ ] Admin can access admin dashboard
- [ ] Admin can add/delete FAQs
- [ ] Admin can add/delete announcements
- [ ] Regular users cannot access admin

---

## 🚀 Restart Services

After making all changes:

```bash
# Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## 📌 Important Notes

1. **localStorage data will be lost** when switching to Supabase
2. **Backup any important conversations** before switching
3. **Test with a new email first** before using your main account
4. **Keep the localStorage version** in a separate git branch if needed

---

## 🆘 Troubleshooting

### "Failed to fetch" errors
- Check `.env` files have correct Supabase URL and keys
- Verify Supabase project is active (not paused)
- Check browser console for CORS errors

### Authentication not working
- Verify email provider is enabled in Supabase
- Check Site URL is set correctly
- Clear browser cache and localStorage

### Admin access not working
- Run the SQL query to add admin role
- Check `user_roles` table has your user_id
- Verify email matches exactly

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console (F12)
3. Check backend terminal for errors
4. Verify all environment variables are set correctly
