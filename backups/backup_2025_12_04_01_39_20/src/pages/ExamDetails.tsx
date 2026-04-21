import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  FileText,
  IndianRupee,
  CheckCircle,
  ArrowRight,
  Shield,
  BookMarked,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabaseService } from "@/lib/supabaseService";
import { planUtils } from "@/lib/planUtils";
import { adminService } from "@/admin/lib/adminService";
import logger from "@/lib/logger";

const useExamProgress = (examId: string, totalSets: number) => {
  const { auth } = useAuth();
  const [progress, setProgress] = useState({ completed: 0, unlocked: 1 });

  useEffect(() => {
    const loadProgress = async () => {
      if (!auth.user) {
        setProgress({ completed: 0, unlocked: 1 });
        return;
      }

      try {
        const data = await supabaseService.getStudentExamProgress(auth.user.phone, examId);
        if (data) {
          const completed = Math.min(data.completed_set_number || 0, totalSets);
          const unlocked = Math.min(completed + 1, totalSets);
          setProgress({ completed, unlocked });
        } else {
          setProgress({ completed: 0, unlocked: 1 });
        }
      } catch (error) {
        console.error("Error loading progress:", error);
        setProgress({ completed: 0, unlocked: 1 });
      }
    };

    loadProgress();
  }, [examId, totalSets, auth.user]);

  return progress;
};

const ExamDetails = () => {
  const { auth } = useAuth();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Database state
  const [loading, setLoading] = useState(true);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!examId) return;

      try {
        setLoading(true);

        // Load subject details
        const subjects = await adminService.getSubjects();
        const subject = subjects.find(s => s.id === examId);

        if (subject) {
          setSubjectName(subject.name);
          setSubjectDescription(subject.description || 'Exam questions for ' + subject.name);
        }

        // Load all question sets
        const allSets = await adminService.getQuestionSets();
        const setsForSubject = allSets.filter(set =>
          set.subject_id === examId || set.exam_id === examId
        );

        // Sort sets by set_number
        setsForSubject.sort((a, b) => a.set_number - b.set_number);
        setQuestionSets(setsForSubject);

        // Load student results if logged in
        if (auth.user) {
          const results = await supabaseService.getStudentExamResults(auth.user.phone);
          // Filter results for this exam
          const examResults = results.filter(r => r.exam_id === examId);
          setExamResults(examResults);
        }

        // Auto-select first set
        if (setsForSubject.length > 0 && !selectedSet) {
          setSelectedSet(setsForSubject[0].id);
        }
      } catch (error) {
        logger.error('Error loading exam details:', error);
        toast({
          title: "Error",
          description: "Failed to load exam details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [examId, auth.user]);

  // Check access
  useEffect(() => {
    const checkAccess = async () => {
      if (auth.user && examId) {
        const access = await planUtils.hasExamAccess(auth.user.phone, examId);
        setHasAccess(access);
      } else {
        setHasAccess(false);
      }
    };
    checkAccess();
  }, [examId, auth.user]);

  const getSetStatus = (setNumber: number, previousSet: any) => {
    if (setNumber === 1) return { locked: false, message: '' };

    // Find result for previous set
    const prevResult = examResults.find(r => r.set_number === setNumber - 1);

    if (!prevResult) {
      return { locked: true, message: `Complete Set ${setNumber - 1} first` };
    }

    // Check time duration
    // Parse time_taken (e.g., "5 min")
    const minutesTaken = parseInt(prevResult.time_taken) || 0;
    const submissionTime = new Date(prevResult.created_at).getTime();

    // Calculate when the exam actually started
    // Start Time = Submission Time - Time Taken
    const startTime = submissionTime - (minutesTaken * 60 * 1000);

    // Calculate unlock time
    // Unlock Time = Start Time + Full Duration of Previous Set
    const durationMinutes = previousSet?.time_limit_minutes || 60;
    const unlockTime = startTime + (durationMinutes * 60 * 1000);

    const now = Date.now();
    if (now < unlockTime) {
      const minutesLeft = Math.ceil((unlockTime - now) / (60 * 1000));
      return { locked: true, message: `Unlocks in ${minutesLeft} min` };
    }

    return { locked: false, message: '' };
  };

  const handleSelectSet = (setId: string, setNumber: number) => {
    // Get previous set for time calculation
    const previousSet = questionSets.find(s => s.set_number === setNumber - 1);
    const { locked, message } = getSetStatus(setNumber, previousSet);

    if (locked) {
      toast({
        title: "Set Locked",
        description: message,
        variant: "destructive",
      });
      return;
    }
    setSelectedSet(setId);
  };

  const handleStartExam = () => {
    if (!selectedSet) {
      toast({
        title: "Please Select a Question Set",
        description: "Choose an available question set to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!hasAccess) {
      toast({
        title: "Plan Required",
        description: "Please purchase a plan to access this exam.",
        variant: "destructive",
      });
      navigate("/plans");
      return;
    }

    navigate(`/exam/${examId}/instructions/${selectedSet}`);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please login to access exam details.</h1>
          <a href="/login">
            <button className="px-6 py-3 rounded-full gradient-primary text-white font-bold">Login</button>
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questionSets.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No Question Sets Found</h1>
          <p className="text-muted-foreground mb-4">Please add question sets via the admin panel.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-full gradient-primary text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-20 sm:pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="bg-card border border-border rounded-lg p-4 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 gradient-text text-foreground">
                  {subjectName}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  {subjectDescription}
                </p>
              </div>
              <div className="text-left sm:text-right">
                {hasAccess ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="text-lg sm:text-xl font-semibold">Access Granted</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <p className="text-sm text-muted-foreground mb-2">Plan Required</p>
                    <button
                      onClick={() => navigate("/plans")}
                      className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      View Plans
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Set Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-4 sm:p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <BookMarked className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Select Question Set</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Sets unlock sequentially. You must complete the full duration of the previous set to unlock the next one.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {questionSets.map((set, index) => {
                const previousSet = index > 0 ? questionSets[index - 1] : null;
                const { locked, message } = getSetStatus(set.set_number, previousSet);

                return (
                  <motion.button
                    key={set.id}
                    whileHover={!locked ? { scale: 1.05 } : {}}
                    whileTap={!locked ? { scale: 0.95 } : {}}
                    onClick={() => handleSelectSet(set.id, set.set_number)}
                    className={`p-4 sm:p-6 rounded-lg border-2 transition-all relative overflow-hidden ${locked
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70"
                        : selectedSet === set.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50"
                      }`}
                  >
                    {locked && (
                      <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10">
                        <div className="bg-white/90 p-2 rounded-full shadow-sm">
                          <Shield className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${locked ? 'text-gray-400' : 'gradient-text'}`}>
                        {set.set_number}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Set {set.set_number}
                      </div>
                      {locked && message && (
                        <div className="text-[10px] text-red-500 mt-1 font-medium">
                          {message}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Exam Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-lg p-4 sm:p-6"
            >
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Exam Structure</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {questionSets.length} Question Sets Available
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Multiple Choice Questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Select Any Set
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-4 sm:p-6"
            >
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Time Allocation</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {questionSets[0]?.time_limit_minutes || 60} Minutes per Set
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Timed Examination
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Auto-submit on Timeout
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-4 sm:p-8 mb-8"
          >
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">Exam Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Bilingual Support (English/Marathi)",
                "Question Flagging for Review",
                "Real-time Progress Tracking",
                "Instant Result Generation",
                "Detailed Performance Analytics",
                "Secure Examination Environment",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={handleStartExam}
              disabled={!selectedSet || !hasAccess}
              className="group w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-lg gradient-primary text-white text-base sm:text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {hasAccess ? "Start Exam" : "Purchase Plan to Access"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            {!selectedSet && (
              <p className="text-sm text-red-500 mt-4">
                Please select a question set to continue
              </p>
            )}
            {!hasAccess && (
              <p className="text-sm text-muted-foreground mt-4">
                Purchase a plan to access this exam • <button onClick={() => navigate("/plans")} className="text-primary underline hover:opacity-80">View Plans</button>
              </p>
            )}
            {hasAccess && (
              <p className="text-sm text-muted-foreground mt-4">
                You have access to this exam through your plan
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamDetails;
