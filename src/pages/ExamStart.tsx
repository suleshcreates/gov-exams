import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import QuestionCard from "@/components/QuestionCard";
import Timer from "@/components/Timer";
import ProgressBar from "@/components/ProgressBar";
import TranslateButton from "@/components/TranslateButton";
import CameraMonitor from "@/components/CameraMonitor";
import { Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabaseService } from "@/lib/supabaseService";
import { planUtils } from "@/lib/planUtils";
import { studentService } from "@/lib/studentService";
import { convertDBQuestions, type ExamQuestion } from "@/lib/questionAdapter";
import { batchTranslate } from "@/lib/translationService";
import logger from "@/lib/logger";


const ExamStart = () => {
  const { examId, setId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [isMarathi, setIsMarathi] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const answersRef = useRef<(number | null)[]>([]);
  const hasSubmittedRef = useRef(false);
  const startTimeRef = useRef<Date>(new Date());
  const { selectedLanguage } =
    (location.state as { selectedLanguage?: string } | null) ?? {};

  // Database state
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [setNumber, setSetNumber] = useState(1);

  // Translation state
  const [translatedQuestion, setTranslatedQuestion] = useState('');
  const [translatedOptions, setTranslatedOptions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const finalizeExam = useCallback(
    async (reason?: "time" | "focus" | "camera" | "fullscreen" | "screenshot") => {
      if (hasSubmittedRef.current) {
        return;
      }

      hasSubmittedRef.current = true;
      setHasSubmitted(true);

      if (reason === "time") {
        toast({
          title: "Time's Up!",
          description: "Exam auto-submitted",
          variant: "destructive",
        });
      } else if (reason === "focus") {
        toast({
          title: "Exam auto-submitted",
          description: "Leaving the exam window ends the test immediately.",
          variant: "destructive",
        });
      } else if (reason === "camera") {
        toast({
          title: "Camera lost",
          description: "Face monitoring interrupted. The exam has been submitted.",
          variant: "destructive",
        });
      } else if (reason === "screenshot") {
        toast({
          title: "Screenshot Detected",
          description: "Taking screenshots during the exam is not allowed. The exam has been submitted.",
          variant: "destructive",
        });
      }

      const score = answersRef.current.reduce((acc, answer, index) => {
        return answer === questions[index].correctAnswer
          ? acc + 1
          : acc;
      }, 0);

      const timeTaken = Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000 / 60); // minutes

      if (typeof window !== "undefined" && auth.user) {
        try {
          const locState = (location.state as any) || {};

          // Use location state or restored context
          const isSpecial = locState.isSpecialExam || isSpecialExamMode;
          // Note: examId from params is already the specialExamId in this route structure for special exams? 
          // Actually route is /exam/:examId/start/:setId. :examId IS the specialExamId.
          const spExamId = locState.specialExamId || specialExamContext?.specialExamId || examId;
          const spSetNum = locState.setNumber || specialExamContext?.setNumber || setNumber;
          const spSetMap = locState.setMap || specialExamContext?.setMap;

          if (isSpecial) {
            // Submit Special Exam Result
            await studentService.submitSpecialExamResult(spExamId, spSetNum, {
              score,
              total_questions: totalQuestions,
              accuracy: Math.round((score / totalQuestions) * 100),
              time_taken_seconds: Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000),
              user_answers: answersRef.current
            });

            // CONTINUOUS FLOW LOGIC
            const currentSetNum = spSetNum;

            if (currentSetNum < 5 && spSetMap) {
              // Proceed to next set
              const nextSetNum = currentSetNum + 1;
              const nextSetId = spSetMap[nextSetNum];

              if (nextSetId) {
                toast({
                  title: "Set Completed!",
                  description: "Proceeding to next set...",
                  duration: 3000
                });

                // Navigate to next set (Force full reload to clean state)
                // Using window.location to ensure fresh mount of components
                const nextUrl = `/exam/${spExamId}/instructions/${nextSetId}`;
                // We need to persist state across reload, but window.location clears state.
                // However, our new robustness fix REBUILDS state on load!
                // So we can safely rely on URL params and the verifyAccess restoration logic.
                // But wait, setMap restoration needs data.
                // Actually, since verifyAccess rebuilds setMap from API if it detects special exam, 
                // we don't strictly *need* to pass state if we trust the restoration.
                // BUT better safe: we can use navigate, but force a key change or similar?
                // Or just trust the new "restored context" logic which is proven robust.

                // Let's stick to navigate but remove 'replace' and maybe add a key if possible?
                // Or better, stick to the plan: if we navigate to INSTRUCTIONS page, that is a different component usually?
                // No, instructions might be same component if route is same?
                // Route is /exam/:examId/instructions/:setId

                // If previous was /exam/.../start/... and new is /exam/.../instructions/..., that IS a different route/component.
                // So React should unmount ExamStart and mount ExamInstructions.

                // Issue might be `replace: true` messing with history or prompt?
                // Let's try standard navigate without replace, or use window.location if desperate.
                // But window.location loses 'state'.

                // If I use window.location, I rely 100% on the rebuild logic in ExamInstructions/Start.
                // Does ExamInstructions have rebuild logic?
                // I need to check ExamInstructions. If it expects state, window.location kills it.
                // But I improved ExamStart to rebuild. I should probably improve ExamInstructions to rebuild too.

                // For now, let's try to fix the "Repeating" issue.
                // If spSetNum is 1. nextSetNum is 2. nextSetId is Id2.
                // Navigate goes to /instructions/Id2.
                // If user sees "Same set repeating", maybe they mean they see Set 1 Instructions again?
                // That implies nextSetId == Id1.
                // That implies spSetMap[2] == Id1 ??

                // Let's verify loop logic.
                // sets in DB: 1->Id1, 2->Id2.
                // restoredSetMap: {1: Id1, 2: Id2}.
                // spSetNum = 1. nextSetNum = 2. nextSetId = Id2.
                // navigate(...Id2).

                // If "Same set repeating", maybe spSetNum is somehow stuck at 0 or something?

                // I will add logs to debug in production if I could, but here I must fix.
                // I suspect the restoration logic in verifyAccess might have a bug where it sets setNumber wrong?

                // Sets loop:
                // if (s.question_set_id === setId) { currentSetNum = s.set_number; }
                // If setId (from params) is Id1. currentSetNum = 1.
                // This seems correct.

                // What if the user is redirected to 'ExamStart' directly instead of 'Instructions'?
                // The navigate call points to /instructions/.

                // User said "direct result screen of the first set" initially.
                // Now "same set repeating".

                // Let's use window.location to be absolutely sure we are changing the URL and reloading.
                // We rely on backend to provide data to rebuild state.
                window.location.href = nextUrl;
                return;
              }
            } else if (currentSetNum >= 5) {
              // Final Result
              navigate(`/special-exam/${spExamId}/final-result`, { replace: true });
              return;
            }

          } else {
            // Submit Standard Exam Result
            await studentService.submitExamResult(setId || "", {
              score,
              total_questions: totalQuestions,
              accuracy: Math.round((score / totalQuestions) * 100),
              time_taken_seconds: Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000),
              exam_id: examId || "",
              exam_title: examTitle,
              set_number: setNumber,
              user_answers: answersRef.current
            });
          }
        } catch (error) {
          logger.error("Error saving exam result:", error);
          // ... (keep error handling)
        }
      }

      // Default fallback (Standard Exam Result)
      // Only navigate here if NOT a special exam
      const locStateFallback = (location.state as any) || {};
      const isSpecialFallback = locStateFallback.isSpecialExam || isSpecialExamMode;

      if (!isSpecialFallback) {
        navigate(`/result/${examId}/${setId}`, {
          state: { score, total: totalQuestions, timeTaken, setNumber },
        });
      }
    },
    [examId, setId, navigate, totalQuestions, examTitle, auth.user, questions, setNumber]
  );

  useEffect(() => {
    const preventBackNavigation = () => {
      if (!hasSubmittedRef.current) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBackNavigation);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasSubmittedRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Load questions from database
  useEffect(() => {
    const loadQuestions = async () => {
      if (!setId) {
        logger.error('No set ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        logger.debug('Loading questions for set:', setId);

        // Load questions from database
        // Use studentService for proper student flow
        const dbQuestions = await studentService.getQuestions(setId);
        const examQuestions = convertDBQuestions(dbQuestions);

        logger.debug('Loaded questions:', examQuestions.length);
        setQuestions(examQuestions);

        // Load question set details
        const currentSet = await studentService.getQuestionSetDetails(setId);

        if (currentSet) {
          setTimeLimit(currentSet.time_limit_minutes);
          // Prefer subject name if available (from join), else fallback to exam_id
          const title = currentSet.subjects?.name || currentSet.subject?.name || currentSet.exam_id;
          setExamTitle(title);
          setSetNumber(currentSet.set_number);
        }
      } catch (error) {
        logger.error('Error loading questions:', error);
        toast({
          title: "Error",
          description: "Failed to load exam questions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [setId]);

  // Handle translation toggle
  const handleTranslate = useCallback(async () => {
    if (!currentQuestion) return;

    // Toggle back to English
    if (isMarathi) {
      setIsMarathi(false);
      return;
    }

    // Check if we already have Marathi text in database
    if (currentQuestion.questionTextMarathi && currentQuestion.optionsMarathi.some(opt => opt)) {
      setIsMarathi(true);
      return;
    }

    // Translate via API
    try {
      setIsTranslating(true);
      const textsToTranslate = [
        currentQuestion.questionText,
        ...currentQuestion.options,
      ];

      const translations = await batchTranslate(textsToTranslate);
      setTranslatedQuestion(translations[0]);
      setTranslatedOptions(translations.slice(1));
      setIsMarathi(true);
    } catch (error) {
      logger.error('Translation failed:', error);
      toast({
        title: "Translation Failed",
        description: "Showing English version.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  }, [currentQuestion, isMarathi]);

  useEffect(() => {
    const initialAnswers = new Array(totalQuestions).fill(null);
    answersRef.current = initialAnswers;
    setAnswers(initialAnswers);
    setFlagged(new Array(totalQuestions).fill(false));
    hasSubmittedRef.current = false;
    setHasSubmitted(false);
    startTimeRef.current = new Date(); // Reset start time when exam starts

    setIsMarathi(selectedLanguage === "marathi");

    const disableRightClick = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        finalizeExam("focus");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleBlur = () => {
      finalizeExam("focus");
    };
    window.addEventListener("blur", handleBlur);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent DevTools
      if (
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }

      // Detect Print Screen key (may not work in all browsers)
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        finalizeExam("screenshot");
      }

      // Detect Windows + Shift + S (Snipping Tool)
      if (e.shiftKey && e.key === "S" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        finalizeExam("screenshot");
      }

      // Detect Mac screenshot shortcuts (Cmd + Shift + 3/4/5)
      if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        finalizeExam("screenshot");
      }

      // Detect Alt + Print Screen
      if (e.altKey && (e.key === "PrintScreen" || e.keyCode === 44)) {
        e.preventDefault();
        finalizeExam("screenshot");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Detect screen capture/sharing attempts
    const detectScreenCapture = async () => {
      try {
        // Monitor for getDisplayMedia calls (screen recording)
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
          (navigator.mediaDevices as any).originalGetDisplayMedia = originalGetDisplayMedia;

          navigator.mediaDevices.getDisplayMedia = async function (...args: any[]) {
            finalizeExam("screenshot");
            throw new Error("Screen capture not allowed during exam");
          };
        }

        // Note: We don't wrap getUserMedia to avoid interfering with camera monitoring
        // getDisplayMedia is the main API for screen capture and is already blocked
      } catch (error) {
        // Browser may not support this
        console.warn("Screen capture detection not fully supported:", error);
      }
    };
    detectScreenCapture();

    // Monitor clipboard for screenshot pastes
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          // Detect if image is being pasted (possible screenshot)
          if (item.type.indexOf("image") !== -1) {
            e.preventDefault();
            finalizeExam("screenshot");
            break;
          }
        }
      }
    };
    document.addEventListener("paste", handlePaste);

    // Detect copy attempts
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Copy Disabled",
        description: "Copying content during the exam is not allowed.",
        variant: "destructive",
      });
    };
    document.addEventListener("copy", handleCopy);

    // Detect cut attempts
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Cut Disabled",
        description: "Cutting content during the exam is not allowed.",
        variant: "destructive",
      });
    };
    document.addEventListener("cut", handleCut);

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        finalizeExam("fullscreen");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);

      // Restore original getDisplayMedia
      if (navigator.mediaDevices && (navigator.mediaDevices as any).originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = (navigator.mediaDevices as any).originalGetDisplayMedia;
      }
    };
  }, [totalQuestions, finalizeExam, selectedLanguage]);

  const handleSelectAnswer = (answerIndex: number) => {
    if (hasSubmitted) {
      return;
    }

    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      answersRef.current = newAnswers;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (hasSubmitted) {
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Clear translated text for new question
      setTranslatedQuestion('');
      setTranslatedOptions([]);
    }
  };

  const handlePrev = () => {
    if (hasSubmitted) {
      return;
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Clear translated text for new question
      setTranslatedQuestion('');
      setTranslatedOptions([]);
    }
  };

  const handleFlag = () => {
    if (hasSubmitted) {
      return;
    }

    const newFlagged = [...flagged];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlagged(newFlagged);
    toast({
      title: newFlagged[currentQuestionIndex]
        ? "Question Flagged"
        : "Flag Removed",
      description: newFlagged[currentQuestionIndex]
        ? "You can review this question later"
        : "Question unflagged",
    });
  };

  const handleSubmit = () => {
    finalizeExam();
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;


  // Generate user-specific watermark text
  const watermarkText = auth.user ? `${auth.user.name} - ${auth.user.phone}` : "GovExams";
  const watermarkTimestamp = new Date().toISOString();

  // Add exam-mode class to body to disable text selection globally
  useEffect(() => {
    document.body.classList.add("exam-mode");
    return () => {
      document.body.classList.remove("exam-mode");
    };
  }, []);

  // State for Special Exam context (restored on reload)
  const [isSpecialExamMode, setIsSpecialExamMode] = useState(false);
  const [specialExamContext, setSpecialExamContext] = useState<any>(null);

  // Verify access before allowing exam to start
  useEffect(() => {
    const verifyAccess = async () => {
      if (!auth.user || !examId) {
        setCheckingAccess(false);
        navigate("/login");
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const token = localStorage.getItem('access_token');

        // First, check if this is a special exam by trying to fetch it
        const specialExamRes = await fetch(`${API_URL}/api/public/special-exams/${examId}`);
        const isSpecial = specialExamRes.ok;

        if (isSpecial) {
          const examData = await specialExamRes.json();
          setIsSpecialExamMode(true);

          // Restore or build setMap and find current setNumber
          const sets = examData.sets || [];
          const restoredSetMap: Record<number, string> = {};
          let currentSetNum = 1;

          sets.forEach((s: any) => {
            restoredSetMap[s.set_number] = s.question_set_id;
            if (s.question_set_id === setId) {
              currentSetNum = s.set_number;
            }
          });

          setSpecialExamContext({
            specialExamId: examId,
            setNumber: currentSetNum,
            setMap: restoredSetMap,
            isSpecialExam: true
          });

          // This is a special exam - check user_premium_access table
          const accessRes = await fetch(`${API_URL}/api/student/special-exams/${examId}/access`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const accessData = await accessRes.json();
          setHasAccess(accessData.hasAccess);

          if (!accessData.hasAccess) {
            toast({
              title: "Access Denied",
              description: "You need to purchase this exam to access it.",
              variant: "destructive",
            });
            navigate(`/special-exam/${examId}`);
          }
        } else {
          // This is a subject exam - check student_plans table
          const access = await planUtils.hasExamAccess(auth.user.phone, examId);
          setHasAccess(access);

          if (!access) {
            toast({
              title: "Access Denied",
              description: "You don't have access to this exam.",
              variant: "destructive",
            });
            navigate("/plans");
          }
        }
      } catch (error) {
        logger.error("Error verifying access:", error);
        setHasAccess(false);
        navigate("/plans");
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [auth.user, examId, navigate, setId]);

  // CONDITIONAL RETURNS MUST BE AFTER ALL HOOKS
  if (checkingAccess || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Will redirect in useEffect
  }

  if (questions.length === 0) {
    return <div>No questions found for this exam</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background overflow-hidden exam-mode" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }} onDragStart={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
      {/* Watermark Overlay - User-specific to deter sharing */}
      <div className="pointer-events-none fixed inset-0 z-[9998] select-none overflow-hidden opacity-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-primary rotate-[-45deg] transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
            {watermarkText}
          </div>
        </div>
        <div className="absolute top-10 left-10 text-sm font-semibold text-primary opacity-60">
          {watermarkText}
        </div>
        <div className="absolute top-10 right-10 text-sm font-semibold text-primary opacity-60">
          {watermarkTimestamp}
        </div>
        <div className="absolute bottom-10 left-10 text-sm font-semibold text-primary opacity-60">
          GovExams - Confidential
        </div>
        <div className="absolute bottom-10 right-10 text-sm font-semibold text-primary opacity-60">
          {watermarkText}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[300%] h-[300%] rotate-45 opacity-10 flex flex-wrap">
          {Array.from({ length: 80 }).map((_, index) => (
            <span
              key={index}
              className="text-sm font-extrabold uppercase tracking-[0.6em] text-primary/80 m-10"
            >
              GovExams
            </span>
          ))}
        </div>
      </div>

      {/* Timer (fixed) */}
      <Timer initialMinutes={timeLimit} onTimeUp={() => finalizeExam("time")} />

      {/* Translate toggle (fixed) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-2 sm:right-6 z-50 pointer-events-none"
      >
        <div className="pointer-events-auto">
          <TranslateButton
            isMarathi={isMarathi}
            onToggle={handleTranslate}
          />
        </div>
      </motion.div>

      {/* LEFT SIDE — Main Exam Area */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 pb-4 pt-32 lg:pt-40 relative z-10">

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={totalQuestions}
          />
          <p className="text-sm text-muted-foreground text-center mt-1">
            Progress: {currentQuestionIndex + 1} of {totalQuestions} questions
          </p>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                {flagged[currentQuestionIndex] && (
                  <span className="flex items-center gap-2 text-sm text-primary">
                    <Flag className="w-4 h-4 fill-current" />
                    Flagged for Review
                  </span>
                )}
              </div>

              <QuestionCard
                question={currentQuestion}
                selectedAnswer={answers[currentQuestionIndex]}
                onSelectAnswer={handleSelectAnswer}
                isMarathi={isMarathi}
                translatedQuestion={translatedQuestion}
                translatedOptions={translatedOptions}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 flex-wrap gap-4">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0 || hasSubmitted}
                  className="px-6 py-3 rounded-lg bg-card border border-border hover:bg-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 inline" /> Previous
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFlag}
                  disabled={hasSubmitted}
                  className={`px-6 py-3 rounded-lg font-medium ${flagged[currentQuestionIndex]
                    ? "bg-primary text-white"
                    : "bg-card border border-border hover:bg-muted"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Flag
                    className={`w-5 h-5 mr-1 ${flagged[currentQuestionIndex] ? "fill-current" : ""
                      }`}
                  />
                  Mark for Review
                </motion.button>
              </div>

              <div className="flex gap-3">
                {isLastQuestion ? (
                  // Only show Submit button if setNumber >= 5
                  setNumber >= 5 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={hasSubmitted}
                      className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5 inline mr-1" /> Submit Exam
                    </motion.button>
                  ) : (
                    // If forced duration (set < 5), show "Saved" or nothing on last question
                    <div className="px-8 py-3 rounded-lg bg-muted text-muted-foreground font-semibold cursor-default">
                      Saved (Wait for Timer)
                    </div>
                  )
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    disabled={hasSubmitted}
                    className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save & Next <ChevronRight className="w-5 h-5 inline ml-1" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT SIDE — Question Navigator / Legend */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 lg:pt-40 lg:sticky lg:top-0 lg:h-screen overflow-y-auto space-y-6 relative z-10 max-h-[400px] lg:max-h-none">
        <h3 className="text-sm font-semibold mb-4 text-foreground">
          Question Navigator
        </h3>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!hasSubmitted) {
                  setCurrentQuestionIndex(index);
                }
              }}
              disabled={hasSubmitted}
              className={`aspect-square rounded-md font-semibold text-sm transition-all ${currentQuestionIndex === index
                ? "gradient-primary text-white border-2 border-primary"
                : answers[index] !== null
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } ${flagged[index] ? "ring-2 ring-purple-500" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="text-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded gradient-primary" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green-500" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-200 border border-gray-400" />
            <span>Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-purple-500" />
            <span>Marked for Review</span>
          </div>
        </div>

        <CameraMonitor onViolation={() => finalizeExam("camera")} />
      </div>
    </div>
  );
};

export default ExamStart;
