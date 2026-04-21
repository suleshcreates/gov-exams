# Quick Start: Google OAuth Authentication

## 🚀 Get Started in 5 Steps

### Step 1: Run Database Migration (5 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-google-oauth-schema.sql`
5. Click **Run**
6. Verify success message

### Step 2: Set Up Google OAuth (10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** > **OAuth consent screen**
4. Fill in app name, email, and authorized domains
5. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
6. Select **Web application**
7. Add authorized redirect URI:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
8. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Supabase (3 minutes)

1. Open your Supabase Dashboard
2. Go to **Authentication** > **Providers**
3. Find **Google** and toggle it **Enabled**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**
6. Go to **Authentication** > **URL Configuration**
7. Set **Site URL** to your app URL (e.g., `http://localhost:5173`)
8. Add redirect URL: `http://localhost:5173/auth/callback`

### Step 4: Test the Flow (5 minutes)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login`

3. Click **"Sign in with Google"**

4. Sign in with your Google account

5. Complete your profile with username and phone

6. Verify you're redirected to the home page

### Step 5: Verify Everything Works

- [ ] Can sign up with Google
- [ ] Can complete profile
- [ ] Can sign in with Google
- [ ] Session persists after page refresh
- [ ] Can sign out successfully

## 🎉 You're Done!

Your app now uses Google OAuth for authentication!

## 📚 Need More Details?

- **Full Setup Guide**: See `GOOGLE_OAUTH_SETUP.md`
- **Implementation Details**: See `GOOGLE_OAUTH_IMPLEMENTATION_SUMMARY.md`
- **Admin Setup**: See `ADMIN_GOOGLE_OAUTH_SETUP.md`

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error

**Fix**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

### "Access blocked" Error

**Fix**: Add your email as a test user in Google Cloud Console OAuth consent screen

### Session Not Persisting

**Fix**: Check that Site URL in Supabase matches your app URL exactly

### Can't Complete Profile

**Fix**: Make sure the database migration ran successfully

## 🔒 Security Checklist

- [ ] HTTPS enabled in production
- [ ] Site URL configured correctly
- [ ] Redirect URLs whitelisted
- [ ] RLS policies enabled
- [ ] Client Secret stored only in Supabase (not in code)

## 📞 Need Help?

Check the troubleshooting section in `GOOGLE_OAUTH_SETUP.md` for detailed solutions.
