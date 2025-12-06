# Ethereal Exam Quest - Backend API

Secure Node.js/Express backend for the Ethereal Exam Quest platform deployed on Google Cloud Run.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase project
- Google Cloud account (for Cloud Run deployment)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and add your credentials

# Run development server
npm run dev
```

The API will be available at `http://localhost:8080`

## 🏗️ Architecture

### Security First

- ✅ **Bcrypt password hashing** (10 rounds)
- ✅ **Custom JWT tokens** (15min access + 30day refresh)
- ✅ **Device-based session tracking**
- ✅ **Strict CORS** (no wildcards)
- ✅ **Rate limiting** on auth endpoints
- ✅ **Input validation** with express-validator
- ✅ **Helmet security headers**

### No Direct Frontend Access

- Supabase **service role key** ONLY on backend
- Frontend calls backend API, not Supabase directly
- RLS policies lock down database to service role only

## 📋 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email/username + password
- `POST /api/auth/refresh` - Get new access token using refresh token
- `POST /api/auth/logout` - Logout (delete session)
- `POST /api/auth/logout-all` - Logout from all devices (requires auth)

### User (`/api/user`)

All endpoints require `Authorization: Bearer <access_token>` header.

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile (name, phone, username)
- `GET /api/user/plans` - Get all purchased plans
- `GET /api/user/plans/active` - Get active plans only
- `GET /api/user/exam-history` - Get exam results
- `GET /api/user/exam-progress/:examId` - Get progress for specific exam

### Health Check

- `GET /health` - Server health status (no auth required)

## 🔧 Environment Variables

Required variables in `.env`:

```env
# Server
NODE_ENV=production
PORT=8080

# Supabase (Backend Only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT (Custom - NOT Supabase Auth)
JWT_SECRET=your-256-bit-random-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# CORS (Strict - NO wildcards)
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:5173
```

## 🚢 Deployment to Cloud Run

### Step 1: Build TypeScript

```bash
npm run build
```

### Step 2: Build Docker Image

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/exam-backend
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy exam-backend \
  --image gcr.io/YOUR_PROJECT_ID/exam-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=$SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY,JWT_SECRET=$JWT_SECRET,RAZORPAY_KEY_ID=$RAZORPAY_ID,RAZORPAY_KEY_SECRET=$RAZORPAY_SECRET,ALLOWED_ORIGINS=$ORIGINS
```

### Step 4: Update Frontend

Update frontend `.env`:

```env
VITE_API_URL=https://exam-backend-xyz.run.app
```

## 🗄️ Database Setup

### Run Migration

Execute `migrations/001_create_sessions_table.sql` in Supabase SQL Editor to create the sessions table.

### Lockdown RLS Policies

All RLS policies should be set to `service_role` only. Frontend must NOT access Supabase directly.

Example:

```sql
-- Lock down students table
DROP POLICY IF EXISTS "Enable read access for all users" ON students;

CREATE POLICY "Service role only" ON students
  FOR ALL TO service_role
  USING (true);
```

## 📦 Scripts

```bash
npm run dev       # Run development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Run production server
npm test          # Run tests
npm run lint      # Run ESLint
```

## 🧪 Testing

### Manual Testing with curl

**Signup:**

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phone": "9876543210",
    "password": "Test123"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "Test123"
  }'
```

**Get Profile:**

```bash
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Security Best Practices

1. **Never expose service role key** on frontend
2. **Rotate JWT_SECRET** regularly
3. **Use HTTPS only** in production
4. **Set up monitoring** (Cloud Logging, Sentry)
5. **Keep dependencies updated** (`npm audit fix`)
6. **Review logs** for suspicious activity

## 📊 Monitoring

### Cloud Run Logs

```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Error Tracking

- Logs are written to `logs/error.log` and `logs/combined.log`
- In production, use Cloud Logging or Sentry for error tracking

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Create pull request

## 📄 License

Private - DMLT Academy

---

**Made with 🔒 for secure exam management**
