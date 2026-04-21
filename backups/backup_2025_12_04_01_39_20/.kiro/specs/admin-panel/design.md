# Admin Panel Design Document

## Overview

The Admin Panel is a comprehensive web-based administrative interface for managing the exam platform. It provides administrators with tools to manage students, subjects, exams, question sets, individual questions, user plans, and view analytics. The panel uses a modern, responsive design with role-based access control and real-time data synchronization with Supabase.

## Architecture

### Technology Stack

- **Frontend Framework**: React with TypeScript
- **Routing**: React Router v6
- **UI Components**: Tailwind CSS with custom components
- **State Management**: React Context API + Local State
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication**: Supabase Auth with admin role verification
- **Data Fetching**: Supabase Client SDK

### Application Structure

```
src/
├── admin/
│   ├── components/
│   │   ├── AdminLayout.tsx          # Main admin layout with sidebar
│   │   ├── AdminSidebar.tsx         # Navigation sidebar
│   │   ├── AdminHeader.tsx          # Top header with user menu
│   │   ├── DataTable.tsx            # Reusable data table component
│   │   ├── Modal.tsx                # Reusable modal component
│   │   ├── ConfirmDialog.tsx        # Confirmation dialog
│   │   └── QuestionEditor.tsx       # Rich question editor component
│   ├── pages/
│   │   ├── AdminLogin.tsx           # Admin authentication page
│   │   ├── Dashboard.tsx            # Main dashboard with analytics
│   │   ├── Students.tsx             # Student management
│   │   ├── StudentDetail.tsx        # Individual student details
│   │   ├── Subjects.tsx             # Subject management
│   │   ├── SubjectDetail.tsx        # Subject with question sets
│   │   ├── QuestionSetEditor.tsx    # Question set editor
│   │   ├── QuestionManager.tsx      # Individual question management
│   │   ├── ExamResults.tsx          # Exam results monitoring
│   │   └── UserPlans.tsx            # User plans management
│   ├── context/
│   │   └── AdminAuthContext.tsx     # Admin authentication context
│   └── lib/
│       └── adminService.ts          # Admin-specific API calls
├── lib/
│   └── supabase.ts                  # Supabase client (existing)
└── types/
    └── admin.ts                     # Admin-specific TypeScript types
```

## Components and Interfaces

### 1. Authentication System

#### AdminAuthContext

Manages admin authentication state and provides login/logout functions.

```typescript
interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}
```

**Implementation Details:**
- Uses Supabase Auth for authentication
- Checks for 'admin' role in user metadata
- Stores admin session in Supabase Auth
- Redirects non-admin users to student portal

#### AdminLogin Page

- Email and password input fields
- Form validation
- Error message display
- Redirect to dashboard on successful login

### 2. Dashboard

#### Layout

- **Header**: Admin name, logout button
- **Sidebar**: Navigation menu with icons
- **Main Content**: Key metrics and recent activity

#### Metrics Cards

1. **Total Students**: Count of all registered students
2. **Active Plans**: Count of currently active user plans
3. **Total Exams Taken**: Count of all exam results
4. **Total Revenue**: Sum of all plan purchases
5. **Average Score**: Average accuracy across all exam results

#### Recent Activity

- **Recent Registrations**: Last 5 student signups with timestamps
- **Recent Exam Completions**: Last 10 exam results with scores
- **Recent Plan Purchases**: Last 5 plan purchases with amounts

### 3. Student Management

#### Students List Page

**Features:**
- Paginated table of all students (20 per page)
- Search bar (filters by email, username, or name)
- Sortable columns: Name, Email, Username, Verified, Registered Date
- Action buttons: View Details, Toggle Verification

**Table Columns:**
- Email
- Username
- Name
- Email Verified (badge: green/red)
- Registration Date
- Actions (View, Edit Verification)

#### Student Detail Page

**Sections:**
1. **Student Information**
   - Email, Username, Name
   - Verification status with toggle
   - Registration date
   - Auth User ID

2. **Active Plans**
   - List of active plans with expiration dates
   - Exam access list
   - Deactivate plan button

3. **Exam History**
   - Table of all exam results
   - Exam title, score, accuracy, date
   - Link to detailed result view

4. **Analytics**
   - Total exams taken
   - Average score
   - Pass rate (>85% accuracy)
   - Performance chart

### 4. Subject Management

#### Subjects List Page

**Features:**
- Grid or list view of all subjects
- Add New Subject button
- Search and filter subjects
- Each subject card shows:
  - Subject name
  - Description
  - Number of exams/question sets
  - Edit and Delete buttons

#### Subject Form (Create/Edit)

**Fields:**
- Subject Name (required)
- Description (optional, textarea)
- Icon/Image (optional, future enhancement)

**Validation:**
- Subject name must be unique
- Name length: 3-100 characters

#### Subject Detail Page

**Sections:**
1. **Subject Information**
   - Name and description
   - Edit button

2. **Question Sets List**
   - Table of all question sets in this subject
   - Columns: Set Number, Exam ID, Questions Count, Time Limit, Actions
   - Add New Question Set button
   - Edit and Delete buttons for each set

### 5. Question Sets Management

#### Question Set Editor

**Form Fields:**
- Subject (dropdown, required)
- Exam ID (text input, required)
- Set Number (number input, required)
- Time Limit (number input in minutes, required)
- Title (auto-generated: "Set {number}")

**Validation:**
- Set number must be unique within the exam
- Time limit must be positive integer
- Exam ID format validation

**Actions:**
- Save Question Set
- Cancel
- After saving, redirect to Question Manager for adding questions

### 6. Question Management

#### Question Manager Page

**Context:** Opened after creating/editing a question set

**Features:**
- Display current question set information (Subject, Exam, Set Number)
- List of all questions in the set
- Add New Question button
- Edit and Delete buttons for each question
- Reorder questions (drag and drop, future enhancement)

#### Question Editor (Modal/Form)

**Fields:**
- Question Text (English) - textarea, required
- Question Text (Marathi) - textarea, required
- Option 1 (English) - text input, required
- Option 1 (Marathi) - text input, required
- Option 2 (English) - text input, required
- Option 2 (Marathi) - text input, required
- Option 3 (English) - text input, required
- Option 3 (Marathi) - text input, required
- Option 4 (English) - text input, required
- Option 4 (Marathi) - text input, required
- Correct Answer - radio buttons (1-4), required

**Validation:**
- All fields required
- Exactly 4 options
- One correct answer selected
- Question text minimum 10 characters

**Preview:**
- Show question as it will appear to students
- Toggle between English and Marathi

### 7. Exam Results Monitoring

#### Exam Results Page

**Features:**
- Paginated table of all exam results
- Filters:
  - By exam/subject
  - By student (search)
  - By date range
  - By score range
- Export to CSV button

**Table Columns:**
- Student Name
- Student Email
- Exam Title
- Set Number
- Score / Total Questions
- Accuracy %
- Time Taken
- Date
- Actions (View Details)

#### Result Detail View (Modal)

**Information:**
- Student details
- Exam and set information
- Score and accuracy
- Time taken
- Question-by-question breakdown:
  - Question text
  - Student's answer
  - Correct answer
  - Result (correct/incorrect)

### 8. User Plans Management

#### User Plans Page

**Features:**
- Paginated table of all user plans
- Filters:
  - Active/Expired/All
  - By student (search)
  - By plan type
  - By date range
- Add Manual Plan button (for admin-granted access)

**Table Columns:**
- Student Name
- Student Email
- Plan Name
- Price Paid
- Exam Access (expandable list)
- Purchase Date
- Expiration Date
- Status (Active/Expired badge)
- Actions (Edit, Deactivate)

#### Plan Editor (Modal)

**Fields:**
- Student (search and select)
- Plan Type (dropdown)
- Exam Access (multi-select)
- Price Paid (number input)
- Expiration Date (date picker, optional)
- Is Active (checkbox)

**Actions:**
- Save Plan
- Cancel

## Data Models

### Database Schema Extensions

#### New Tables

**1. subjects**
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. question_sets**
```sql
CREATE TABLE question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_id VARCHAR(50) NOT NULL,
  set_number INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_id, set_number)
);
```

**3. questions**
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_text_marathi TEXT NOT NULL,
  option_1 TEXT NOT NULL,
  option_1_marathi TEXT NOT NULL,
  option_2 TEXT NOT NULL,
  option_2_marathi TEXT NOT NULL,
  option_3 TEXT NOT NULL,
  option_3_marathi TEXT NOT NULL,
  option_4 TEXT NOT NULL,
  option_4_marathi TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**4. admins**
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### TypeScript Interfaces

```typescript
interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface QuestionSet {
  id: string;
  subject_id: string;
  exam_id: string;
  set_number: number;
  time_limit_minutes: number;
  created_at: string;
  updated_at: string;
  subject?: Subject; // Joined data
  questions_count?: number; // Computed
}

interface Question {
  id: string;
  question_set_id: string;
  question_text: string;
  question_text_marathi: string;
  option_1: string;
  option_1_marathi: string;
  option_2: string;
  option_2_marathi: string;
  option_3: string;
  option_3_marathi: string;
  option_4: string;
  option_4_marathi: string;
  correct_answer: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Admin {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  created_at: string;
  last_login: string | null;
}
```

## Error Handling

### Error Types

1. **Authentication Errors**
   - Invalid credentials
   - Session expired
   - Insufficient permissions

2. **Validation Errors**
   - Required field missing
   - Invalid format
   - Duplicate entry

3. **Database Errors**
   - Connection failure
   - Query timeout
   - Constraint violation

### Error Display

- Toast notifications for success/error messages
- Inline validation errors on forms
- Error boundary for unexpected errors
- Detailed error logs in console (dev mode only)

## Testing Strategy

### Unit Tests

- Form validation logic
- Data transformation functions
- Utility functions

### Integration Tests

- Admin authentication flow
- CRUD operations for each entity
- Data table filtering and sorting
- Form submission and validation

### E2E Tests

- Complete admin workflows:
  - Login → Create Subject → Add Question Set → Add Questions
  - View student details → Check exam history
  - Create user plan → Verify student access

### Manual Testing Checklist

- [ ] Admin login with valid/invalid credentials
- [ ] Dashboard loads with correct metrics
- [ ] Create, edit, delete subject
- [ ] Create question set with validation
- [ ] Add, edit, delete questions
- [ ] View student details and history
- [ ] Filter and search exam results
- [ ] Create and manage user plans
- [ ] Responsive design on mobile/tablet
- [ ] Error handling for network failures

## Security Considerations

### Authentication

- Admin role verification on every request
- Secure session management with Supabase Auth
- Automatic logout on session expiration

### Authorization

- Row Level Security (RLS) policies for admin tables
- API endpoints validate admin role
- Client-side route protection

### Data Protection

- Input sanitization to prevent XSS
- SQL injection prevention via Supabase parameterized queries
- CSRF protection via Supabase Auth tokens

### Audit Logging

- Log all admin actions (create, update, delete)
- Track who made changes and when
- Store logs in separate audit table

## Performance Optimization

### Data Loading

- Pagination for large datasets (20-50 items per page)
- Lazy loading for images and heavy components
- Debounced search inputs (300ms delay)

### Caching

- Cache subject and exam metadata
- Invalidate cache on updates
- Use React Query for server state management (future enhancement)

### Database Optimization

- Indexes on frequently queried columns:
  - students.email, students.username
  - question_sets.exam_id, question_sets.subject_id
  - questions.question_set_id
  - exam_results.student_phone, exam_results.exam_id

## UI/UX Design

### Design System

- **Colors:**
  - Primary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
  - Neutral: Gray shades

- **Typography:**
  - Headings: Inter font, bold
  - Body: Inter font, regular
  - Code: Monospace font

- **Spacing:**
  - Consistent 4px grid system
  - Padding: 16px, 24px, 32px
  - Margins: 8px, 16px, 24px

### Responsive Design

- **Desktop (>1024px):** Full sidebar, multi-column layouts
- **Tablet (768px-1024px):** Collapsible sidebar, 2-column layouts
- **Mobile (<768px):** Bottom navigation, single-column layouts

### Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Color contrast ratio >4.5:1

## Deployment Considerations

### Environment Variables

```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_ADMIN_ROUTE_PREFIX=/admin
```

### Build Configuration

- Separate admin bundle for code splitting
- Lazy load admin routes
- Optimize images and assets

### Monitoring

- Error tracking (Sentry or similar)
- Performance monitoring
- User analytics (admin usage patterns)
