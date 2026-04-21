# Design Document: Plan Purchase System with Subject Selection

## Overview

This design implements a comprehensive plan purchase system that enforces proper access control based on purchased plans and selected subjects. The system allows users to select specific subjects when purchasing plans (except Master Plan which includes all subjects), purchase individual subjects without plans, and properly restricts access to only purchased content.

## Architecture

### System Flow

```
User Views Plans
    ↓
Selects Plan/Subject
    ↓
Subject Selection Modal (if plan requires selection)
    ↓
Payment Confirmation
    ↓
Database Update (user_plans table)
    ↓
Access Granted
    ↓
Home Page Shows Only Accessible Subjects
```

### Component Architecture

```
src/
├── components/
│   ├── SubjectSelectionModal.tsx (NEW)
│   ├── PaymentConfirmationModal.tsx (NEW)
│   └── IndividualSubjectCard.tsx (NEW)
├── lib/
│   ├── planUtils.ts (NEW - access control logic)
│   └── supabaseService.ts (UPDATED - new methods)
├── pages/
│   ├── Plans.tsx (UPDATED - subject selection)
│   ├── Home.tsx (UPDATED - filtered subjects)
│   └── ExamDetails.tsx (UPDATED - access check)
└── data/
    └── mockData.ts (UPDATED - plan structure)
```

## Components and Interfaces

### 1. SubjectSelectionModal Component

Modal that appears when user clicks to purchase a plan (except Master Plan).

```typescript
interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  onConfirm: (selectedSubjects: string[]) => void;
}

export const SubjectSelectionModal = ({
  isOpen,
  onClose,
  plan,
  onConfirm
}: SubjectSelectionModalProps) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const maxSubjects = plan.examIds.length;
  
  const handleToggleSubject = (examId: string) => {
    if (selectedSubjects.includes(examId)) {
      setSelectedSubjects(prev => prev.filter(id => id !== examId));
    } else if (selectedSubjects.length < maxSubjects) {
      setSelectedSubjects(prev => [...prev, examId]);
    }
  };
  
  const canConfirm = selectedSubjects.length === maxSubjects;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Your Subjects</DialogTitle>
          <DialogDescription>
            Choose {maxSubjects} subject{maxSubjects > 1 ? 's' : ''} for your {plan.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedSubjects.length} / {maxSubjects}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(selectedSubjects.length / maxSubjects) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Subject selection grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockExams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => handleToggleSubject(exam.id)}
                disabled={!selectedSubjects.includes(exam.id) && selectedSubjects.length >= maxSubjects}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedSubjects.includes(exam.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedSubjects.includes(exam.id)
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {selectedSubjects.includes(exam.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{exam.title}</h4>
                    <p className="text-sm text-muted-foreground">{exam.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => onConfirm(selectedSubjects)}
            disabled={!canConfirm}
          >
            Continue to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 2. PaymentConfirmationModal Component

Shows payment summary before final purchase.

```typescript
interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan;
  selectedSubjects?: string[];
  individualSubject?: Exam;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const PaymentConfirmationModal = ({
  isOpen,
  onClose,
  plan,
  selectedSubjects,
  individualSubject,
  onConfirm,
  isProcessing
}: PaymentConfirmationModalProps) => {
  const getSubjectNames = () => {
    if (individualSubject) return [individualSubject.title];
    if (selectedSubjects) {
      return mockExams
        .filter(exam => selectedSubjects.includes(exam.id))
        .map(exam => exam.title);
    }
    return [];
  };
  
  const price = individualSubject ? individualSubject.price : plan?.price || 0;
  const subjects = getSubjectNames();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Review your purchase details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Plan/Subject Info */}
          <div className="glass-card p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              {plan ? plan.name : 'Individual Subject'}
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Subjects:</p>
              <ul className="space-y-1">
                {subjects.map((subject, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    {subject}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold gradient-text">₹{price}</span>
          </div>
          
          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center">
            By confirming, you agree to our terms and conditions. This is a one-time payment with lifetime access.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              'Confirm Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 3. IndividualSubjectCard Component

Card for purchasing individual subjects.

```typescript
interface IndividualSubjectCardProps {
  exam: Exam;
  hasPurchased: boolean;
  onPurchase: (exam: Exam) => void;
  isProcessing: boolean;
}

export const IndividualSubjectCard = ({
  exam,
  hasPurchased,
  onPurchase,
  isProcessing
}: IndividualSubjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 border-2 border-border hover:border-primary transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
          <p className="text-sm text-muted-foreground">{exam.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IndianRupee className="w-5 h-5 text-primary" />
          <span className="text-2xl font-bold gradient-text">{exam.price}</span>
        </div>
        
        <button
          onClick={() => onPurchase(exam)}
          disabled={hasPurchased || isProcessing}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            hasPurchased
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'gradient-primary text-white hover:opacity-90'
          } disabled:opacity-50`}
        >
          {hasPurchased ? (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Purchased
            </div>
          ) : (
            'Purchase'
          )}
        </button>
      </div>
    </motion.div>
  );
};
```

## Data Models

### Updated SubscriptionPlan Interface

```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  subjectCount: number; // Number of subjects user can select
  features: string[];
  isPopular?: boolean;
  isMaster?: boolean;
  requiresSelection: boolean; // True if user needs to select subjects
}
```

### Updated user_plans Table Schema

```sql
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_phone VARCHAR(20) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  plan_id VARCHAR(255), -- NULL for individual purchases
  plan_name VARCHAR(255), -- NULL for individual purchases
  price_paid INTEGER NOT NULL,
  exam_ids TEXT[] NOT NULL, -- Array of selected subject IDs
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lifetime access
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (student_phone) REFERENCES students(phone) ON DELETE CASCADE
);

CREATE INDEX idx_user_plans_student ON user_plans(student_phone);
CREATE INDEX idx_user_plans_active ON user_plans(is_active);
```

### Purchase Record Interface

```typescript
interface PurchaseRecord {
  id: string;
  student_phone: string;
  student_name: string;
  plan_id: string | null; // null for individual purchases
  plan_name: string | null;
  price_paid: number;
  exam_ids: string[]; // Selected subjects
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
}
```

## Access Control Logic

### planUtils.ts

```typescript
import { supabaseService } from './supabaseService';

export const planUtils = {
  /**
   * Check if user has access to a specific exam
   */
  async hasExamAccess(studentPhone: string, examId: string): Promise<boolean> {
    try {
      const plans = await supabaseService.getActiveStudentPlans(studentPhone);
      return plans.some(plan => plan.exam_ids.includes(examId));
    } catch (error) {
      console.error('Error checking exam access:', error);
      return false;
    }
  },

  /**
   * Get all accessible exam IDs for a user
   */
  async getAccessibleExams(studentPhone: string): Promise<string[]> {
    try {
      const plans = await supabaseService.getActiveStudentPlans(studentPhone);
      const examIds = new Set<string>();
      
      plans.forEach(plan => {
        plan.exam_ids.forEach(id => examIds.add(id));
      });
      
      return Array.from(examIds);
    } catch (error) {
      console.error('Error getting accessible exams:', error);
      return [];
    }
  },

  /**
   * Check if user has already purchased a specific subject
   */
  async hasSubjectPurchased(studentPhone: string, examId: string): Promise<boolean> {
    return this.hasExamAccess(studentPhone, examId);
  },

  /**
   * Get purchased plans with details
   */
  async getPurchasedPlansWithDetails(studentPhone: string) {
    try {
      const plans = await supabaseService.getActiveStudentPlans(studentPhone);
      return plans.map(plan => ({
        ...plan,
        subjectNames: mockExams
          .filter(exam => plan.exam_ids.includes(exam.id))
          .map(exam => exam.title)
      }));
    } catch (error) {
      console.error('Error getting purchased plans:', error);
      return [];
    }
  }
};
```

## Updated Supabase Service Methods

```typescript
// Add to supabaseService object

async savePlanPurchase(data: {
  student_phone: string;
  student_name?: string;
  plan_id: string | null;
  plan_name: string | null;
  price_paid: number;
  exam_ids: string[];
  expires_at?: string | null;
}) {
  // Get student name if not provided
  if (!data.student_name) {
    const student = await this.getStudentByPhone(data.student_phone);
    if (student) {
      data.student_name = student.name;
    }
  }

  const { data: plan, error } = await supabase
    .from('user_plans')
    .insert([{
      ...data,
      is_active: true,
    }])
    .select()
    .single();

  if (error) throw error;
  return plan;
},

async getActiveStudentPlans(phone: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('user_plans')
    .select('*')
    .eq('student_phone', phone)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt."${now}"`)
    .order('purchased_at', { ascending: false });

  if (error) throw error;
  return data || [];
},

async hasExamAccess(phone: string, examId: string): Promise<boolean> {
  const plans = await this.getActiveStudentPlans(phone);
  return plans.some(plan => plan.exam_ids.includes(examId));
}
```

## Page Updates

### Plans Page Flow

1. **Display Plans**: Show all subscription plans with subject counts
2. **Plan Click**: 
   - If Master Plan → Skip to payment confirmation
   - If other plan → Show subject selection modal
3. **Subject Selection**: User selects required number of subjects
4. **Payment Confirmation**: Show summary and confirm
5. **Process Payment**: Save to database and grant access
6. **Individual Subjects Section**: Display all subjects with individual purchase option

### Home Page Updates

Filter displayed exams based on user's access:

```typescript
const Home = () => {
  const { auth } = useAuth();
  const [accessibleExams, setAccessibleExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAccessibleExams = async () => {
      if (!auth.isAuthenticated || !auth.user) {
        setAccessibleExams([]);
        setLoading(false);
        return;
      }
      
      try {
        const examIds = await planUtils.getAccessibleExams(auth.user.phone);
        const exams = mockExams.filter(exam => examIds.includes(exam.id));
        setAccessibleExams(exams);
      } catch (error) {
        console.error('Error loading accessible exams:', error);
        setAccessibleExams([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAccessibleExams();
  }, [auth]);
  
  return (
    // ... render only accessibleExams
  );
};
```

### ExamDetails Page Updates

Add access check before allowing exam start:

```typescript
const ExamDetails = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!auth.user || !examId) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
      }
      
      const access = await planUtils.hasExamAccess(auth.user.phone, examId);
      setHasAccess(access);
      setCheckingAccess(false);
    };
    
    checkAccess();
  }, [auth.user, examId]);
  
  const handleStartExam = () => {
    if (!hasAccess) {
      toast({
        title: "Access Required",
        description: "Please purchase a plan to access this exam.",
        variant: "destructive",
      });
      navigate("/plans");
      return;
    }
    
    // Continue with exam start
  };
};
```

## Updated mockData.ts

```typescript
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan-basic",
    name: "Basic Plan",
    description: "Choose any 2 subjects",
    price: 499,
    originalPrice: 598,
    discount: 17,
    subjectCount: 2,
    requiresSelection: true,
    features: [
      "Choose Any 2 Subjects",
      "5 Question Sets per Subject",
      "20 MCQs per Set",
      "Bilingual Support",
      "Instant Results",
      "Exam History",
    ],
  },
  {
    id: "plan-premium",
    name: "Premium Plan",
    description: "Choose any 4 subjects",
    price: 899,
    originalPrice: 1196,
    discount: 25,
    subjectCount: 4,
    requiresSelection: true,
    features: [
      "Choose Any 4 Subjects",
      "5 Question Sets per Subject",
      "20 MCQs per Set",
      "Bilingual Support",
      "Instant Results",
      "Detailed Analytics",
      "Exam History",
      "Priority Support",
    ],
    isPopular: true,
  },
  {
    id: "plan-master",
    name: "Master Plan",
    description: "All 5 subjects included",
    price: 999,
    originalPrice: 1445,
    discount: 31,
    subjectCount: 5,
    requiresSelection: false, // No selection needed - all subjects included
    features: [
      "All 5 Subjects Included",
      "5 Question Sets per Subject",
      "20 MCQs per Set",
      "Bilingual Support",
      "Instant Results",
      "Detailed Analytics",
      "Complete Exam History",
      "Priority Support",
      "Best Value",
    ],
    isMaster: true,
  },
];
```

## Error Handling

### Access Denied Scenarios

1. **Exam Access Without Purchase**:
   - Redirect to Plans page
   - Show toast: "Please purchase a plan to access this exam"

2. **Duplicate Purchase Attempt**:
   - Disable purchase button
   - Show "Already Purchased" status

3. **Database Error**:
   - Show error toast
   - Log error for debugging
   - Fallback to localStorage if available

### Payment Failure Handling

```typescript
try {
  await supabaseService.savePlanPurchase(purchaseData);
  // Success handling
} catch (error) {
  console.error('Purchase failed:', error);
  toast({
    title: "Purchase Failed",
    description: "Unable to process your purchase. Please try again.",
    variant: "destructive",
  });
  // Rollback any local state changes
}
```

## Testing Strategy

### Access Control Tests

1. **Test Plan Purchase**: Verify correct subjects are granted access
2. **Test Individual Purchase**: Verify single subject access
3. **Test Access Restriction**: Verify users cannot access unpurchased subjects
4. **Test Subject Selection**: Verify correct number of subjects can be selected
5. **Test Master Plan**: Verify all subjects are accessible

### UI Tests

1. **Subject Selection Modal**: Test selection limits and UI feedback
2. **Payment Confirmation**: Test display of correct information
3. **Home Page Filtering**: Test only accessible exams are shown
4. **Plans Page**: Test purchase flow for all plan types

## Design Decisions

### 1. Subject Selection Required for Non-Master Plans

**Decision**: Users must select specific subjects when purchasing Basic and Premium plans.

**Rationale**:
- Gives users control over their learning path
- Prevents wasted access to unwanted subjects
- Encourages thoughtful purchase decisions
- Increases perceived value of Master Plan

### 2. Master Plan Includes All Subjects Automatically

**Decision**: Master Plan grants access to all subjects without selection.

**Rationale**:
- Simplifies purchase flow for comprehensive plan
- Positions Master Plan as premium offering
- Reduces friction for users wanting full access
- Clear value proposition

### 3. Individual Subject Purchase Option

**Decision**: Allow purchasing single subjects outside of plans.

**Rationale**:
- Flexibility for users needing only one subject
- Lower barrier to entry
- Can lead to future plan upgrades
- Competitive with individual pricing

### 4. Lifetime Access Model

**Decision**: One-time payment with lifetime access (no subscriptions).

**Rationale**:
- Simpler for educational content
- Better user experience (no recurring charges)
- Easier to implement initially
- Can add subscription model later if needed

### 5. Database-First Access Control

**Decision**: Store all purchases in Supabase, use database as source of truth.

**Rationale**:
- Centralized access control
- Prevents localStorage manipulation
- Enables cross-device access
- Supports future features (admin panel, analytics)

## Future Enhancements

1. **Plan Upgrades**: Allow users to upgrade from Basic to Premium/Master
2. **Subject Swapping**: Allow changing selected subjects (with limitations)
3. **Gift Plans**: Enable purchasing plans for others
4. **Bulk Discounts**: Institutional pricing for multiple users
5. **Time-Limited Plans**: Add subscription-based pricing options
6. **Referral System**: Discount for referring other students
