# Design Document: Google OAuth Authentication

## Overview

This design document outlines the implementation of Google OAuth authentication to replace the existing custom email/password authentication system. The solution leverages Supabase's built-in OAuth provider support to simplify authentication while maintaining all existing user profile functionality. The design focuses on minimal code changes, seamless user experience, and proper session management.

## Architecture

### High-Level Flow

```
User clicks "Sign in with Google"
    ↓
Supabase Auth initiates OAuth flow
    ↓
User authenticates with Google
    ↓
Google redirects back with auth code
    ↓
Supabase exchanges code for tokens
    ↓
Check if user exists in students table
    ↓
    ├─→ Exists: Load profile & redirect to home
    └─→ New: Create student record & redirect to profile completion
```

### Component Architecture

1. **AuthContext** - Central authentication state management
2. **Supabase Auth** - OAuth provider integration and session management
3. **Login/Signup Pages** - UI for Google sign-in button
4. **ProfileCompletion Page** - Collect additional user info (username, phone)
5. **Database Trigger** - Auto-create student record on new auth user

## Components and Interfaces

### 1. Updated AuthContext

**Purpose**: Manage authentication state using Supabase Auth instead of custom logic

**Key Changes**:
- Remove custom login/signup functions
- Remove bcrypt password hashing
- Add Google OAuth sign-in method
- Use Supabase session management
- Listen to auth state changes

**Interface**:
```typescript
interface User {
  id: string;           // Supabase auth.users.id
  email: string;
  username: string | null;
  name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
  };
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
}

interface ProfileUpdateData {
  username: string;
  phone: string;
}
```

**Implementation Details**:
```typescript
// Initialize auth state from Supabase session
useEffect(() => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadUserProfile(session.user.id);
    }
  });

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);

// Load user profile from students table
const loadUserProfile = async (authUserId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
  
  if (data) {
    setUser({
      id: authUserId,
      email: data.email,
      username: data.username,
      name: data.name,
      phone: data.phone,
      avatar_url: data.avatar_url
    });
  }
};
```

### 2. Google OAuth Sign-In Method

**Implementation**:
```typescript
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
};
```

**Redirect Flow**:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. User approves
4. Google redirects to `/auth/callback`
5. Supabase processes the callback
6. App checks if profile is complete
7. Redirects to home or profile completion

### 3. Updated Login Page

**Changes**:
- Remove email/password form
- Add prominent "Sign in with Google" button
- Add Google branding (logo, colors)
- Show loading state during OAuth flow
- Display error messages if OAuth fails

**UI Design**:
```tsx
<button
  onClick={handleGoogleSignIn}
  disabled={loading}
  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
>
  <img src="/google-logo.svg" alt="Google" className="w-6 h-6" />
  {loading ? 'Signing in...' : 'Sign in with Google'}
</button>
```

### 4. Updated Signup Page

**Changes**:
- Remove registration form
- Add "Sign up with Google" button
- Explain that additional info will be collected after Google sign-in
- Same visual design as Login page

### 5. Profile Completion Page

**Purpose**: Collect username and phone number for new Google OAuth users

**Route**: `/complete-profile`

**When Shown**:
- After successful Google OAuth sign-in
- Only if username or phone is missing from student record

**Form Fields**:
- Username (required, unique, 3+ chars, alphanumeric + underscore)
- Phone (required, 10 digits)

**Validation**:
- Check username uniqueness against students table
- Validate phone format
- Show real-time validation feedback

**Implementation**:
```tsx
const CompleteProfile = () => {
  const { auth, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: ''
  });

  // Redirect if profile already complete
  useEffect(() => {
    if (auth.user?.username && auth.user?.phone) {
      navigate('/');
    }
  }, [auth.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    navigate('/');
  };

  return (
    // Form UI
  );
};
```

### 6. Auth Callback Handler

**Route**: `/auth/callback`

**Purpose**: Handle OAuth redirect and determine next step

**Implementation**:
```tsx
const AuthCallback = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loading) return;

    if (auth.isAuthenticated) {
      // Check if profile is complete
      if (!auth.user?.username || !auth.user?.phone) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [auth]);

  return <div>Loading...</div>;
};
```

## Data Models

### Updated Students Table Schema

**Changes**:
- Add `auth_user_id` column (UUID, unique, references auth.users)
- Make `password_hash` nullable (for backward compatibility)
- Make `username` nullable initially (set during profile completion)
- Make `phone` nullable initially (set during profile completion)
- Add `avatar_url` for Google profile picture
- Keep `email_verified` (set to true for Google OAuth users)

**Schema**:
```sql
ALTER TABLE students
ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN avatar_url TEXT,
ALTER COLUMN password_hash DROP NOT NULL,
ALTER COLUMN username DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_students_auth_user_id ON students(auth_user_id);
```

### Database Trigger for Auto-Creation

**Purpose**: Automatically create student record when new user signs up via Google OAuth

**Implementation**:
```sql
-- Function to create student record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (
    auth_user_id,
    email,
    name,
    avatar_url,
    email_verified,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    true,
    false  -- Will be set to true after profile completion
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Error Handling

### OAuth Errors

**Scenarios**:
1. User cancels Google OAuth flow
2. Google OAuth service is down
3. Network error during OAuth
4. Invalid OAuth configuration

**Handling**:
```typescript
try {
  await signInWithGoogle();
} catch (error) {
  if (error.message.includes('popup_closed')) {
    setError('Sign-in was cancelled. Please try again.');
  } else if (error.message.includes('network')) {
    setError('Network error. Please check your connection.');
  } else {
    setError('Failed to sign in with Google. Please try again.');
  }
}
```

### Profile Completion Errors

**Scenarios**:
1. Username already taken
2. Invalid phone format
3. Database update fails

**Handling**:
- Show inline validation errors
- Prevent form submission until valid
- Display server errors clearly
- Allow retry without losing data

### Session Errors

**Scenarios**:
1. Session expires
2. Invalid session token
3. User deleted from database

**Handling**:
```typescript
// In AuthContext
const { data: { session }, error } = await supabase.auth.getSession();

if (error || !session) {
  // Clear local state
  setUser(null);
  // Redirect to login if on protected route
  if (isProtectedRoute()) {
    navigate('/login');
  }
}
```

## Testing Strategy

### Unit Tests

1. **AuthContext Tests**
   - Test signInWithGoogle initiates OAuth flow
   - Test session restoration on mount
   - Test auth state change listener
   - Test signOut clears session
   - Test updateProfile updates student record

2. **Profile Completion Tests**
   - Test form validation
   - Test username uniqueness check
   - Test phone format validation
   - Test successful profile update

### Integration Tests

1. **OAuth Flow Test**
   - Mock Google OAuth response
   - Verify student record creation
   - Verify redirect to profile completion
   - Verify redirect to home after completion

2. **Session Management Test**
   - Test session persistence across page reloads
   - Test session expiration handling
   - Test logout clears session

### Manual Testing Checklist

- [ ] Google OAuth sign-in works in development
- [ ] Google OAuth sign-in works in production
- [ ] New user creates student record
- [ ] Existing user logs in successfully
- [ ] Profile completion saves data
- [ ] Session persists across page reloads
- [ ] Logout clears session
- [ ] Error messages display correctly
- [ ] Loading states show during OAuth
- [ ] Mobile responsive design works

## Configuration Requirements

### Supabase Dashboard Setup

1. **Enable Google OAuth Provider**
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Add Google Client ID
   - Add Google Client Secret

2. **Configure Redirect URLs**
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

3. **Update Site URL**
   - Set to production domain

### Google Cloud Console Setup

1. **Create OAuth 2.0 Credentials**
   - Go to Google Cloud Console
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`

2. **Configure OAuth Consent Screen**
   - Add app name, logo, support email
   - Add scopes: email, profile
   - Add test users (for development)

### Environment Variables

No new environment variables needed. Existing Supabase URL and anon key are sufficient.

## Migration Strategy

### Phase 1: Add Google OAuth (Non-Breaking)
- Add auth_user_id column to students table
- Create database trigger for auto-creation
- Update AuthContext to support both methods
- Add Google sign-in buttons alongside existing forms
- Test thoroughly

### Phase 2: Deprecate Custom Auth
- Remove password fields from UI
- Keep custom auth logic for existing users
- Show migration prompt to existing users
- Provide "Link Google Account" feature

### Phase 3: Remove Custom Auth (Optional)
- Remove bcrypt dependency
- Remove custom login/signup functions
- Remove password_hash column
- Clean up unused code

**Recommendation**: Start with Phase 1 only. Keep custom auth as fallback for existing users.

## Security Considerations

1. **OAuth Token Security**
   - Tokens stored securely by Supabase
   - Auto-refresh handled by Supabase client
   - HTTPS required in production

2. **Session Security**
   - Session stored in httpOnly cookies (Supabase default)
   - CSRF protection via Supabase
   - Session expiration after inactivity

3. **Profile Completion**
   - Validate all user inputs server-side
   - Prevent SQL injection via parameterized queries
   - Rate limit profile update requests

4. **Database Security**
   - RLS policies on students table
   - Users can only update their own profile
   - Admin role for admin operations

## Performance Considerations

1. **OAuth Redirect Speed**
   - Minimal - handled by Google and Supabase
   - No additional API calls needed

2. **Session Restoration**
   - Single query to load user profile
   - Cached in React state
   - No repeated database calls

3. **Profile Completion**
   - Single database update
   - Username uniqueness check optimized with index

## Rollback Plan

If issues arise:

1. **Immediate Rollback**
   - Revert AuthContext changes
   - Restore custom login/signup functions
   - Hide Google sign-in buttons

2. **Data Integrity**
   - Keep auth_user_id column (nullable)
   - Keep password_hash column
   - No data loss for existing users

3. **User Communication**
   - Notify users of temporary issue
   - Provide alternative login method
   - Set timeline for fix
