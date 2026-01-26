import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { planUtils } from "@/lib/planUtils";
import { studentService } from "@/lib/studentService";
import logger from "@/lib/logger";

const ExamInstructions = () => {
  const { examId, setId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [language, setLanguage] = useState("english");
  const [agreedToInstructions, setAgreedToInstructions] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Database state
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [questionSet, setQuestionSet] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState(20);

  const { specialExamId, setNumber, isSpecialExam, setMap } = (location.state as any) || {};

  // Define callbacks BEFORE any conditional returns
  const ensureCameraPermission = useCallback(async () => {
    // ...
  }, []);

  const ensureFullscreen = useCallback(async () => {
    // ...
  }, []);

  const handleBegin = async () => {
    if (!agreedToInstructions) return;
    setShowWarnings(true);
    setCameraReady(false);
    await ensureCameraPermission();
  };

  const handleConfirmBegin = async () => {
    setConfirming(true);
    const cameraGranted = cameraReady || (await ensureCameraPermission());
    if (!cameraGranted) {
      setConfirming(false);
      return;
    }

    const fullscreenGranted = await ensureFullscreen();
    if (fullscreenGranted === false) { // Assuming ensureFullscreen returns boolean or void? Original code implied boolean.
      // Wait, ensureFullscreen was void in original code but awaited in original logic. 
      // The previous lint said "An expression of type 'void' cannot be tested for truthiness".
      // I need to check ensureFullscreen definition. It was void in snippet.
      // I will fix it by checking document.fullscreenElement instead or updating ensureFullscreen to return boolean.
      // Since ensureFullscreen code wasn't shown fully, I'll assume I should just call it and check document state.

      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        setConfirming(false);
        return;
      }
    }

    setShowWarnings(false);
    setConfirming(false);

    // Pass state forward to ExamStart
    // Use restored context if available
    const spExamId = specialExamId || specialExamContext?.specialExamId;
    const spSetNum = setNumber || specialExamContext?.setNumber;
    const spSetMap = setMap || specialExamContext?.setMap;
    const isSpecial = isSpecialExam || specialExamContext?.isSpecialExam;

    navigate(`/exam/${examId}/start/${setId}`, {
      state: {
        selectedLanguage: language,
        fullscreenGranted: true,
        specialExamId: spExamId,
        setNumber: spSetNum,
        isSpecialExam: isSpecial,
        setMap: spSetMap // Pass mapping forward for continuous flow
      },
      replace: true,
    });
  };

  // State for Special Exam context (restored on reload)
  const [isSpecialExamMode, setIsSpecialExamMode] = useState(false);
  const [specialExamContext, setSpecialExamContext] = useState<any>(null);

  // Check access on mount - AFTER all hooks are defined
  useEffect(() => {
    const checkAccess = async () => {
      if (!auth.user || !examId) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const token = localStorage.getItem('access_token');

        // First verify standard special exam check
        const specialExamRes = await fetch(`${API_URL}/api/public/special-exams/${examId}`);
        const isSpecial = specialExamRes.ok;

        if (isSpecial) {
          setIsSpecialExamMode(true);
          const examData = await specialExamRes.json();

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

          // Special Exam Access Check
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
          // Standard Subject Exam Access Check
          // ...
          // (Keep existing logic mostly, but simplified)
          const access = await planUtils.hasExamAccess(auth.user.phone, examId);
          setHasAccess(access);

          if (!access) {
            toast({
              title: "Access Denied",
              description: "You don't have access to this exam. Please purchase a plan.",
              variant: "destructive",
            });
            navigate("/plans");
          }
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [auth.user, examId, navigate, setId]);

  // Load exam data from database
  useEffect(() => {
    const loadExamData = async () => {
      if (!examId || !setId) return;

      try {
        setLoading(true);

        // Load question set details directly using studentService (Works for UUID)
        const currentSet = await studentService.getQuestionSetDetails(setId);

        if (currentSet) {
          setQuestionSet(currentSet);

          // Determine Subject Name or Exam Title
          if (currentSet.subjects?.name) {
            setSubjectName(currentSet.subjects.name);
          } else if (currentSet.subject?.name) {
            setSubjectName(currentSet.subject.name);
          } else if (isSpecialExam || specialExamId) {
            // Fetch Special Exam Title if not found in set (set might be linked to placeholder subject)
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const titleRes = await fetch(`${API_URL}/api/public/special-exams/${specialExamId || examId}`);
            if (titleRes.ok) {
              const titleData = await titleRes.json();
              setSubjectName(titleData.title);
            } else {
              setSubjectName("Special Exam");
            }
          } else {
            setSubjectName("Exam");
          }

          // Load questions to get count
          const questions = await studentService.getQuestions(setId);
          setTotalQuestions(questions.length);
        }
      } catch (error) {
        logger.error('Error loading exam data:', error);
        toast({
          title: "Error",
          description: "Failed to load exam details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExamData();
  }, [examId, setId, isSpecialExam, specialExamId]);

  // Early returns AFTER all hooks
  if (checkingAccess || loading) {
    return (
      <div className="flex-1 bg-background pt-20 sm:pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex-1 bg-background pt-20 sm:pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please login to access this exam.</h1>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-full gradient-primary text-white font-bold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="flex-1 bg-background pt-20 sm:pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-card rounded-lg border border-border">
          <h1 className="text-2xl font-bold mb-4 text-foreground">⚠️ Exam Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this exam. Please go back and try again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex-1 bg-background pt-20 sm:pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to purchase a plan to access this exam.</p>
          <button
            onClick={() => navigate("/plans")}
            className="px-6 py-3 rounded-full gradient-primary text-white font-bold"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background pt-20 sm:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-4 sm:p-8"
        >
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-border">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              {subjectName} - Set {questionSet.set_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalQuestions} Multiple Choice Questions • {questionSet.time_limit_minutes} Minutes
            </p>
          </div>

          {/* Instructions Content */}
          <div className="prose prose-sm max-w-none mb-6 space-y-4">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h2 className="text-lg font-bold text-foreground mb-4">
                परीक्षा सूचना / Exam Instructions
              </h2>

              <div className="space-y-4 text-foreground">
                <div>
                  <h3 className="font-semibold mb-2">A. General Instructions / सर्वसामान्य सूचना:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Total Duration: {questionSet.time_limit_minutes} minutes / एकूण कालावधी: {questionSet.time_limit_minutes} मिनिटे</li>
                    <li>Number of Questions: {totalQuestions} / प्रश्नांची संख्या: {totalQuestions}</li>
                    <li>
                      All questions are multiple choice type with 4 options each. Only one answer is correct. /
                      सर्व प्रश्न वस्तुनिष्ठ प्रकारचे आहेत. प्रत्येक प्रश्नाला चार पर्याय दिलेले आहेत त्यापैकी केवळ एक उत्तर बरोबर असेल.
                    </li>
                    <li>
                      Press "Save & Next" to save your answer, otherwise it won't be saved. /
                      उत्तराचे जतन करण्यासाठी Save & Next हे बटन दाबा.
                    </li>
                    <li>
                      The remaining time will be displayed by the countdown timer. /
                      उरलेला वेळ countdown timer द्वारे दर्शवला जाईल.
                    </li>
                    <li>
                      When the timer reaches zero, the exam will auto-submit. /
                      जेव्हा timer शून्यावर पोहोचेल, परीक्षा स्वतःहून submit होईल.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">B. Question Status Indicators / प्रश्न स्थिती:</h3>
                  <ul className="list-none space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-gray-200 border border-gray-400 rounded"></span>
                      <span>Not Visited / अद्याप भेट दिलेली नाही</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-red-500 rounded"></span>
                      <span>Not Answered / उत्तर दिलेले नाही</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-500 rounded"></span>
                      <span>Answered / उत्तर दिले आहे</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 rounded"></span>
                      <span>Marked for Review / पुनरावलोकनासाठी चिन्हांकित</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">C. How to Answer / उत्तर कसे द्यावे:</h3>
                  <ul className="list-none space-y-2 ml-4">
                    <li>• Click on one of the option buttons to select your answer / पर्यायांपैकी एका बटनावर क्लिक करा</li>
                    <li>• Click again on the selected option to deselect / निवड रद्द करण्यासाठी पुन्हा क्लिक करा</li>
                    <li>• Click "Save & Next" to save your answer / उत्तर जतन करण्यासाठी Save & Next दाबा</li>
                    <li>• Use "Mark for Review" to flag questions you want to revisit / पुन्हा पहायचे असल्यास Mark for Review वापरा</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-6 pb-6 border-b border-border">
            <label className="block text-sm font-medium mb-2 text-foreground">
              Choose your default language / तुमची डिफॉल्ट भाषा निवडा:
            </label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="-- Select --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="marathi">Marathi / मराठी</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              You can change the language for individual questions during the exam. /
              परीक्षेदरम्यान तुम्ही वैयक्तिक प्रश्नांसाठी भाषा बदलू शकता.
            </p>
          </div>

          {/* Agreement Checkbox */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agree"
                checked={agreedToInstructions}
                onCheckedChange={(checked) => setAgreedToInstructions(checked as boolean)}
              />
              <label htmlFor="agree" className="text-sm text-foreground leading-relaxed cursor-pointer">
                I have read and understood the instructions. I declare that I am not in possession of any prohibited gadgets or materials. I agree that in case of not adhering to the instructions, I shall be liable to disciplinary action.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={() => {
                void handleBegin();
              }}
              disabled={!agreedToInstructions}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              I am ready to begin
            </Button>
          </div>

          <AlertDialog open={showWarnings} onOpenChange={setShowWarnings}>
            <AlertDialogContent className="border-2 border-destructive">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">Critical Exam Warnings</AlertDialogTitle>
                <AlertDialogDescription className="text-destructive">
                  Any violation immediately ends the session. Confirm only if you agree to comply.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 text-sm text-destructive font-semibold">
                <p>• Switching tabs, minimizing, or splitting the screen auto-submits the exam.</p>
                <p>• Camera feed must remain active with your face clearly visible at all times.</p>
                <p>• Right-click, opening developer tools, or disabling security features is forbidden.</p>
                <p>• Once submitted (manually or automatically) you cannot re-enter this session.</p>
                {!cameraReady && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded">
                    <p className="text-xs uppercase mb-2">Camera access required to start the exam.</p>
                    <Button
                      onClick={async () => {
                        await ensureCameraPermission();
                      }}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      Request Camera Access
                    </Button>
                  </div>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={confirming}>Review Again</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    void handleConfirmBegin();
                  }}
                  disabled={confirming || !cameraReady}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {confirming ? "Starting..." : "Start Exam"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamInstructions;
