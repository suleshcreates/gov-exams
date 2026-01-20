# GovExams Exam Portal

A comprehensive online examination platform built for GovExams with Google OAuth authentication, bilingual support (English/Marathi), and real-time exam monitoring.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Google Cloud Console project (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   cd ethereal-exam-quest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # EmailJS Configuration (optional)
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```

4. **Set up Supabase Database**

   Run the migration files in order:
   ```bash
   # View migrations folder for SQL files
   # Execute them in your Supabase SQL Editor
   ```

5. **Configure Google OAuth**

   See [Google OAuth Setup](docs/setup/GOOGLE_OAUTH_SETUP.md) for detailed instructions.

6. **Run Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
ethereal-exam-quest/
├── src/
│   ├── pages/          # Route components
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers
│   ├── lib/            # Utilities and services
│   ├── admin/          # Admin panel (separate module)
│   └── hooks/          # Custom React hooks
├── docs/               # Documentation
│   ├── setup/          # Setup guides
│   └── troubleshooting/ # Common issues
├── migrations/         # Database migration files
├── scripts/            # Utility scripts
└── public/             # Static assets
```

## ✨ Features

- **Google OAuth Authentication** - Secure sign-in with Google
- **Bilingual Support** - English and Marathi
- **5 Subjects** - Mathematics, Physics, Chemistry, Biology, General Knowledge
- **25 Question Sets** - 5 sets per subject, 20 MCQs each
- **Real-time Monitoring** - Camera monitoring during exams
- **Instant Results** - Immediate feedback with analytics
- **Plan System** - Flexible subscription plans
- **Admin Panel** - Comprehensive management interface

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. OAuth popup/redirect to Google
3. User authorizes the app
4. Redirected to `/auth/callback`
5. User profile created in `students` table
6. If profile incomplete, redirected to `/complete-profile`
7. User adds username and phone number
8. Redirected to home page

## 📝 Current Status

### ✅ Completed
- File organization and cleanup
- Logger utility implementation
- TypeScript strict mode compliance
- Google OAuth integration
- Admin panel
- Plan management system

### ⚠️ **CRITICAL: Google OAuth Not Configured**

**Login and signup won't work until you configure Google OAuth!**

**Quick Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:8080/auth/callback`
6. Go to Supabase Dashboard → Authentication → Providers
7. Enable Google provider
8. Paste your Google Client ID and Client Secret
9. **No .env changes needed** - Supabase handles OAuth configuration

**Detailed Guide:** See `docs/setup/` folder

### 🚧 In Progress
- Performance optimization
- Bundle size reduction

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📚 Documentation

- [Google OAuth Setup](docs/setup/GOOGLE_OAUTH_SETUP.md)
- [Admin Panel Setup](docs/setup/ADMIN_PANEL_SETUP.md)
- [Troubleshooting](docs/troubleshooting/common-issues.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private - GovExams

## 🆘 Support

For issues or questions:
1. Check the [troubleshooting guide](docs/troubleshooting/)
2. Review existing documentation in `docs/`
3. Contact the development team

---

**Made with ❤️ for GovExams**
