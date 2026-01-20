import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ExamDetails from "./pages/ExamDetails";
import ExamInstructions from "./pages/ExamInstructions";
import ExamStart from "./pages/ExamStart";
import Result from "./pages/Result";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ExamReview from "./pages/ExamReview";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Plans from "./pages/Plans";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ContactUs from "./pages/ContactUs";
import AuthErrorBoundary from "./components/AuthErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Admin imports
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import Students from "./admin/pages/Students";
import StudentDetail from "./admin/pages/StudentDetail";
import Subjects from "./admin/pages/Subjects";
import SubjectDetail from "./admin/pages/SubjectDetail";
import AdminTopics from "./admin/pages/AdminTopics";
import QuestionSetEditor from "./admin/pages/QuestionSetEditor";
import QuestionManager from "./admin/pages/QuestionManager";
import ExamResults from "./admin/pages/ExamResults";
import UserPlans from "./admin/pages/UserPlans";
import SubjectPricing from "./admin/pages/SubjectPricing";
import PlanTemplates from "./admin/pages/PlanTemplates";
import PlanTemplateEditor from "./admin/pages/PlanTemplateEditor";
import BulkImportQuestions from "./admin/pages/BulkImportQuestions";
import SupabaseTest from "./admin/pages/SupabaseTest";

// ✅ helper component to handle navbar & footer visibility based on route
const AppContent = () => {
  const location = useLocation();

  // Hide navbar & footer on exam start route and admin routes
  const hideLayout = /^\/exam\/[^/]+\/start\/[^/]+$/.test(location.pathname) || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {!hideLayout && <Navbar />} {/* 👈 Hide Navbar on ExamStart and Admin */}
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Policy Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />

          {/* Public Home Page */}
          <Route path="/" element={<Home />} />

          {/* Protected Routes - Require complete profile */}
          <Route path="/exam/:examId" element={<ProtectedRoute><ExamDetails /></ProtectedRoute>} />
          <Route path="/exam/:examId/instructions/:setId" element={<ProtectedRoute><ExamInstructions /></ProtectedRoute>} />
          <Route path="/exam/:examId/start/:setId" element={<ProtectedRoute><ExamStart /></ProtectedRoute>} />
          <Route path="/result/:examId/:setId" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/review/:resultId" element={<ProtectedRoute><ExamReview /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/test" element={<SupabaseTest />} />
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/students" element={<AdminLayout><Students /></AdminLayout>} />
          <Route path="/admin/students/:email" element={<AdminLayout><StudentDetail /></AdminLayout>} />
          <Route path="/admin/subjects" element={<AdminLayout><Subjects /></AdminLayout>} />
          <Route path="/admin/subjects/:subjectId" element={<AdminLayout><SubjectDetail /></AdminLayout>} />
          <Route path="/admin/subjects/:subjectId/topics" element={<AdminLayout><AdminTopics /></AdminLayout>} />
          <Route path="/admin/subjects/:subjectId/question-sets/:setId" element={<AdminLayout><QuestionSetEditor /></AdminLayout>} />
          <Route path="/admin/subjects/:subjectId/question-sets/:setId/bulk-import" element={<AdminLayout><BulkImportQuestions /></AdminLayout>} />
          <Route path="/admin/question-sets/:setId/questions" element={<AdminLayout><QuestionManager /></AdminLayout>} />
          <Route path="/admin/exam-results" element={<AdminLayout><ExamResults /></AdminLayout>} />
          <Route path="/admin/user-plans" element={<AdminLayout><UserPlans /></AdminLayout>} />
          <Route path="/admin/pricing/subjects" element={<AdminLayout><SubjectPricing /></AdminLayout>} />
          <Route path="/admin/pricing/plans" element={<AdminLayout><PlanTemplates /></AdminLayout>} />
          <Route path="/admin/pricing/plans/new" element={<AdminLayout><PlanTemplateEditor /></AdminLayout>} />
          <Route path="/admin/pricing/plans/:planId/edit" element={<AdminLayout><PlanTemplateEditor /></AdminLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!hideLayout && <Footer />} {/* 👈 Hide Footer on ExamStart and Admin */}
    </div>
  );
};

const App = () => (
  <>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthErrorBoundary>
        <AuthProvider>
          <AdminAuthProvider>
            <AppContent />
          </AdminAuthProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </BrowserRouter>
  </>
);

export default App;
