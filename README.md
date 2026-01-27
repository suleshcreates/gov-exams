# GovExams Exam Portal

A comprehensive online examination platform built for GovExams with bilingual support (English/Marathi), and real-time exam monitoring.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account


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
   

   ```

4. **Set up Supabase Database**

   Run the migration files in order:
   ```bash
   # View migrations folder for SQL files
   # Execute them in your Supabase SQL Editor
   ```



5. **Run Development Server**
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


- **Bilingual Support** - English and Marathi
- **5 Subjects** - Mathematics, Physics, Chemistry, Biology, General Knowledge
- **25 Question Sets** - 5 sets per subject, 20 MCQs each
- **Real-time Monitoring** - Camera monitoring during exams
- **Instant Results** - Immediate feedback with analytics
- **Plan System** - Flexible subscription plans
- **Admin Panel** - Comprehensive management interface

## 🔐 Authentication Flow

94. User signs in with Phone/Email (OTP based)
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

- Admin panel
- Plan management system



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
