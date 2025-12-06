# Design Document: Skeleton Loaders

## Overview

This design implements skeleton loading states across all major pages in the DMLT Academy Exam Portal. The solution leverages the existing Shadcn/UI Skeleton component as a foundation and extends it with specialized skeleton components that match the structure of actual content. The design focuses on maintaining visual consistency, smooth transitions, and responsive behavior while providing clear feedback during data loading operations.

## Architecture

### Component Hierarchy

```
src/components/
├── ui/
│   └── skeleton.tsx (existing base component)
└── skeletons/
    ├── ExamCardSkeleton.tsx
    ├── PlanCardSkeleton.tsx
    ├── HistoryCardSkeleton.tsx
    ├── StatCardSkeleton.tsx
    ├── ProfileHeaderSkeleton.tsx
    ├── PerformanceChartSkeleton.tsx
    └── ResultSkeleton.tsx
```

### Loading State Management

Each page component will manage its own loading state using React's `useState` hook:

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data from Supabase
      const data = await supabaseService.getData();
      setData(data);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, [dependencies]);
```

### Transition Strategy

All transitions from skeleton to actual content will use Framer Motion for smooth animations:

```typescript
<AnimatePresence mode="wait">
  {loading ? (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SkeletonComponent />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ActualContent />
    </motion.div>
  )}
</AnimatePresence>
```

## Components and Interfaces

### Base Skeleton Component (Existing)

The existing `Skeleton` component from Shadcn/UI provides the foundation:

```typescript
// src/components/ui/skeleton.tsx
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
```

**Properties:**
- Uses Tailwind's `animate-pulse` for pulsing animation
- Background color: `bg-muted` (matches design system)
- Rounded corners: `rounded-md`
- Accepts custom className for size/shape variations

### Specialized Skeleton Components

#### 1. ExamCardSkeleton

Mimics the structure of `ExamCard` component used on the Home page.

```typescript
// src/components/skeletons/ExamCardSkeleton.tsx
export const ExamCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      {/* Icon placeholder */}
      <Skeleton className="w-16 h-16 rounded-full" />
      
      {/* Title */}
      <Skeleton className="h-8 w-3/4" />
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      {/* Stats */}
      <div className="flex gap-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      
      {/* Button */}
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
};
```

**Usage:** Home page exam cards grid

#### 2. PlanCardSkeleton

Mimics subscription plan cards on the Home page.

```typescript
// src/components/skeletons/PlanCardSkeleton.tsx
export const PlanCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-6">
      {/* Plan name */}
      <Skeleton className="h-8 w-32 mx-auto" />
      
      {/* Description */}
      <Skeleton className="h-4 w-full" />
      
      {/* Price */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-12 w-24" />
      </div>
      
      {/* Features list */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Button */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
};
```

**Usage:** Home page plans section

#### 3. StatCardSkeleton

Mimics statistics cards used across multiple pages (History, Profile).

```typescript
// src/components/skeletons/StatCardSkeleton.tsx
export const StatCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 text-center space-y-3">
      {/* Icon */}
      <Skeleton className="w-10 h-10 rounded-full mx-auto" />
      
      {/* Value */}
      <Skeleton className="h-10 w-20 mx-auto" />
      
      {/* Label */}
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
};
```

**Usage:** History page summary, Profile page analytics

#### 4. HistoryCardSkeleton

Mimics exam history list items on the History page.

```typescript
// src/components/skeletons/HistoryCardSkeleton.tsx
export const HistoryCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          {/* Title */}
          <Skeleton className="h-6 w-48" />
          
          {/* Meta info */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {/* Score */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
          
          {/* Accuracy */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
          
          {/* Button */}
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="pt-4 border-t border-border/50">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
};
```

**Usage:** History page exam list

#### 5. ProfileHeaderSkeleton

Mimics the profile header section on the Profile page.

```typescript
// src/components/skeletons/ProfileHeaderSkeleton.tsx
export const ProfileHeaderSkeleton = () => {
  return (
    <div className="glass-card rounded-3xl p-8 neon-border">
      <div className="flex flex-wrap gap-8 items-center">
        {/* Avatar */}
        <Skeleton className="w-32 h-32 rounded-full" />
        
        <div className="flex-1 space-y-4">
          {/* Name */}
          <Skeleton className="h-10 w-64" />
          
          {/* Meta info */}
          <div className="flex gap-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* Rank badge */}
        <div className="text-center space-y-3">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>
    </div>
  );
};
```

**Usage:** Profile page header

#### 6. PerformanceChartSkeleton

Mimics the performance chart on the Profile page.

```typescript
// src/components/skeletons/PerformanceChartSkeleton.tsx
export const PerformanceChartSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-48" />
      
      {/* Chart items */}
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Usage:** Profile page performance section

#### 7. ResultSkeleton

Mimics the result page layout.

```typescript
// src/components/skeletons/ResultSkeleton.tsx
export const ResultSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <Skeleton className="w-32 h-32 rounded-full mx-auto" />
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
      
      {/* Score circle */}
      <div className="glass-card rounded-3xl p-12">
        <Skeleton className="w-64 h-64 rounded-full mx-auto" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-14 w-48 rounded-full" />
        <Skeleton className="h-14 w-48 rounded-full" />
      </div>
    </div>
  );
};
```

**Usage:** Result page

## Data Models

### Loading State Interface

```typescript
interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}
```

### Page-Specific Loading States

Each page will track its own loading state:

```typescript
// Home page
interface HomeLoadingState {
  examsLoading: boolean;
  plansLoading: boolean;
}

// Exam Details page
interface ExamDetailsLoadingState {
  examLoading: boolean;
  progressLoading: boolean;
}

// History page
interface HistoryLoadingState {
  historyLoading: boolean;
  analyticsLoading: boolean;
}

// Profile page
interface ProfileLoadingState {
  profileLoading: boolean;
  analyticsLoading: boolean;
  historyLoading: boolean;
  plansLoading: boolean;
}

// Result page
interface ResultLoadingState {
  resultLoading: boolean;
}
```

## Error Handling

### Error Display Strategy

When data loading fails, skeleton loaders will be replaced with error messages:

```typescript
{loading ? (
  <SkeletonComponent />
) : error ? (
  <div className="text-center py-12">
    <p className="text-lg text-destructive mb-4">
      Failed to load data. Please try again.
    </p>
    <button
      onClick={retryLoad}
      className="px-6 py-3 rounded-full gradient-primary text-white"
    >
      Retry
    </button>
  </div>
) : (
  <ActualContent />
)}
```

### Timeout Handling

If data loading takes longer than expected (>10 seconds), show a message:

```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    if (loading) {
      setSlowLoading(true);
    }
  }, 10000);
  
  return () => clearTimeout(timeout);
}, [loading]);

// In render:
{slowLoading && (
  <div className="text-center text-muted-foreground mt-4">
    This is taking longer than usual...
  </div>
)}
```

## Testing Strategy

### Visual Testing

1. **Skeleton Appearance**: Verify skeleton components match the layout of actual content
2. **Responsive Behavior**: Test skeleton components at different screen sizes (mobile, tablet, desktop)
3. **Animation**: Verify pulse animation is smooth and consistent
4. **Transitions**: Verify smooth fade transitions from skeleton to content

### Functional Testing

1. **Loading State**: Verify skeletons appear immediately when page loads
2. **Data Loading**: Verify skeletons are replaced with actual content when data loads
3. **Error Handling**: Verify error messages appear when data loading fails
4. **Retry Functionality**: Verify retry button reloads data and shows skeletons again

### Performance Testing

1. **Render Performance**: Verify skeleton components render quickly without lag
2. **Memory Usage**: Verify no memory leaks during skeleton display
3. **Animation Performance**: Verify pulse animation doesn't cause performance issues

## Implementation Details

### Page-Specific Implementations

#### Home Page

```typescript
const Home = () => {
  const { auth } = useAuth();
  const [examsLoading, setExamsLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay for exams
    setTimeout(() => setExamsLoading(false), 1000);
    setTimeout(() => setPlansLoading(false), 1200);
  }, []);
  
  return (
    <div>
      {/* Hero section - no skeleton needed */}
      <HeroSection />
      
      {/* Exams section */}
      <section>
        {examsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(5)].map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockExams.map((exam, index) => (
              <ExamCard key={exam.id} exam={exam} index={index} />
            ))}
          </div>
        )}
      </section>
      
      {/* Plans section */}
      <section>
        {plansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.slice(0, 3).map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
```

#### Exam Details Page

```typescript
const ExamDetails = () => {
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  
  useEffect(() => {
    const loadExam = async () => {
      setLoading(true);
      try {
        // Load exam data
        const data = await loadExamData();
        setExam(data);
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [examId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="glass-card rounded-lg p-8 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
          </div>
          
          {/* Question sets skeleton */}
          <div className="glass-card rounded-lg p-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </div>
          
          {/* Info cards skeleton */}
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  return <ActualExamDetailsContent />;
};
```

#### History Page

```typescript
const History = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const results = await supabaseService.getStudentExamResults(auth.user.phone);
        setHistory(results);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [auth]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          
          {/* History list */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <HistoryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return <ActualHistoryContent />;
};
```

#### Profile Page

```typescript
const Profile = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        // Load all profile data
        await Promise.all([
          loadStudentInfo(),
          loadAnalytics(),
          loadHistory(),
          loadPlans()
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [auth]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile header */}
          <ProfileHeaderSkeleton />
          
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          
          {/* Performance chart */}
          <PerformanceChartSkeleton />
          
          {/* Account info */}
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return <ActualProfileContent />;
};
```

#### Result Page

```typescript
const Result = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate result calculation
    setTimeout(() => setLoading(false), 1500);
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-6">
        <ResultSkeleton />
      </div>
    );
  }
  
  return <ActualResultContent />;
};
```

## Responsive Design

All skeleton components will be responsive using Tailwind's responsive utilities:

```typescript
// Example: Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
  {[...Array(count)].map((_, i) => (
    <SkeletonComponent key={i} />
  ))}
</div>

// Example: Responsive sizing
<Skeleton className="h-8 sm:h-10 lg:h-12 w-full" />
```

## Accessibility

Skeleton loaders will include proper ARIA attributes:

```typescript
<div
  role="status"
  aria-live="polite"
  aria-label="Loading content"
  className="space-y-4"
>
  <SkeletonComponent />
  <span className="sr-only">Loading...</span>
</div>
```

## Design Decisions

### 1. Use Existing Skeleton Component

**Decision**: Leverage the existing Shadcn/UI Skeleton component as the base.

**Rationale**: 
- Already integrated with the design system
- Consistent styling and animation
- Reduces code duplication
- Maintains design consistency

### 2. Specialized Skeleton Components

**Decision**: Create specialized skeleton components for each content type rather than generic skeletons.

**Rationale**:
- Better matches actual content structure
- Provides clearer visual feedback
- Easier to maintain and update
- More predictable user experience

### 3. Framer Motion for Transitions

**Decision**: Use Framer Motion for skeleton-to-content transitions.

**Rationale**:
- Already used throughout the application
- Provides smooth, professional animations
- Easy to implement and customize
- Consistent with existing animation patterns

### 4. Page-Level Loading States

**Decision**: Manage loading states at the page level rather than globally.

**Rationale**:
- Simpler state management
- Better performance (no unnecessary re-renders)
- Easier to debug and maintain
- More flexible for different loading scenarios

### 5. No Minimum Loading Time

**Decision**: Show actual content as soon as it's available, without artificial delays.

**Rationale**:
- Better perceived performance
- Respects user's time
- Skeleton loaders already provide visual feedback
- Fast loading is a feature, not a problem

## Future Enhancements

1. **Skeleton Variants**: Add different skeleton styles (shimmer, wave, etc.)
2. **Smart Skeletons**: Dynamically adjust skeleton count based on viewport size
3. **Progressive Loading**: Show partial content as it becomes available
4. **Skeleton Caching**: Cache skeleton layouts for faster subsequent loads
5. **Custom Animations**: Add more sophisticated animation options
