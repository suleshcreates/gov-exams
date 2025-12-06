# Requirements Document

## Introduction

The Plan Pricing System allows administrators to create and manage subscription plans with configurable pricing, subject access, and time limits. This system enables flexible plan creation where admins can set prices for individual subjects or create bundled plans (Basic, Premium) with multiple subjects and validity periods.

## Glossary

- **Plan Template**: A predefined plan configuration created by admin with pricing, subjects, and validity
- **Subject Pricing**: Individual price set for accessing a single subject's question sets
- **Basic Plan**: A bundled plan with limited subjects at a discounted price
- **Premium Plan**: A comprehensive plan with multiple subjects at a premium price
- **Validity Period**: The time duration for which a plan remains active
- **Plan Catalog**: The collection of available plans displayed to students on the main page

## Requirements

### Requirement 1: Subject Pricing Configuration

**User Story:** As an administrator, I want to set individual prices for subjects, so that students can purchase access to specific subjects.

#### Acceptance Criteria

1. WHEN an administrator accesses the pricing configuration, THE Admin Panel SHALL display all subjects with their current pricing
2. WHEN an administrator sets a price for a subject, THE Admin Panel SHALL allow input of price amount and validity period in days
3. THE Admin Panel SHALL validate that prices are positive numbers
4. WHEN an administrator saves subject pricing, THE Admin Panel SHALL persist the configuration to the database
5. THE Admin Panel SHALL display subject pricing on the student-facing Plans page

### Requirement 2: Plan Template Creation

**User Story:** As an administrator, I want to create plan templates (Basic, Premium, Custom), so that I can offer bundled packages to students.

#### Acceptance Criteria

1. WHEN an administrator creates a plan template, THE Admin Panel SHALL allow input of plan name, description, price, and validity period
2. WHEN an administrator selects subjects for a plan, THE Admin Panel SHALL display a multi-select interface with all available subjects
3. THE Admin Panel SHALL validate that at least one subject is selected for each plan
4. WHEN an administrator sets plan pricing, THE Admin Panel SHALL calculate and display the discount percentage compared to individual subject prices
5. THE Admin Panel SHALL allow setting plan visibility (active/inactive) to control display on student page

### Requirement 3: Plan Validity Management

**User Story:** As an administrator, I want to set validity periods for plans, so that students have time-limited access to content.

#### Acceptance Criteria

1. WHEN an administrator creates a plan, THE Admin Panel SHALL allow setting validity in days, months, or as lifetime access
2. THE Admin Panel SHALL validate that validity periods are positive integers or null for lifetime
3. WHEN a student purchases a plan, THE System SHALL calculate expiration date based on purchase date and validity period
4. THE System SHALL automatically deactivate plans when expiration date is reached
5. THE Admin Panel SHALL display remaining validity days for active user plans

### Requirement 4: Student-Facing Plan Display

**User Story:** As a student, I want to see available plans with pricing and features, so that I can choose the best option for my needs.

#### Acceptance Criteria

1. WHEN a student accesses the Plans page, THE System SHALL display all active plan templates with pricing and features
2. THE System SHALL display individual subject pricing alongside bundled plans
3. THE System SHALL highlight recommended plans or best value options
4. WHEN a student views plan details, THE System SHALL show included subjects, validity period, and total price
5. THE System SHALL display discount badges for bundled plans compared to individual purchases

### Requirement 5: Plan Purchase Integration

**User Story:** As a student, I want to purchase a plan, so that I can access the included subjects and question sets.

#### Acceptance Criteria

1. WHEN a student selects a plan, THE System SHALL display a purchase confirmation with plan details and price
2. WHEN a student completes payment, THE System SHALL create a user_plan record with selected plan details
3. THE System SHALL grant immediate access to all subjects included in the purchased plan
4. THE System SHALL set expiration date based on plan validity period
5. THE System SHALL send confirmation notification to student after successful purchase

### Requirement 6: Plan Analytics

**User Story:** As an administrator, I want to see plan purchase analytics, so that I can understand which plans are most popular.

#### Acceptance Criteria

1. WHEN an administrator accesses plan analytics, THE Admin Panel SHALL display total purchases per plan template
2. THE Admin Panel SHALL calculate and display total revenue per plan type
3. THE Admin Panel SHALL show conversion rates for each plan
4. THE Admin Panel SHALL display trending plans over time periods
5. THE Admin Panel SHALL allow filtering analytics by date range

### Requirement 7: Plan Modification

**User Story:** As an administrator, I want to modify existing plan templates, so that I can adjust pricing and features based on market conditions.

#### Acceptance Criteria

1. WHEN an administrator edits a plan template, THE Admin Panel SHALL allow modification of price, subjects, and validity
2. THE Admin Panel SHALL display warning when modifying active plans with existing subscribers
3. WHEN a plan is modified, THE System SHALL not affect existing user subscriptions
4. THE Admin Panel SHALL allow creating new versions of plans while keeping old ones for existing users
5. THE System SHALL log all plan modifications with timestamp and admin user

### Requirement 8: Discount and Promotion Management

**User Story:** As an administrator, I want to create promotional discounts, so that I can attract more students during special periods.

#### Acceptance Criteria

1. WHEN an administrator creates a discount, THE Admin Panel SHALL allow setting discount percentage or fixed amount
2. THE Admin Panel SHALL allow setting discount validity period with start and end dates
3. WHEN a discount is active, THE System SHALL display discounted price on Plans page
4. THE System SHALL validate that discount end date is after start date
5. THE Admin Panel SHALL allow limiting discounts to specific plans or all plans
