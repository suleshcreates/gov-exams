# Requirements Document

## Introduction

This feature implements a comprehensive plan purchase system for the DMLT Academy Exam Portal that allows students to purchase subscription plans with subject selection capabilities and individual subject purchases. The system ensures proper access control based on purchased plans and selected subjects, replacing the current system where all plans incorrectly grant access to all subjects.

## Glossary

- **Plan**: A subscription package that grants access to a specific number of exam subjects
- **Subject**: An exam category (Mathematics, Physics, Chemistry, Biology, General Knowledge)
- **Subject Selection**: The process where users choose which subjects they want access to when purchasing a plan
- **Individual Purchase**: Buying access to a single subject without a subscription plan
- **Access Control**: The system that determines which subjects a user can access based on their purchases
- **Portal**: The DMLT Academy Exam Portal application
- **Student**: A registered user of the Portal

## Requirements

### Requirement 1

**User Story:** As a student, I want to view available plans with clear subject limits, so that I understand what I'm purchasing.

#### Acceptance Criteria

1. WHEN a student views the Plans page, THE Portal SHALL display all available subscription plans with their subject limits
2. THE Portal SHALL show the price, discount, and number of subjects included for each plan
3. THE Portal SHALL display plan features and benefits clearly
4. THE Portal SHALL highlight the Master Plan as the best value option
5. THE Portal SHALL allow students to view individual subject purchase options

### Requirement 2

**User Story:** As a student, I want to select specific subjects when purchasing a plan, so that I can access the subjects most relevant to my studies.

#### Acceptance Criteria

1. WHEN a student clicks to purchase a plan, THE Portal SHALL display a subject selection modal
2. THE Portal SHALL allow the student to select exactly the number of subjects included in the plan
3. THE Portal SHALL prevent the student from selecting more subjects than allowed by the plan
4. THE Portal SHALL display all available subjects with checkboxes for selection
5. THE Portal SHALL show how many subjects the student has selected and how many remain

### Requirement 3

**User Story:** As a student, I want to purchase individual subjects without a plan, so that I can access only the subjects I need.

#### Acceptance Criteria

1. WHEN a student views the Plans page, THE Portal SHALL display individual subject purchase options
2. THE Portal SHALL show the price for each individual subject
3. WHEN a student clicks to purchase an individual subject, THE Portal SHALL process the purchase without requiring plan selection
4. THE Portal SHALL grant access to only the purchased subject
5. THE Portal SHALL allow students to purchase multiple individual subjects separately

### Requirement 4

**User Story:** As a student, I want the system to enforce access control based on my purchases, so that I only access subjects I've paid for.

#### Acceptance Criteria

1. WHEN a student navigates to the Home page, THE Portal SHALL display only the subjects the student has access to
2. WHEN a student attempts to access an exam without proper access, THE Portal SHALL redirect to the Plans page
3. THE Portal SHALL check access permissions before allowing exam start
4. THE Portal SHALL store purchased plan and subject information in the database
5. THE Portal SHALL retrieve and validate access permissions on every exam access attempt

### Requirement 5

**User Story:** As a student, I want to see my purchased plans and subjects on my profile, so that I can track what I have access to.

#### Acceptance Criteria

1. WHEN a student views their Profile page, THE Portal SHALL display all purchased plans with selected subjects
2. THE Portal SHALL show purchase dates and expiration dates for each plan
3. THE Portal SHALL display individually purchased subjects separately from plan purchases
4. THE Portal SHALL show the total number of subjects the student has access to
5. THE Portal SHALL allow students to view which subjects are included in each purchase

### Requirement 6

**User Story:** As a student, I want to complete payment for my selected plan and subjects, so that I can gain access to the exams.

#### Acceptance Criteria

1. WHEN a student confirms subject selection, THE Portal SHALL display a payment confirmation page
2. THE Portal SHALL show the total amount to be paid
3. THE Portal SHALL display the selected plan and subjects clearly
4. WHEN payment is successful, THE Portal SHALL grant access to the selected subjects
5. THE Portal SHALL store the purchase record in the database with all relevant details

### Requirement 7

**User Story:** As a student, I want to upgrade my plan or purchase additional subjects, so that I can access more content as needed.

#### Acceptance Criteria

1. WHEN a student with an existing plan views the Plans page, THE Portal SHALL show available upgrade options
2. THE Portal SHALL allow students to purchase additional individual subjects
3. THE Portal SHALL prevent duplicate purchases of the same subject
4. THE Portal SHALL calculate pricing for upgrades appropriately
5. THE Portal SHALL merge new purchases with existing access permissions
