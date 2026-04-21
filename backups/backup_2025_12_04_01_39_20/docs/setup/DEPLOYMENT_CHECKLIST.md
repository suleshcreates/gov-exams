# Google OAuth Deployment Checklist

Use this checklist to ensure a smooth deployment of Google OAuth authentication.

## Pre-Deployment

### Database Setup
- [ ] Run `supabase-google-oauth-schema.sql` in Supabase SQL Editor
- [ ] Verify all columns added to students table
- [ ] Verify trigger `on_auth_user_created` exists
- [ ] Verify RLS policies are active
- [ ] Test database trigger by creating a test auth user

### Google Cloud Console
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] App name and logo added
- [ ] Support email added
- [ ] Authorized domains added
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI added: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
- [ ] Client ID and Secret copied

### Supabase Configuration
- [ ] Google provider enabled in Authentication > Providers
- [ ] Client ID pasted in Supabase
- [ ] Client Secret pasted in Supabase
- [ ] Site URL set to development URL
- [ ] Redirect URL added: `http://localhost:5173/auth/callback`
- [ ] Configuration saved

### Code Verification
- [ ] All TypeScript files compile without errors
- [ ] No bcrypt imports remaining
- [ ] AuthContext uses Supabase Auth methods
- [ ] Login page shows Google button
- [ ] Signup page shows Google button
- [ ] CompleteProfile page exists
- [ ] AuthCallback page exists
- [ ] Routes added to App.tsx
- [ ] AuthErrorBoundary wraps app

## Development Testing

### New User Flow
- [ ] Navigate to `/signup`
- [ ] Click "Sign up with Google"
- [ ] Redirected to Google OAuth
- [ ] Sign in with Google account
- [ ] Redirected to `/auth/callback`
- [ ] Redirected to `/complete-profile`
- [ ] Enter username and phone
- [ ] Submit form successfully
- [ ] Redirected to home page
- [ ] User data saved in students table
- [ ] auth_user_id populated correctly

### Existing User Flow
- [ ] Navigate to `/login`
- [ ] Click "Sign in with Google"
- [ ] Redirected to Google OAuth
- [ ] Sign in with Google account
- [ ] Redirected to `/auth/callback`
- [ ] Redirected to home page (skip profile completion)
- [ ] User data loaded correctly

### Session Management
- [ ] Sign in with Google
- [ ] Refresh page - session persists
- [ ] Close browser and reopen - session persists
- [ ] Click logout - session cleared
- [ ] Redirected to login page after logout

### Error Handling
- [ ] Cancel OAuth flow - error message shown
- [ ] Network error - error message shown
- [ ] Invalid username - validation error shown
- [ ] Username taken - error message shown
- [ ] Invalid phone - validation error shown
- [ ] Error boundary catches auth errors

### UI/UX
- [ ] Loading states show during OAuth
- [ ] Smooth transitions between pages
- [ ] Progress indicator on profile completion
- [ ] Google button has correct branding
- [ ] Mobile responsive design works
- [ ] Error messages are user-friendly

## Production Deployment

### Google Cloud Console Updates
- [ ] Add production domain to authorized domains
- [ ] Add production redirect URI
- [ ] Update OAuth consent screen with production URL
- [ ] Publish OAuth consent screen (if needed)
- [ ] Remove test user restrictions (or add all users)

### Supabase Updates
- [ ] Update Site URL to production domain
- [ ] Add production redirect URL
- [ ] Verify Google provider still enabled
- [ ] Test connection from production

### Environment Variables
- [ ] VITE_SUPABASE_URL set correctly
- [ ] VITE_SUPABASE_ANON_KEY set correctly
- [ ] No sensitive data in frontend code
- [ ] Environment variables in deployment platform

### Build and Deploy
- [ ] Run `npm run build` successfully
- [ ] No build errors or warnings
- [ ] Deploy to hosting platform
- [ ] Verify deployment successful
- [ ] Check production URL loads

### Production Testing
- [ ] Test signup flow in production
- [ ] Test login flow in production
- [ ] Test session persistence in production
- [ ] Test logout in production
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Test error scenarios

### Monitoring Setup
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor Supabase Auth logs
- [ ] Set up analytics for auth events
- [ ] Create alerts for auth failures
- [ ] Document support procedures

## Post-Deployment

### User Communication
- [ ] Announce new authentication method
- [ ] Provide migration guide for existing users
- [ ] Update help documentation
- [ ] Prepare support team for questions

### Monitoring
- [ ] Check error rates daily for first week
- [ ] Monitor sign-up conversion rates
- [ ] Track profile completion rates
- [ ] Review user feedback
- [ ] Check session duration metrics

### Optimization
- [ ] Review and optimize RLS policies
- [ ] Add database indexes if needed
- [ ] Optimize loading times
- [ ] Improve error messages based on feedback
- [ ] A/B test UI improvements

## Admin Setup (Optional)

### Admin Users
- [ ] Identify admin users
- [ ] Grant admin role via SQL or dashboard
- [ ] Test admin login with Google OAuth
- [ ] Verify admin access to dashboard
- [ ] Document admin setup process

### Admin Documentation
- [ ] Share `ADMIN_GOOGLE_OAUTH_SETUP.md` with admins
- [ ] Train admins on new auth system
- [ ] Set up admin support channel

## Rollback Plan

### If Issues Occur
- [ ] Revert to previous deployment
- [ ] Notify users of temporary issue
- [ ] Investigate root cause
- [ ] Fix issues in development
- [ ] Re-test thoroughly
- [ ] Re-deploy when ready

### Data Integrity
- [ ] Verify no user data lost
- [ ] Check all existing users can still access
- [ ] Verify new users can sign up
- [ ] Confirm sessions are valid

## Success Criteria

### Metrics to Track
- [ ] Sign-up conversion rate > 80%
- [ ] Authentication success rate > 95%
- [ ] Profile completion rate > 90%
- [ ] Error rate < 5%
- [ ] Average session duration maintained
- [ ] User satisfaction score > 4/5

### User Feedback
- [ ] Collect user feedback on new auth flow
- [ ] Address common pain points
- [ ] Iterate on UI/UX improvements
- [ ] Document lessons learned

## Documentation

### Updated Documentation
- [ ] README updated with new auth info
- [ ] API documentation updated
- [ ] User guide updated
- [ ] Developer guide updated
- [ ] Troubleshooting guide updated

### Knowledge Base
- [ ] Create FAQ for Google OAuth
- [ ] Document common issues and solutions
- [ ] Create video tutorial (optional)
- [ ] Update onboarding materials

## Sign-Off

- [ ] Development team approves
- [ ] QA team approves
- [ ] Product owner approves
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Ready for production deployment

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Verified By**: _______________

**Notes**: 
_____________________________________________
_____________________________________________
_____________________________________________
