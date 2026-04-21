# Requirements Document

## Introduction

The Admin Panel is a web-based interface that allows administrators to manage the exam platform. Administrators need the ability to view and manage students, monitor exam results, handle user plans, and oversee system analytics. The panel should provide a secure, role-based access system with comprehensive data management capabilities.

## Glossary

- **Admin Panel**: The administrative interface for managing the exam platform
- **Administrator**: A privileged user with access to manage platform data and users
- **Student Record**: A database entry containing student information including email, username, and verification status
- **Exam Result**: A record of a student's performance on a specific exam set
- **User Plan**: A purchased subscription or access plan for specific exams
- **Dashboard**: The main overview page showing key metrics and statistics
- **Authentication System**: Supabase Auth-based login system for administrators

## Requirements

### Requirement 1: Administrator Authentication

**User Story:** As an administrator, I want to securely log in to the admin panel, so that I can access administrative functions while keeping the system secure.

#### Acceptance Criteria

1. WHEN an administrator navigates to the admin login page, THE Authentication System SHALL display a login form with email and password fields
2. WHEN an administrator submits valid credentials, THE Authentication System SHALL authenticate the user and grant access to the admin panel
3. WHEN an administrator submits invalid credentials, THE Authentication System SHALL display an error message and deny access
4. WHILE an administrator session is active, THE Admin Panel SHALL maintain the authenticated state across page navigation
5. WHEN an administrator logs out, THE Authentication System SHALL terminate the session and redirect to the login page

### Requirement 2: Student Management

**User Story:** As an administrator, I want to view and manage student accounts, so that I can monitor user activity and resolve account issues.

#### Acceptance Criteria

1. WHEN an administrator accesses the students section, THE Admin Panel SHALL display a paginated list of all student records
2. THE Admin Panel SHALL display student email, username, name, verification status, and registration date for each student record
3. WHEN an administrator searches for a student, THE Admin Panel SHALL filter the student list based on email, username, or name
4. WHEN an administrator selects a student record, THE Admin Panel SHALL display detailed information including exam history and active plans
5. WHEN an administrator updates a student verification status, THE Admin Panel SHALL persist the change to the database

### Requirement 3: Exam Results Monitoring

**User Story:** As an administrator, I want to view exam results and performance data, so that I can monitor student progress and identify trends.

#### Acceptance Criteria

1. WHEN an administrator accesses the exam results section, THE Admin Panel SHALL display a list of all exam results with student information
2. THE Admin Panel SHALL display exam title, student name, score, accuracy, and completion date for each result
3. WHEN an administrator filters results by exam or student, THE Admin Panel SHALL display only matching records
4. WHEN an administrator selects an exam result, THE Admin Panel SHALL display detailed information including time taken and user answers
5. THE Admin Panel SHALL calculate and display aggregate statistics including average scores and pass rates

### Requirement 4: User Plans Management

**User Story:** As an administrator, I want to manage user plans and subscriptions, so that I can handle billing issues and grant access to exams.

#### Acceptance Criteria

1. WHEN an administrator accesses the plans section, THE Admin Panel SHALL display all active and expired user plans
2. THE Admin Panel SHALL display plan name, student information, price paid, exam access, purchase date, and expiration date for each plan
3. WHEN an administrator searches for plans by student, THE Admin Panel SHALL filter the plan list accordingly
4. WHEN an administrator updates a plan expiration date, THE Admin Panel SHALL persist the change and update the plan status
5. WHEN an administrator deactivates a plan, THE Admin Panel SHALL revoke student access to associated exams

### Requirement 5: Dashboard Analytics

**User Story:** As an administrator, I want to see key metrics and analytics on a dashboard, so that I can quickly understand platform performance and usage.

#### Acceptance Criteria

1. WHEN an administrator accesses the dashboard, THE Admin Panel SHALL display total student count, active plans count, and total exam results count
2. THE Admin Panel SHALL display recent student registrations with timestamps
3. THE Admin Panel SHALL display recent exam completions with student names and scores
4. THE Admin Panel SHALL calculate and display average exam scores across all exams
5. THE Admin Panel SHALL display revenue metrics including total revenue and revenue by plan type

### Requirement 6: Subject Management

**User Story:** As an administrator, I want to create and manage subjects, so that I can organize exams and question sets by topic.

#### Acceptance Criteria

1. WHEN an administrator accesses the subjects section, THE Admin Panel SHALL display all existing subjects with their names and exam counts
2. WHEN an administrator creates a new subject, THE Admin Panel SHALL allow input of subject name and description
3. WHEN an administrator updates a subject, THE Admin Panel SHALL persist the changes and update all associated exams
4. WHEN an administrator deletes a subject, THE Admin Panel SHALL verify no exams are associated before allowing deletion
5. THE Admin Panel SHALL display subjects in a sortable and searchable list

### Requirement 7: Question Sets Management

**User Story:** As an administrator, I want to create and manage question sets within subjects, so that I can provide organized exam content to students.

#### Acceptance Criteria

1. WHEN an administrator accesses a subject, THE Admin Panel SHALL display all question sets associated with that subject
2. WHEN an administrator creates a new question set, THE Admin Panel SHALL allow input of subject, exam ID, set number, and time limit
3. THE Admin Panel SHALL validate that set numbers are unique within each exam
4. WHEN an administrator edits a question set, THE Admin Panel SHALL allow modification of set metadata including time limit and set number
5. WHEN an administrator deletes a question set, THE Admin Panel SHALL remove all associated questions and display a confirmation message

### Requirement 8: Question Management

**User Story:** As an administrator, I want to add, edit, and delete individual questions within question sets, so that I can maintain accurate and up-to-date exam content.

#### Acceptance Criteria

1. WHEN an administrator opens a question set, THE Admin Panel SHALL display all questions with their text, options, and correct answers
2. WHEN an administrator adds a new question, THE Admin Panel SHALL allow input of question text, four options, and the correct answer index
3. WHEN an administrator edits a question, THE Admin Panel SHALL display the current question data in an editable form
4. WHEN an administrator deletes a question, THE Admin Panel SHALL remove the question and reorder remaining questions
5. THE Admin Panel SHALL validate that each question has exactly four options and one correct answer before saving

### Requirement 9: Exam Timing Configuration

**User Story:** As an administrator, I want to configure time limits for question sets, so that I can control exam duration and difficulty.

#### Acceptance Criteria

1. WHEN an administrator creates or edits a question set, THE Admin Panel SHALL allow input of time limit in minutes
2. THE Admin Panel SHALL validate that time limits are positive integers
3. WHEN an administrator updates a time limit, THE Admin Panel SHALL apply the change to future exam attempts
4. THE Admin Panel SHALL display time limit information in a clear format showing hours and minutes
5. THE Admin Panel SHALL allow different time limits for different question sets within the same exam
