# Implementation Plan

- [x] 1. Set up database schema



  - Create plan_templates table
  - Create subject_pricing table
  - Create plan_discounts table
  - Add new columns to user_plans table
  - Create indexes for performance
  - _Requirements: 1.1, 2.1, 3.1, 8.1_

- [ ] 2. Create admin pricing service methods
- [x] 2.1 Implement subject pricing methods


  - Write getSubjectPricing() to fetch all subject pricing
  - Write updateSubjectPricing() to update individual subject prices
  - Write toggleSubjectPricingStatus() to activate/deactivate
  - _Requirements: 1.1, 1.2, 1.4_


- [ ] 2.2 Implement plan template methods
  - Write getPlanTemplates() to fetch all plan templates
  - Write createPlanTemplate() to create new plans
  - Write updatePlanTemplate() to modify existing plans
  - Write deletePlanTemplate() to remove plans


  - _Requirements: 2.1, 2.2, 2.5, 7.1_

- [ ] 2.3 Implement discount methods
  - Write createDiscount() to create discount codes
  - Write applyDiscountCode() to validate and apply discounts



  - Write getActiveDiscounts() to fetch current promotions
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 3. Build admin subject pricing page
- [x] 3.1 Create SubjectPricing component


  - Display table of all subjects with pricing
  - Add inline edit functionality for price and validity
  - Implement toggle for active/inactive status
  - Add save/cancel actions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [ ] 4. Build admin plan template management
- [ ] 4.1 Create PlanTemplates list page
  - Display grid/list of all plan templates
  - Show plan details (name, price, subjects, validity)
  - Add create new plan button
  - Implement edit and delete actions
  - _Requirements: 2.1, 2.5, 7.1_




- [ ] 4.2 Create PlanTemplateEditor component
  - Build form with plan name, description, price fields
  - Add multi-select for subjects

  - Implement validity period selector (days or lifetime)
  - Add badge selector (Popular, Best Value, etc.)
  - Add display order input
  - Implement form validation
  - Add preview mode to see student view
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2_



- [ ] 5. Update student Plans page
- [ ] 5.1 Fetch and display plan templates
  - Call API to get active plan templates
  - Fetch subject pricing for individual purchases
  - Sort plans by display_order
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 Create PlanCard component
  - Design card layout with plan details
  - Display price, validity, and included subjects
  - Show badge if present (Popular, Best Value)
  - Add "Buy Now" button
  - Highlight recommended plans
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.3 Implement plan comparison
  - Create comparison table view
  - Show features side-by-side
  - Calculate and display savings for bundled plans
  - _Requirements: 4.4, 2.4_

- [ ] 6. Implement purchase flow
- [ ] 6.1 Create PurchaseModal component
  - Display selected plan details
  - Show price breakdown
  - Add discount code input field
  - Implement discount validation and application
  - Show final price after discount
  - Add confirm purchase button
  - _Requirements: 5.1, 5.2, 8.3_

- [ ] 6.2 Implement purchase processing
  - Create purchasePlan() service method
  - Validate plan availability and pricing
  - Create user_plan record with plan_template_id
  - Calculate and set expiration date based on validity
  - Grant access to all included subjects
  - Handle payment integration (placeholder for now)
  - _Requirements: 5.2, 5.3, 5.4, 3.2_

- [ ] 6.3 Add purchase confirmation
  - Show success message with plan details
  - Display expiration date
  - Provide link to access exams
  - Send confirmation (console log for now)
  - _Requirements: 5.5_

- [ ] 7. Implement plan analytics
- [ ] 7.1 Create PlanAnalytics page
  - Display total purchases per plan template
  - Show revenue breakdown by plan
  - Calculate and display conversion rates
  - Add date range filter
  - Show trending plans chart
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Add discount management
- [ ] 8.1 Create DiscountManagement page
  - Display list of all discount codes
  - Show discount details (code, value, validity, usage)
  - Add create new discount button
  - Implement edit and delete actions
  - _Requirements: 8.1, 8.2, 8.5_

- [ ] 8.2 Create DiscountEditor component
  - Build form with code, type, value fields
  - Add date range picker for validity
  - Implement plan selection (specific or all)
  - Add usage limit input
  - Validate discount configuration
  - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [ ] 9. Update navigation and routing
  - Add "Pricing" link to admin sidebar
  - Create routes for all new admin pages
  - Update student Plans page route
  - _Requirements: All_

- [ ] 10. Implement access validation
- [ ] 10.1 Update exam access check
  - Modify access validation to check user_plans
  - Verify plan includes requested subject
  - Check plan expiration date
  - Handle expired plans gracefully
  - _Requirements: 3.3, 3.4, 5.3_

- [ ] 11. Add plan expiration handling
- [ ] 11.1 Create expiration notification system
  - Check for plans expiring soon (7 days, 1 day)
  - Display warnings to students
  - Send expiration notifications
  - _Requirements: 3.4, 3.5_

- [ ] 11.2 Implement auto-deactivation
  - Create background job to check expired plans
  - Automatically set is_active to false for expired plans
  - Log expiration events
  - _Requirements: 3.4_

- [ ] 12. Add plan modification tracking
  - Log all plan template changes
  - Track who made changes and when
  - Display modification history in admin panel
  - _Requirements: 7.5_

- [ ] 13. Implement plan versioning
  - Create plan_template_versions table
  - Store historical versions of plans
  - Ensure existing subscriptions use original plan details
  - _Requirements: 7.3, 7.4_

- [ ] 14. Add bulk operations
  - Implement bulk price updates for subjects
  - Add bulk plan activation/deactivation
  - Create bulk discount application
  - _Requirements: 1.1, 2.5, 8.5_

- [ ] 15. Performance optimization
  - Add caching for active plans
  - Implement cache invalidation on updates
  - Add database indexes
  - Optimize plan fetching queries
  - _Requirements: All_
