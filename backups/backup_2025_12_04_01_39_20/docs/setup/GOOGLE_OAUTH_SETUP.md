# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication for your exam portal application using Supabase.

## Prerequisites

- Supabase project created
- Google Cloud Console account
- Database schema updated (run `supabase-google-oauth-schema.sql`)

## Part 1: Google Cloud Console Setup

### Step 1: Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Either select an existing project or click "New Project"
4. If creating new:
   - Enter project name (e.g., "Exam Portal")
   - Click "Create"

### Step 2: Enable Required APIs

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google People API"
3. Click on it and click **Enable**
4. Wait for the API to be enabled

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have Google Workspace)
3. Click **Create**

4. Fill in the required information:
   - **App name**: Your app name (e.g., "Exam Portal")
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **Application home page**: Your production URL
   - **Authorized domains**: Add your domain (e.g., `yourdomain.com`)
   - **Developer contact information**: Your email address

5. Click **Save and Continue**

6. On the **Scopes** page:
   - Click **Add or Remove Scopes**
   - Select these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click **Update**
   - Click **Save and Continue**

7. On the **Test users** page (for development):
   - Click **Add Users**
   - Add email addresses of users who can test the app
   - Click **Save and Continue**

8. Review the summary and click **Back to Dashboard**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Application type**: **Web application**
4. Enter a name (e.g., "Exam Portal Web Client")

5. Add **Authorized JavaScript origins**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

6. Add **Authorized redirect URIs**:
   - Get your Supabase project URL from your Supabase dashboard
   - Add: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

7. Click **Create**

8. **IMPORTANT**: Copy the **Client ID** and **Client Secret**
   - You'll need these for Supabase configuration
   - Store them securely

## Part 2: Supabase Configuration

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase-google-oauth-schema.sql`
5. Click **Run** to execute the migration
6. Verify success (should see "Success. No rows returned")

### Step 2: Enable Google OAuth Provider

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list of providers
3. Toggle it to **Enabled**

4. Fill in the configuration:
   - **Client ID**: Paste the Client ID from Google Cloud Console
   - **Client Secret**: Paste the Client Secret from Google Cloud Console
   - **Redirect URL**: This is auto-filled by Supabase
     - Should be: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

5. Click **Save**

### Step 3: Configure Site URL

1. In Supabase dashboard, go to **Authentication** > **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

3. Add **Redirect URLs** (allowed redirect destinations after auth):
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

4. Click **Save**

### Step 4: Verify Configuration

1. Go to **Authentication** > **Providers**
2. Verify Google is **Enabled** with a green checkmark
3. Click on Google to verify Client ID and Secret are saved

## Part 3: Application Configuration

### Step 1: Verify Environment Variables

Your `.env` file should already have:

```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

No additional environment variables are needed for Google OAuth.

### Step 2: Update Redirect URLs for Production

When deploying to production:

1. Update Google Cloud Console:
   - Go to **Credentials** > Your OAuth Client
   - Add production domain to **Authorized JavaScript origins**
   - Verify redirect URI includes your Supabase URL

2. Update Supabase:
   - Go to **Authentication** > **URL Configuration**
   - Update **Site URL** to production domain
   - Add production callback URL to **Redirect URLs**

## Testing the Setup

### Development Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign in with Google"
4. You should be redirected to Google's consent screen
5. Sign in with a test user (if in testing mode)
6. You should be redirected back to your app
7. Check that a student record was created in the database

### Troubleshooting

#### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI in your request doesn't match what's configured in Google Cloud Console.

**Solution**:
- Verify the redirect URI in Google Cloud Console matches exactly: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Check for trailing slashes or typos
- Wait a few minutes after making changes (can take time to propagate)

#### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen not properly configured.

**Solution**:
- Complete all required fields in OAuth consent screen
- Add your email as a test user
- Ensure required scopes are added (email, profile)

#### Error: "Invalid client"

**Cause**: Client ID or Client Secret is incorrect.

**Solution**:
- Double-check the Client ID and Secret in Supabase match Google Cloud Console
- Regenerate credentials if needed
- Ensure no extra spaces when copying/pasting

#### User signs in but no student record created

**Cause**: Database trigger not working or RLS policies blocking insert.

**Solution**:
- Verify the trigger was created: Check in Supabase SQL Editor
- Check Supabase logs for errors
- Temporarily disable RLS to test: `ALTER TABLE students DISABLE ROW LEVEL SECURITY;`
- Re-enable after testing: `ALTER TABLE students ENABLE ROW LEVEL SECURITY;`

#### Session not persisting

**Cause**: Cookie settings or Site URL misconfiguration.

**Solution**:
- Verify Site URL in Supabase matches your app's URL exactly
- Check browser console for cookie errors
- Ensure you're using HTTPS in production
- Clear browser cookies and try again

## Security Checklist

- [ ] Client Secret is stored only in Supabase (never in frontend code)
- [ ] Site URL is set correctly in Supabase
- [ ] Redirect URLs are whitelisted in both Google and Supabase
- [ ] OAuth consent screen is properly configured
- [ ] RLS policies are enabled on students table
- [ ] HTTPS is used in production
- [ ] Test users are added for development testing

## Production Deployment Checklist

Before going live:

- [ ] Update OAuth consent screen to "Published" status (if needed)
- [ ] Remove test user restrictions (or add all users)
- [ ] Update Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Test OAuth flow in production environment
- [ ] Monitor Supabase logs for any errors
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Test session persistence
- [ ] Test logout functionality
- [ ] Verify RLS policies are working

## Support Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Discord Community](https://discord.supabase.com/)

## Next Steps

After completing this setup:

1. Test the authentication flow in development
2. Implement the Profile Completion page
3. Update your Login and Signup pages with Google OAuth buttons
4. Test thoroughly before deploying to production
