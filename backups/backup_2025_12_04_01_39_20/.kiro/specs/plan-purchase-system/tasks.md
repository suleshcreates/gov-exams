# Implementation Plan

- [x] 1. Update database schema and data models


  - Update the user_plans table schema in Supabase to support subject selection
  - Update mockData.ts with new plan structure including subjectCount and requiresSelection
  - Ensure all plans have correct subject counts and selection requirements
  - _Requirements: 1.1, 1.2, 4.4_

- [x] 1.1 Update Supabase schema for user_plans table


  - Run SQL migration to update user_plans table structure
  - Add indexes for performance optimization
  - Test schema changes in Supabase dashboard
  - _Requirements: 4.4_

- [x] 1.2 Update mockData.ts with new plan structure


  - Add subjectCount field to SubscriptionPlan interface
  - Add requiresSelection field to SubscriptionPlan interface
  - Update all plan objects with correct values
  - Remove hardcoded examIds from plans (will be selected by user)
  - _Requirements: 1.1, 1.2_

- [x] 2. Create access control utility functions


  - Create planUtils.ts with access control logic
  - Implement hasExamAccess function to check if user can access an exam
  - Implement getAccessibleExams function to get all accessible exam IDs
  - Implement helper functions for purchase validation
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2.1 Create planUtils.ts file


  - Create new file at src/lib/planUtils.ts
  - Import necessary dependencies (supabaseService, mockData)
  - _Requirements: 4.1_

- [x] 2.2 Implement hasExamAccess function

  - Write function to check if user has access to specific exam
  - Query user_plans table for active plans containing the exam ID
  - Return boolean indicating access status
  - _Requirements: 4.2, 4.3_

- [x] 2.3 Implement getAccessibleExams function

  - Write function to get all exam IDs user has access to
  - Query all active plans for the user
  - Combine exam_ids from all plans into unique set
  - Return array of accessible exam IDs
  - _Requirements: 4.1_

- [x] 2.4 Implement hasSubjectPurchased function

  - Write function to check if specific subject is already purchased
  - Prevent duplicate purchases
  - _Requirements: 7.3_

- [x] 3. Update Supabase service with new methods



  - Update supabaseService.ts with new purchase methods
  - Modify savePlanPurchase to accept selected exam IDs
  - Update getActiveStudentPlans to properly filter expired plans
  - Add hasExamAccess method to service
  - _Requirements: 4.4, 4.5_

- [x] 3.1 Update savePlanPurchase method


  - Modify method signature to accept exam_ids array parameter
  - Update database insert to store selected subjects
  - Handle both plan purchases and individual subject purchases
  - _Requirements: 4.4, 6.4_

- [x] 3.2 Update getActiveStudentPlans method

  - Add proper date filtering for expired plans
  - Return only active plans with valid expiration dates
  - _Requirements: 4.5_

- [x] 3.3 Add hasExamAccess method


  - Create method to check exam access via database query
  - Use in access control checks throughout app
  - _Requirements: 4.2, 4.3_

- [ ] 4. Create SubjectSelectionModal component
  - Create new component for subject selection during plan purchase
  - Implement checkbox selection with limit enforcement
  - Show progress indicator for selected subjects
  - Display all available subjects from mockExams
  - Disable selection when limit is reached
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.1 Create SubjectSelectionModal component file
  - Create new file at src/components/SubjectSelectionModal.tsx
  - Set up component structure with Dialog from Shadcn/UI
  - Define component props interface
  - _Requirements: 2.1_

- [ ] 4.2 Implement subject selection logic
  - Add state for selectedSubjects array
  - Implement handleToggleSubject function
  - Enforce maximum selection limit based on plan
  - _Requirements: 2.2, 2.3_

- [ ] 4.3 Build subject selection UI
  - Create grid layout for subject cards
  - Add checkbox indicators for selected subjects
  - Show progress bar for selection count
  - Display subject details (title, description)
  - _Requirements: 2.4, 2.5_

- [ ] 4.4 Add confirmation button with validation
  - Disable confirm button until exact number of subjects selected
  - Pass selected subjects to parent component on confirm
  - _Requirements: 2.2_

- [ ] 5. Create PaymentConfirmationModal component
  - Create new component for payment confirmation
  - Display selected plan and subjects
  - Show total price and payment details
  - Add confirm and cancel buttons
  - Show processing state during payment
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 5.1 Create PaymentConfirmationModal component file
  - Create new file at src/components/PaymentConfirmationModal.tsx
  - Set up component structure with Dialog
  - Define component props interface
  - _Requirements: 6.1_

- [ ] 5.2 Build payment summary UI
  - Display plan name or "Individual Subject"
  - List all selected subjects with checkmarks
  - Show total price prominently
  - Add terms and conditions text
  - _Requirements: 6.2, 6.3_

- [ ] 5.3 Implement confirmation action
  - Add confirm button that triggers payment processing
  - Show loading state during processing
  - Handle success and error states
  - _Requirements: 6.4_

- [ ] 6. Create IndividualSubjectCard component
  - Create new component for individual subject purchase cards
  - Display subject information and price
  - Add purchase button with state management
  - Show purchased status if already bought
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6.1 Create IndividualSubjectCard component file
  - Create new file at src/components/IndividualSubjectCard.tsx
  - Set up component structure
  - Define component props interface
  - _Requirements: 3.1_

- [ ] 6.2 Build subject card UI
  - Display subject title and description
  - Show price with currency symbol
  - Add purchase button
  - Style with glass-card and hover effects
  - _Requirements: 3.2_

- [ ] 6.3 Implement purchase logic
  - Add onClick handler for purchase button
  - Show purchased status if user already has access
  - Disable button during processing
  - _Requirements: 3.3, 3.4_

- [ ] 7. Update Plans page with subject selection flow
  - Update Plans.tsx to integrate subject selection modal
  - Add individual subjects section
  - Implement plan purchase flow with subject selection
  - Handle Master Plan (no selection needed)
  - Show purchased status for owned plans/subjects
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.1, 3.2, 3.3, 6.1, 6.2, 6.3_

- [ ] 7.1 Add state management for modals
  - Add state for SubjectSelectionModal visibility
  - Add state for PaymentConfirmationModal visibility
  - Add state for selected plan and subjects
  - Add state for processing status
  - _Requirements: 2.1, 6.1_

- [ ] 7.2 Implement plan purchase click handler
  - Check if plan requires subject selection
  - If Master Plan, skip to payment confirmation with all subjects
  - If other plan, show subject selection modal
  - _Requirements: 1.1, 2.1_

- [ ] 7.3 Integrate SubjectSelectionModal
  - Add SubjectSelectionModal component to Plans page
  - Pass plan data and callbacks
  - Handle subject selection confirmation
  - Proceed to payment confirmation after selection
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7.4 Integrate PaymentConfirmationModal
  - Add PaymentConfirmationModal component to Plans page
  - Show selected plan and subjects
  - Handle payment confirmation
  - Process purchase and save to database
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 7.5 Add individual subjects section
  - Create new section below plans for individual purchases
  - Display all subjects using IndividualSubjectCard
  - Handle individual subject purchase flow
  - Skip subject selection for individual purchases
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7.6 Update purchase processing logic
  - Modify handlePlanPurchase to save selected subjects
  - Update database call to include exam_ids array
  - Handle both plan and individual purchases
  - Show success toast with purchased subjects
  - _Requirements: 4.4, 6.4, 6.5_

- [ ] 7.7 Update purchased status checks
  - Load user's purchased plans and subjects on mount
  - Check if each plan/subject is already purchased
  - Disable purchase buttons for owned items
  - Show "Purchased" status
  - _Requirements: 7.3_

- [ ] 8. Update Home page to filter accessible subjects
  - Modify Home.tsx to show only accessible exams
  - Load user's accessible exam IDs using planUtils
  - Filter mockExams to show only accessible subjects
  - Show message if user has no access to any subjects
  - Add call-to-action to purchase plans
  - _Requirements: 4.1, 4.2_

- [ ] 8.1 Add accessible exams state
  - Add state for accessibleExams array
  - Add loading state for access check
  - _Requirements: 4.1_

- [ ] 8.2 Load accessible exams on mount
  - Use planUtils.getAccessibleExams to fetch accessible exam IDs
  - Filter mockExams based on accessible IDs
  - Update state with filtered exams
  - _Requirements: 4.1, 4.2_

- [ ] 8.3 Update exam cards rendering
  - Render only accessible exams in the grid
  - Show empty state if no accessible exams
  - Add "Purchase Plans" button in empty state
  - _Requirements: 4.1_

- [ ] 9. Update ExamDetails page with access control
  - Modify ExamDetails.tsx to check access before allowing exam start
  - Show access required message if user doesn't have access
  - Redirect to Plans page if access denied
  - Display purchased status clearly
  - _Requirements: 4.2, 4.3_

- [ ] 9.1 Add access check state
  - Add hasAccess state boolean
  - Add checkingAccess loading state
  - _Requirements: 4.2_

- [ ] 9.2 Implement access check on mount
  - Use planUtils.hasExamAccess to check if user can access exam
  - Update hasAccess state based on result
  - _Requirements: 4.2, 4.3_

- [ ] 9.3 Update exam start handler
  - Check hasAccess before allowing exam start
  - Show toast and redirect to Plans if no access
  - Proceed with exam start if access granted
  - _Requirements: 4.2, 4.3_

- [ ] 9.4 Update UI to show access status
  - Display "Access Granted" badge if user has access
  - Show "Purchase Required" message if no access
  - Update button text based on access status
  - _Requirements: 4.2_

- [ ] 10. Update Profile page to show purchased plans
  - Modify Profile.tsx to display purchased plans with subjects
  - Show purchase dates and expiration dates
  - Display individually purchased subjects separately
  - Show total accessible subjects count
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 10.1 Load purchased plans with details
  - Use planUtils.getPurchasedPlansWithDetails to fetch plans
  - Include subject names for each plan
  - Update state with plan details
  - _Requirements: 5.1, 5.2_

- [ ] 10.2 Update purchased plans section UI
  - Display each plan with selected subjects
  - Show purchase date and expiration date
  - Add active/expired status indicator
  - List subject names for each plan
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 10.3 Add individual purchases section
  - Separate display for individually purchased subjects
  - Show subject name and purchase date
  - _Requirements: 5.3_

- [ ] 11. Add error handling and validation
  - Implement error handling for database operations
  - Add validation for subject selection
  - Handle duplicate purchase attempts
  - Show appropriate error messages
  - _Requirements: 4.4, 7.3_

- [ ] 11.1 Add try-catch blocks to all database operations
  - Wrap supabaseService calls in try-catch
  - Log errors for debugging
  - Show user-friendly error toasts
  - _Requirements: 4.4_

- [ ] 11.2 Implement duplicate purchase prevention
  - Check if subject is already purchased before allowing purchase
  - Disable purchase buttons for owned items
  - Show appropriate message
  - _Requirements: 7.3_

- [ ] 11.3 Add subject selection validation
  - Validate exact number of subjects selected
  - Prevent proceeding with incorrect selection count
  - Show validation messages
  - _Requirements: 2.2, 2.3_

- [ ] 12. Test complete purchase flow
  - Test plan purchase with subject selection
  - Test Master Plan purchase (no selection)
  - Test individual subject purchase
  - Test access control on Home and ExamDetails pages
  - Verify database records are created correctly
  - Test duplicate purchase prevention
  - _Requirements: All_

- [ ] 12.1 Test Basic Plan purchase flow
  - Select Basic Plan
  - Choose 2 subjects
  - Confirm payment
  - Verify access granted to selected subjects only
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 4.1_

- [ ] 12.2 Test Premium Plan purchase flow
  - Select Premium Plan
  - Choose 4 subjects
  - Confirm payment
  - Verify access granted to selected subjects only
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 4.1_

- [ ] 12.3 Test Master Plan purchase flow
  - Select Master Plan
  - Verify no subject selection required
  - Confirm payment
  - Verify access granted to all 5 subjects
  - _Requirements: 1.1, 4.1_

- [ ] 12.4 Test individual subject purchase
  - Purchase single subject
  - Verify access granted to that subject only
  - Verify other subjects remain inaccessible
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1_

- [ ] 12.5 Test access control
  - Verify Home page shows only accessible subjects
  - Verify ExamDetails blocks access to unpurchased subjects
  - Verify redirect to Plans page when access denied
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 12.6 Test duplicate purchase prevention
  - Attempt to purchase already owned subject
  - Verify purchase button is disabled
  - Verify "Purchased" status is shown
  - _Requirements: 7.3_
