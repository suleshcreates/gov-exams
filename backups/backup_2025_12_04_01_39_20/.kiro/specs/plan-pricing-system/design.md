# Plan Pricing System Design Document

## Overview

The Plan Pricing System provides a comprehensive solution for managing subscription plans, pricing, and student access. It consists of admin-facing configuration tools and student-facing plan display and purchase interfaces.

## Architecture

### Database Schema

#### New Tables

**1. plan_templates**
```sql
CREATE TABLE plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  validity_days INTEGER, -- NULL for lifetime
  subjects JSONB NOT NULL, -- Array of subject IDs
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  badge TEXT, -- e.g., "POPULAR", "BEST VALUE"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. subject_pricing**
```sql
CREATE TABLE subject_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  validity_days INTEGER, -- NULL for lifetime
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(subject_id)
);
```

**3. plan_discounts**
```sql
CREATE TABLE plan_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  applicable_to JSONB, -- Array of plan_template IDs, NULL for all
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- NULL for unlimited
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Modified Tables

**user_plans** (add new fields)
```sql
ALTER TABLE user_plans ADD COLUMN plan_template_id UUID REFERENCES plan_templates(id);
ALTER TABLE user_plans ADD COLUMN discount_code VARCHAR(50);
ALTER TABLE user_plans ADD COLUMN original_price DECIMAL(10, 2);
ALTER TABLE user_plans ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
```

### Component Structure

```
src/
├── admin/
│   └── pages/
│       ├── PlanPricing.tsx          # Main pricing configuration page
│       ├── SubjectPricing.tsx       # Individual subject pricing
│       ├── PlanTemplates.tsx        # Manage plan templates
│       ├── PlanTemplateEditor.tsx   # Create/edit plan templates
│       └── PlanAnalytics.tsx        # Plan purchase analytics
├── pages/
│   └── Plans.tsx                    # Student-facing plans page (update)
└── components/
    ├── PlanCard.tsx                 # Individual plan display card
    └── PurchaseModal.tsx            # Plan purchase modal
```

## Components and Interfaces

### 1. Admin: Plan Pricing Dashboard

**Features:**
- Overview of all pricing configurations
- Quick stats (total plans, active plans, revenue)
- Navigation to subject pricing and plan templates

**Layout:**
```
┌─────────────────────────────────────────┐
│  Plan Pricing Management                │
├─────────────────────────────────────────┤
│  [Subject Pricing] [Plan Templates]     │
│                                          │
│  Quick Stats:                            │
│  • 5 Active Plans                        │
│  • ₹45,000 Total Revenue                 │
│  • 120 Active Subscriptions              │
└─────────────────────────────────────────┘
```

### 2. Admin: Subject Pricing

**Features:**
- List all subjects with current pricing
- Set price and validity for each subject
- Toggle active/inactive status
- Bulk pricing updates

**Interface:**
```typescript
interface SubjectPricing {
  id: string;
  subject_id: string;
  subject_name: string;
  price: number;
  validity_days: number | null;
  is_active: boolean;
}
```

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  Subject Pricing                         │
├─────────────────────────────────────────┤
│  Subject          Price    Validity      │
│  Mathematics      ₹199     30 days       │
│  [Edit] [Toggle]                         │
│                                          │
│  General Knowledge ₹149    60 days       │
│  [Edit] [Toggle]                         │
└─────────────────────────────────────────┘
```

### 3. Admin: Plan Template Editor

**Features:**
- Create/edit plan templates
- Select multiple subjects
- Set pricing and validity
- Add badges (Popular, Best Value)
- Preview how plan appears to students

**Form Fields:**
- Plan Name (e.g., "Basic Plan", "Premium Plan")
- Description
- Price (₹)
- Validity (days or lifetime)
- Subjects (multi-select)
- Badge (optional)
- Display Order
- Active Status

**Validation:**
- Price must be positive
- At least one subject required
- Validity must be positive or null
- Plan name must be unique

### 4. Student: Plans Page (Updated)

**Features:**
- Display all active plan templates
- Show individual subject pricing
- Highlight recommended plans
- Show discount badges
- Compare plans side-by-side
- Purchase button for each plan

**Layout:**
```
┌─────────────────────────────────────────┐
│  Choose Your Plan                        │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ BASIC    │  │ PREMIUM  │  │ SINGLE ││
│  │ ₹499     │  │ ₹999     │  │ ₹199   ││
│  │ 2 Subjects│  │ 5 Subjects│  │ 1 Sub  ││
│  │ 30 days  │  │ 90 days  │  │ 30 days││
│  │ [Buy Now]│  │ [Buy Now]│  │ [Buy]  ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────┘
```

### 5. Purchase Flow

**Steps:**
1. Student clicks "Buy Now" on a plan
2. Modal shows plan details and price
3. Apply discount code (optional)
4. Confirm purchase
5. Process payment (integration point)
6. Create user_plan record
7. Grant access to subjects
8. Show success message

**Purchase Modal Interface:**
```typescript
interface PurchaseData {
  plan_template_id?: string;
  subject_id?: string; // For individual subject purchase
  price: number;
  discount_code?: string;
  final_price: number;
}
```

## Data Flow

### Plan Creation Flow
```
Admin → PlanTemplateEditor → Validate → Save to DB → Update Plans Page
```

### Purchase Flow
```
Student → Select Plan → Apply Discount → Confirm → Payment → Create user_plan → Grant Access
```

### Access Validation Flow
```
Student → Access Exam → Check user_plans → Verify expiration → Allow/Deny
```

## API Endpoints (adminService)

```typescript
// Subject Pricing
getSubjectPricing(): Promise<SubjectPricing[]>
updateSubjectPricing(subjectId: string, data: PricingData): Promise<void>

// Plan Templates
getPlanTemplates(): Promise<PlanTemplate[]>
createPlanTemplate(data: PlanTemplateData): Promise<PlanTemplate>
updatePlanTemplate(id: string, data: PlanTemplateData): Promise<PlanTemplate>
deletePlanTemplate(id: string): Promise<void>

// Student-facing
getActivePlans(): Promise<PlanTemplate[]>
purchasePlan(data: PurchaseData): Promise<UserPlan>
applyDiscountCode(code: string, planId: string): Promise<DiscountInfo>

// Analytics
getPlanAnalytics(dateRange?: DateRange): Promise<Analytics>
```

## UI/UX Considerations

### Admin Interface
- Clean, table-based layout for pricing management
- Inline editing for quick updates
- Visual indicators for active/inactive status
- Preview mode to see student view

### Student Interface
- Card-based plan display
- Clear pricing and features
- Prominent "Buy Now" buttons
- Comparison table for plans
- Trust indicators (popular, best value badges)

### Responsive Design
- Mobile-friendly plan cards
- Stack plans vertically on mobile
- Touch-friendly buttons
- Simplified comparison on small screens

## Security Considerations

1. **Price Validation**
   - Server-side validation of all prices
   - Prevent negative or zero prices
   - Validate discount calculations

2. **Access Control**
   - Only admins can modify pricing
   - Students can only view active plans
   - Validate plan ownership before granting access

3. **Payment Security**
   - Secure payment gateway integration
   - Transaction logging
   - Prevent duplicate purchases

## Performance Optimization

1. **Caching**
   - Cache active plans for student page
   - Invalidate cache on plan updates
   - Cache subject pricing

2. **Database Indexes**
   - Index on plan_templates.is_active
   - Index on user_plans.student_id
   - Index on user_plans.expires_at

3. **Query Optimization**
   - Fetch plans with subjects in single query
   - Use pagination for analytics
   - Aggregate queries for statistics

## Testing Strategy

### Unit Tests
- Price calculation logic
- Discount application
- Validity period calculations
- Access validation

### Integration Tests
- Plan creation workflow
- Purchase flow
- Access granting
- Expiration handling

### E2E Tests
- Complete purchase journey
- Admin plan creation
- Student plan selection and purchase
- Access verification after purchase
