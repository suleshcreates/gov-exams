# Design Document: Email Authentication System

## Overview

This design implements a complete email-based authentication system using Supabase Auth, replacing the phone-based system. Users can register with email and username, verify their email via a link, and login using either email or username.

## Architecture

### System Flow

```
User Registration
    ↓
Enter: Name, Username, Email, Password
    ↓
Validate Username (unique, format)
    ↓
Validate Email (unique, format)
    ↓
Create Supabase Auth User
    ↓
Send Verification Email (Supabase)
    ↓
User Clicks Verification Link
    ↓
Supabase Verifies Email
    ↓
Sync to Students Table
    ↓
Redirect to Login
    ↓
Login with Email/Username + Password
    ↓
Session Created
```

### Component Architecture

```
src/
├── lib/
│   ├── supabase.ts (UPDATED - Auth config)
│   ├── supabaseService.ts (UPDATED - new methods)
│   ├── usernameValidation.ts (NEW)
│   └── emailService.ts (NEW)
├── pages/
│   ├── Signup.tsx (UPDATED - email/username)
│   ├── Login.tsx (UPDATED - email/username login)
│   ├── VerifyEmail.tsx (NEW - verification page)
│   └── ForgotPassword.tsx (NEW)
├── context/
│   └── AuthContext.tsx (UPDATED - Supabase Auth)
└── App.tsx (UPDATED - new routes)
```

## Data Models

### Updated Students Table Schema

```sql
-- Update students table to use email and username
ALTER TABLE students 
  DROP COLUMN phone,
  ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL,
  ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL,
  ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Update indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_username ON students(username);
CREATE INDEX idx_students_auth_user_id ON students(auth_user_id);

-- Update foreign keys in other tables
ALTER TABLE exam_results 
  DROP COLUMN student_phone,
  ADD COLUMN student_email VARCHAR(255) REFERENCES students(email);

ALTER TABLE exam_progress
  DROP COLUMN student_phone,
  ADD COLUMN student_email VARCHAR(255) REFERENCES students(email);

ALTER TABLE user_plans
  DROP COLUMN student_phone,
  ADD COLUMN student_email VARCHAR(255) REFERENCES students(email);
```

### Student Interface

```typescript
interface Student {
  email: string;
  username: string;
  name: string;
  password_hash: string;
  auth_user_id: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}
```

## Components and Interfaces

### 1. Username Validation Module

```typescript
// src/lib/usernameValidation.ts

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate username format
 * - 3-20 characters
 * - Alphanumeric and underscores only
 * - Cannot start or end with underscore
 */
export const validateUsername = (username: string): UsernameValidationResult => {
  // Check length
  if (username.length < 3 || username.length > 20) {
    return {
      isValid: false,
      error: 'Username must be 3-20 characters long'
    };
  }
  
  // Check format (alphanumeric and underscores)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores'
    };
  }
  
  // Cannot start or end with underscore
  if (username.startsWith('_') || username.endsWith('_')) {
    return {
      isValid: false,
      error: 'Username cannot start or end with underscore'
    };
  }
  
  // Cannot have consecutive underscores
  if (username.includes('__')) {
    return {
      isValid: false,
      error: 'Username cannot have consecutive underscores'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): UsernameValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  return { isValid: true };
};
```

### 2. Updated Supabase Service

```typescript
// src/lib/supabaseService.ts (UPDATED)

export const supabaseService = {
  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('students')
      .select('username')
      .eq('username', username)
      .single();
    
    return !data; // Available if no data found
  },

  // Check if email is available
  async isEmailAvailable(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('students')
      .select('email')
      .eq('email', email)
      .single();
    
    return !data;
  },

  // Create student with Supabase Auth
  async createStudentWithAuth(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          username: data.username,
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (authError) throw authError;

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        email: data.email,
        username: data.username,
        name: data.name,
        password_hash: '', // Not needed with Supabase Auth
        auth_user_id: authData.user?.id,
        email_verified: false,
      }])
      .select()
      .single();

    if (studentError) throw studentError;

    return { user: authData.user, student };
  },

  // Get student by email or username
  async getStudentByEmailOrUsername(identifier: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get student by email
  async getStudentByEmail(email: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update student email verification status
  async updateEmailVerification(email: string, verified: boolean) {
    const { data, error } = await supabase
      .from('students')
      .update({ email_verified: verified })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Resend verification email
  async resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) throw error;
    return true;
  },

  // Login with email or username
  async loginWithEmailOrUsername(identifier: string, password: string) {
    // First, check if identifier is email or username
    const student = await this.getStudentByEmailOrUsername(identifier);
    
    if (!student) {
      throw new Error('Invalid credentials');
    }

    // Login with email (Supabase Auth requires email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: student.email,
      password: password,
    });

    if (error) throw error;

    return { user: data.user, student };
  },

  // Request password reset
  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return true;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return true;
  },
};
```

### 3. Updated AuthContext

```typescript
// src/context/AuthContext.tsx (UPDATED)

type User = { email: string; username: string; name: string };
type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
};

type AuthContextType = {
  auth: AuthState;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, username: string, email: string, password: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null });

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const student = await supabaseService.getStudentByEmail(session.user.email!);
        if (student && student.email_verified) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: student.email,
              username: student.username,
              name: student.name,
            },
          });
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const student = await supabaseService.getStudentByEmail(session.user.email!);
        if (student && student.email_verified) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: student.email,
              username: student.username,
              name: student.name,
            },
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuth({ isAuthenticated: false, user: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (name: string, username: string, email: string, password: string) => {
    try {
      await supabaseService.createStudentWithAuth({ name, username, email, password });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const { user, student } = await supabaseService.loginWithEmailOrUsername(identifier, password);
      
      if (!student.email_verified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      setAuth({
        isAuthenticated: true,
        user: {
          email: student.email,
          username: student.username,
          name: student.name,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuth({ isAuthenticated: false, user: null });
  };

  const resendVerification = async (email: string) => {
    try {
      await supabaseService.resendVerificationEmail(email);
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      return false;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await supabaseService.requestPasswordReset(email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, signup, resendVerification, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Updated Signup Page

```typescript
// src/pages/Signup.tsx (UPDATED)

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { signup } = useAuth();

  // Real-time username availability check
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) return;
      
      const validation = validateUsername(username);
      if (!validation.isValid) {
        setUsernameAvailable(false);
        return;
      }

      const available = await supabaseService.isUsernameAvailable(username);
      setUsernameAvailable(available);
    }, 500),
    []
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setForm({ ...form, username });
    checkUsername(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameValidation = validateUsername(form.username);
    if (!usernameValidation.isValid) {
      toast({ title: "Invalid Username", description: usernameValidation.error, variant: "destructive" });
      return;
    }

    const emailValidation = validateEmail(form.email);
    if (!emailValidation.isValid) {
      toast({ title: "Invalid Email", description: emailValidation.error, variant: "destructive" });
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);
    const success = await signup(form.name, form.username, form.email, form.password);
    setLoading(false);

    if (success) {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      navigate("/login");
    } else {
      toast({
        title: "Signup Failed",
        description: "Email or username may already be in use.",
        variant: "destructive",
      });
    }
  };

  return (
    // Form with name, username, email, password fields
    // Show username availability indicator
    // Show email format validation
  );
};
```

### 5. Email Verification Page

```typescript
// src/pages/VerifyEmail.tsx (NEW)

const VerifyEmail = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Supabase automatically handles verification via URL params
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Update student record
          await supabaseService.updateEmailVerification(session.user.email!, true);
          setStatus('success');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Email verified! Redirecting to login...</p>}
      {status === 'error' && <p>Verification failed. Please try again.</p>}
    </div>
  );
};
```

## Supabase Configuration

### Email Templates

Configure in Supabase Dashboard → Authentication → Email Templates:

**Confirm Signup Template:**
```html
<h2>Welcome to DMLT Academy!</h2>
<p>Click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>
<p>This link expires in 24 hours.</p>
```

**Reset Password Template:**
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
```

### Auth Settings

```
Site URL: http://localhost:8081 (dev) / https://yourdomain.com (prod)
Redirect URLs: 
  - http://localhost:8081/verify-email
  - http://localhost:8081/reset-password
Email Confirmation: Enabled
```

## Design Decisions

### 1. Supabase Auth vs Custom

**Decision**: Use Supabase Auth for email verification and password management.

**Rationale**:
- Built-in email verification
- Secure password reset flow
- No need to manage email sending
- Better security practices
- Easier to maintain

### 2. Username + Email Login

**Decision**: Allow login with either email or username.

**Rationale**:
- User flexibility
- Easier to remember username than email
- Common pattern in modern apps
- Better UX

### 3. Sync Auth with Students Table

**Decision**: Maintain separate students table synced with Supabase Auth.

**Rationale**:
- Store additional user data (username, name)
- Easier to query for app-specific data
- Maintain existing relationships with other tables
- Flexibility for future features

## Testing Strategy

1. **Username Validation**: Test various username formats
2. **Email Verification**: Test verification flow end-to-end
3. **Login**: Test with both email and username
4. **Password Reset**: Test reset flow
5. **Error Handling**: Test all error scenarios
