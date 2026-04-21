import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Circle } from "lucide-react";
import { supabaseService } from "@/lib/supabaseService";
import { mockExams } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";

const ExamReview = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [examResult, setExamResult] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isMarathi, setIsMarathi] = useState(false);

  useEffect(() => {
    const loadReviewData = async () => {
      if (!resultId || !auth.isAuthenticated) {
        navigate("/history");
        return;
      }

      try {
        setLoading(true);
        const result = await supabaseService.getExamResultById(resultId);
        
        // Verify this result belongs to the logged-in user
        if (result.student_phone !== auth.user?.phone) {
          navigate("/history");
          return;
        }

        setExamResult(result);

        // Load questions from mockData
        const exam = mockExams.find((e) => e.id === result.exam_id);
        if (exam) {
          const questionSet = exam.questionSets.find(
            (set) => set.id === result.set_id || set.setNumber === result.set_number
          );
          if (questionSet) {
            setQuestions(questionSet.questions);
          }
        }
      } catch (error) {
        console.error("Error loading review data:", error);
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };

    loadReviewData();
  }, [resultId, auth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam review...</p>
        </div>
      </div>
    );
  }

  if (!examResult || questions.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Review Not Found</h1>
          <button
            onClick={() => navigate("/history")}
            className="px-6 py-3 rounded-full gradient-primary text-white"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const userAnswers = examResult.user_answers || [];
  const correctAnswers = questions.map((q) => q.correctAnswer);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm sm:text-base">Back to History</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 gradient-text">
                  Exam Review
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  {examResult.exam_title} - Set {examResult.set_number}
                </p>
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => setIsMarathi(!isMarathi)}
                className="px-4 py-2 rounded-full border border-border hover:bg-muted transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                {isMarathi ? "English" : "Marathi"}
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {examResult.score}/{examResult.total_questions}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Score</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {examResult.accuracy}%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {examResult.time_taken}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Time Taken</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {new Date(examResult.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Date</div>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const correctAnswer = question.correctAnswer;
              const isCorrect = userAnswer === correctAnswer;
              const isAnswered = userAnswer !== null && userAnswer !== undefined;

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card rounded-2xl p-4 sm:p-6 ${
                    isCorrect
                      ? "border-2 border-accent"
                      : isAnswered
                      ? "border-2 border-destructive"
                      : "border border-border"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                          isCorrect
                            ? "bg-accent/20 text-accent"
                            : isAnswered
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2">
                          {isMarathi ? question.questionTextMarathi : question.questionText}
                        </h3>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                      ) : isAnswered ? (
                        <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                      ) : (
                        <Circle className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 sm:space-y-3">
                    {(isMarathi ? question.optionsMarathi : question.options).map(
                      (option: string, optionIndex: number) => {
                        const isUserAnswer = userAnswer === optionIndex;
                        const isCorrectOption = correctAnswer === optionIndex;
                        const showIndicator =
                          isUserAnswer || (isCorrectOption && !isAnswered);

                        return (
                          <div
                            key={optionIndex}
                            className={`p-3 sm:p-4 rounded-xl transition-all ${
                              isCorrectOption
                                ? "bg-accent/10 border-2 border-accent"
                                : isUserAnswer && !isCorrectOption
                                ? "bg-destructive/10 border-2 border-destructive"
                                : "bg-muted/50 border border-border"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0 mt-0.5 ${
                                  isCorrectOption
                                    ? "bg-accent text-accent-foreground"
                                    : isUserAnswer && !isCorrectOption
                                    ? "bg-destructive text-destructive-foreground"
                                    : "bg-background border-2 border-muted-foreground text-muted-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm sm:text-base">{option}</p>
                              </div>
                              {showIndicator && (
                                <div className="flex-shrink-0">
                                  {isCorrectOption ? (
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                                  ) : (
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Answer Explanation */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm sm:text-base">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          <span className="text-accent font-semibold">Correct Answer</span>
                        </>
                      ) : isAnswered ? (
                        <>
                          <XCircle className="w-5 h-5 text-destructive" />
                          <span className="text-destructive font-semibold">
                            Your Answer: {String.fromCharCode(65 + userAnswer)}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-accent">
                            Correct Answer: {String.fromCharCode(65 + correctAnswer)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5 text-muted-foreground" />
                          <span className="text-muted-foreground font-semibold">
                            Not Answered
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-accent">
                            Correct Answer: {String.fromCharCode(65 + correctAnswer)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => navigate("/history")}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full gradient-primary text-white font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
            >
              Back to History
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamReview;


