# 🔑 Test Your Gemini API Key

## Current Key in .env:
```
VITE_GEMINI_API_KEY=AIzaSyA8PJwd6hJTIZYWQgC-2yTDvYhGvAQIZIc
```

## How to Get a Valid Key:

### Option 1: Get New Free API Key
1. Go to: https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the new key
4. Replace in `frontend/.env`

### Option 2: Check Existing Key
1. Go to: https://aistudio.google.com/apikey
2. Check if your key is listed
3. If not, create a new one

## Update .env File:
```env
VITE_SUPABASE_URL=https://qnlwpvytwzsroifggkez.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubHdwdnl0d3pzcm9pZmdna2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjA2NjcsImV4cCI6MjA3ODMzNjY2N30.IorvUytFK8YLQ3M5PbJyyQbp7oJo5QvF1wvNkUdUYzE
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=YOUR_NEW_KEY_HERE
```

## After Updating:
1. Save the file
2. Restart frontend: `npm run dev`
3. Refresh browser
4. Try chatting again

## What I Changed:
- ✅ Updated to use **Gemini 2.0 Flash** (free tier, faster)
- ✅ Better error handling for invalid keys
- ✅ Increased token limit to 2000
- ✅ Fixed system instruction implementation

## Test the Key:
Once you update the key, try asking:
- "Hello, how are you?"
- "What are the library hours?"

If it works, you'll see a response streaming in!
