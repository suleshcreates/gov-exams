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
import TopicLearningConsole from "./pages/TopicLearningConsole";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ExamReview from "./pages/ExamReview";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";
import Plans from "./pages/Plans";
import Exams from "./pages/Exams";
import PYQ from "./pages/PYQ";
import PYQDetail from "./pages/PYQDetail";
import SecurePDFViewer from "./pages/SecurePDFViewer";
import SpecialExamDetail from "./pages/SpecialExamDetail";
import SpecialExamFinalResult from "./pages/SpecialExamFinalResult";
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
import AdminSpecialExams from "./admin/pages/AdminSpecialExams";
import AdminSpecialExamSets from "./admin/pages/AdminSpecialExamSets";
import AdminCategoryPlans from "./admin/pages/AdminCategoryPlans";
import AdminPYQ from "./admin/pages/AdminPYQ";
import AdminTopicsTab from "./admin/pages/AdminTopicsTab";
import AdminSubjectContent from "./admin/pages/AdminSubjectContent";
import AdminMessages from "./admin/pages/AdminMessages";
import SupabaseTest from "./admin/pages/SupabaseTest";

import { useEffect } from "react";
import { useSiteProtection } from "./hooks/useSiteProtection";

// ✅ helper component to handle navbar & footer visibility based on route
const AppContent = () => {
  useSiteProtection(); // 🛡️ Activates global site security
  const location = useLocation();

  // Hide navbar & footer on exam start route and admin routes
  const hideLayout = /^\/exam\/[^/]+\/start\/[^/]+$/.test(location.pathname) ||
    /^\/exam\/[^/]+\/topic\/[^/]+$/.test(location.pathname) || // Also hide for Learning Console
    location.pathname.startsWith('/hq') ||
    location.pathname.startsWith('/secure-viewer');

  // Scroll to hash fragment (e.g. /#contact-form)
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {!hideLayout && <Navbar />} {/* 👈 Hide Navbar on ExamStart, LearningConsole and Admin */}
      <AuthModal />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Policy Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />

          {/* Public Home Page */}
          <Route path="/" element={<Home />} />

          {/* Protected Routes - Require complete profile */}
          <Route path="/exam/:examId" element={<ProtectedRoute><ExamDetails /></ProtectedRoute>} />
          <Route path="/exam/:examId/topic/:topicId" element={<ProtectedRoute><TopicLearningConsole /></ProtectedRoute>} />
          <Route path="/exam/:examId/instructions/:setId" element={<ProtectedRoute><ExamInstructions /></ProtectedRoute>} />
          <Route path="/exam/:examId/start/:setId" element={<ProtectedRoute><ExamStart /></ProtectedRoute>} />
          <Route path="/result/:examId/:setId" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/review/:resultId" element={<ProtectedRoute><ExamReview /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/special-exam/:id" element={<ProtectedRoute><SpecialExamDetail /></ProtectedRoute>} />
          <Route path="/special-exam/:examId/final-result" element={<ProtectedRoute><SpecialExamFinalResult /></ProtectedRoute>} />
          <Route path="/pyq" element={<ProtectedRoute><PYQ /></ProtectedRoute>} />
          <Route path="/pyq/:id" element={<ProtectedRoute><PYQDetail /></ProtectedRoute>} />
          <Route path="/secure-viewer/:id" element={<ProtectedRoute><SecurePDFViewer /></ProtectedRoute>} />
          <Route path="/secure-viewer/topic/:id" element={<ProtectedRoute><SecurePDFViewer type="topic" /></ProtectedRoute>} />
          <Route path="/secure-viewer/material/:id" element={<ProtectedRoute><SecurePDFViewer type="material" /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/hq/login" element={<AdminLogin />} />
          <Route path="/hq/test" element={<SupabaseTest />} />
          <Route path="/hq/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/hq/students" element={<AdminLayout><Students /></AdminLayout>} />
          <Route path="/hq/students/:email" element={<AdminLayout><StudentDetail /></AdminLayout>} />
          <Route path="/hq/subjects" element={<AdminLayout><Subjects /></AdminLayout>} />
          <Route path="/hq/subjects/:subjectId" element={<AdminLayout><SubjectDetail /></AdminLayout>} />
          <Route path="/hq/subjects/:subjectId/topics" element={<AdminLayout><AdminTopics /></AdminLayout>} />
          <Route path="/hq/subjects/:subjectId/question-sets/:setId" element={<AdminLayout><QuestionSetEditor /></AdminLayout>} />
          <Route path="/hq/subjects/:subjectId/question-sets/:setId/bulk-import" element={<AdminLayout><BulkImportQuestions /></AdminLayout>} />
          <Route path="/hq/question-sets/:setId/questions" element={<AdminLayout><QuestionManager /></AdminLayout>} />
          <Route path="/hq/exam-results" element={<AdminLayout><ExamResults /></AdminLayout>} />
          <Route path="/hq/user-plans" element={<AdminLayout><UserPlans /></AdminLayout>} />
          <Route path="/hq/pricing/subjects" element={<AdminLayout><SubjectPricing /></AdminLayout>} />
          <Route path="/hq/pricing/plans" element={<AdminLayout><PlanTemplates /></AdminLayout>} />
          <Route path="/hq/pricing/plans/new" element={<AdminLayout><PlanTemplateEditor /></AdminLayout>} />
          <Route path="/hq/pricing/plans/:planId/edit" element={<AdminLayout><PlanTemplateEditor /></AdminLayout>} />
          <Route path="/hq/special-exams" element={<AdminLayout><AdminSpecialExams /></AdminLayout>} />
          <Route path="/hq/special-exams/:examId/sets" element={<AdminLayout><AdminSpecialExamSets /></AdminLayout>} />
          <Route path="/hq/category-plans" element={<AdminLayout><AdminCategoryPlans /></AdminLayout>} />
          <Route path="/hq/pyq" element={<AdminLayout><AdminPYQ /></AdminLayout>} />
          <Route path="/hq/topics" element={<AdminLayout><AdminTopicsTab /></AdminLayout>} />
          <Route path="/hq/subject-content" element={<AdminLayout><AdminSubjectContent /></AdminLayout>} />
          <Route path="/hq/messages" element={<AdminLayout><AdminMessages /></AdminLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      {!hideLayout && <Footer />} {/* 👈 Hide Footer on ExamStart, LearningConsole and Admin */}
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
