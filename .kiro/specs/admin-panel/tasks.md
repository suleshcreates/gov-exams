# Implementation Plan

- [x] 1. Set up database schema and admin authentication


  - Create database tables for subjects, question_sets, questions, and admins
  - Set up RLS policies for admin access
  - Create admin user in Supabase Auth with admin role metadata
  - _Requirements: 1.1, 1.2, 1.3_



- [ ] 2. Create admin authentication system
- [x] 2.1 Implement AdminAuthContext

  - Create AdminAuthContext with login, logout, and auth state management
  - Add admin role verification logic



  - Implement session persistence and auto-login
  - _Requirements: 1.1, 1.2, 1.4, 1.5_


- [ ] 2.2 Build AdminLogin page
  - Create login form with email and password fields
  - Add form validation and error handling
  - Implement redirect logic after successful login
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Build admin layout and navigation
- [x] 3.1 Create AdminLayout component


  - Build main layout structure with sidebar and content area
  - Add responsive design for mobile/tablet/desktop
  - Implement protected route wrapper
  - _Requirements: 1.4_




- [ ] 3.2 Create AdminSidebar and AdminHeader
  - Build navigation sidebar with menu items
  - Create header with admin name and logout button
  - Add active route highlighting



  - _Requirements: 1.4, 1.5_

- [x] 4. Implement dashboard with analytics



- [ ] 4.1 Create adminService for data fetching
  - Write functions to fetch dashboard metrics (student count, active plans, total results, revenue)
  - Add functions for recent activity (registrations, exam completions, plan purchases)
  - Implement error handling and loading states


  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.2 Build Dashboard page
  - Create metrics cards displaying key statistics
  - Build recent activity sections with tables
  - Add loading skeletons and error states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5. Implement student management
- [ ] 5.1 Create Students list page
  - Build paginated data table with student records
  - Add search functionality for email, username, and name
  - Implement sortable columns


  - Add view details and toggle verification actions



  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 5.2 Build StudentDetail page
  - Display student information with edit verification toggle
  - Show active plans with deactivate option
  - Display exam history table
  - Add analytics section with charts
  - _Requirements: 2.4, 2.5_

- [ ] 6. Implement subject management
- [ ] 6.1 Create Subjects list page
  - Build grid/list view of all subjects


  - Add create new subject button and modal
  - Implement search and filter functionality
  - Add edit and delete actions for each subject
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.2 Build SubjectDetail page


  - Display subject information with edit button
  - Show question sets table for the subject
  - Add create new question set button
  - Implement edit and delete actions for question sets
  - _Requirements: 6.1, 7.1, 7.2, 7.4, 7.5_



- [ ] 7. Implement question sets management
- [ ] 7.1 Create QuestionSetEditor component
  - Build form with subject, exam ID, set number, and time limit fields
  - Add validation for unique set numbers and required fields
  - Implement save and cancel actions


  - Add redirect to Question Manager after saving
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8. Implement question management
- [ ] 8.1 Create QuestionManager page
  - Display question set information


  - Build list of all questions in the set
  - Add create new question button
  - Implement edit and delete actions for questions
  - _Requirements: 8.1, 8.4_


- [ ] 8.2 Build QuestionEditor component
  - Create form with bilingual question text and options fields
  - Add correct answer selection with radio buttons
  - Implement validation for all required fields
  - Add preview functionality for English and Marathi
  - _Requirements: 8.1, 8.2, 8.3, 8.5_




- [ ] 9. Implement exam results monitoring
- [ ] 9.1 Create ExamResults page
  - Build paginated table of all exam results


  - Add filters for exam, student, date range, and score range
  - Implement export to CSV functionality
  - Add view details action
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 9.2 Build ResultDetail modal
  - Display student and exam information
  - Show score, accuracy, and time taken
  - Build question-by-question breakdown table
  - _Requirements: 3.4_

- [ ] 10. Implement user plans management
- [ ] 10.1 Create UserPlans page
  - Build paginated table of all user plans
  - Add filters for status, student, plan type, and date range
  - Implement add manual plan button
  - Add edit and deactivate actions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10.2 Build PlanEditor modal
  - Create form with student search, plan type, exam access, price, and expiration fields
  - Add validation for required fields
  - Implement save and cancel actions
  - _Requirements: 4.4, 4.5_




- [ ] 11. Create reusable components
- [ ] 11.1 Build DataTable component
  - Create reusable table with sorting, filtering, and pagination
  - Add loading and empty states
  - Implement responsive design
  - _Requirements: 2.1, 3.1, 4.1_

- [ ] 11.2 Create Modal and ConfirmDialog components
  - Build reusable modal component with customizable content
  - Create confirmation dialog for delete actions
  - Add keyboard navigation and accessibility features


  - _Requirements: 6.2, 7.4, 8.3, 8.4_

- [ ] 12. Add admin routes and navigation
  - Configure React Router for admin routes
  - Implement route protection with AdminAuthContext
  - Add navigation between admin pages
  - Set up 404 page for invalid admin routes
  - _Requirements: 1.4_

- [ ] 13. Implement error handling and notifications
  - Create toast notification system for success/error messages
  - Add error boundary for unexpected errors
  - Implement inline validation errors on forms
  - Add loading states for all async operations
  - _Requirements: All_

- [ ]* 14. Add responsive design and accessibility
  - Ensure all pages work on mobile, tablet, and desktop
  - Add ARIA labels and keyboard navigation
  - Test with screen readers
  - Verify color contrast ratios
  - _Requirements: All_

- [ ]* 15. Performance optimization
  - Add pagination to all data tables
  - Implement debounced search inputs
  - Add database indexes for frequently queried columns
  - Optimize bundle size with code splitting
  - _Requirements: All_
