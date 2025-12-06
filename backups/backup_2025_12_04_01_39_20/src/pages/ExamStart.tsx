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
import { adminService } from "@/admin/lib/adminService";
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

      if (typeof window !== "undefined" && examId && auth.user) {
        try {
          // Save exam result to Supabase
          await supabaseService.saveExamResult({
            student_phone: auth.user.phone,
            student_name: auth.user.name,
            exam_id: examId,
            exam_title: examTitle,
            set_id: setId || "",
            set_number: setNumber, // Use actual set number
            score: score,
            total_questions: totalQuestions,
            accuracy: Math.round((score / totalQuestions) * 100),
            time_taken: `${timeTaken} min`,
            user_answers: answersRef.current,
          });
        } catch (error) {
          logger.error("Error saving exam result:", error);
          toast({
            title: "Warning",
            description: "Exam completed but result may not have been saved properly.",
            variant: "destructive",
          });
        }
      }

      navigate(`/result/${examId}/${setId}`, {
        state: { score, total: totalQuestions, timeTaken, setNumber },
      });
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
        const dbQuestions = await adminService.getQuestions(setId);
        const examQuestions = convertDBQuestions(dbQuestions);

        logger.debug('Loaded questions:', examQuestions.length);
        setQuestions(examQuestions);

        // Load question set details
        const questionSets = await adminService.getQuestionSets();
        const currentSet = questionSets.find(qs => qs.id === setId);

        if (currentSet) {
          setTimeLimit(currentSet.time_limit_minutes);
          setExamTitle(currentSet.exam_id);
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
  const watermarkText = auth.user ? `${auth.user.name} - ${auth.user.phone}` : "DMLT Academy";
  const watermarkTimestamp = new Date().toISOString();

  // Add exam-mode class to body to disable text selection globally
  useEffect(() => {
    document.body.classList.add("exam-mode");
    return () => {
      document.body.classList.remove("exam-mode");
    };
  }, []);

  // Verify access before allowing exam to start
  useEffect(() => {
    const verifyAccess = async () => {
      if (!auth.user || !examId) {
        setCheckingAccess(false);
        navigate("/login");
        return;
      }

      try {
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
      } catch (error) {
        logger.error("Error verifying access:", error);
        setHasAccess(false);
        navigate("/plans");
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [auth.user, examId, navigate]);

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
          DMLT Academy - Confidential
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
              DMLT Academy
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
