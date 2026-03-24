import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, TrendingUp, Clock, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { studentService } from "@/lib/studentService";
import { useState, useEffect } from "react";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { HistoryCardSkeleton } from "@/components/skeletons/HistoryCardSkeleton";

const History = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageAccuracy, setAverageAccuracy] = useState("0");
  const [avgTime, setAvgTime] = useState(0);

  const loadHistory = async () => {
    if (!auth.isAuthenticated || !auth.user) {
      setLoading(false);
      return;
    }

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("[History] Loading timed out");
        setLoading(false);
      }
    }, 10000);

    try {
      setLoading(true);
      console.log("[History] Fetching history...");

      const results = await studentService.getExamHistory();
      console.log("[History] Raw results:", results);

      // Group Special Exam Results
      const processedHistory: any[] = [];
      const specialExamsMap = new Map<string, any>();

      // Ensure results is an array
      if (!Array.isArray(results)) {
        console.error('[History] Results is not an array:', results);
        setHistory([]);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      results.forEach((item: any) => {
        try {
          if (!item) return;

          // SPECIAL EXAM HANDLING
          if (item.is_special || item.special_exam_id || item.exam_title?.startsWith("Special")) {
            // Fallback ID if exam_id is missing but it's a special exam result
            const examId = item.exam_id || item.special_exam_id || item.set_id || "unknown_special";

            if (!specialExamsMap.has(examId)) {
              specialExamsMap.set(examId, {
                id: `group_${examId}`,
                exam_id: examId,
                exam_title: item.exam_title || item.special_exam?.title || "Special Exam",
                is_special_group: true,
                score: 0,
                total_questions: 0,
                time_minutes: 0,
                created_at: item.created_at || new Date().toISOString(),
                sets_count: 0
              });
            }

            const group = specialExamsMap.get(examId);
            group.score += (Number(item.score) || 0);
            group.total_questions += (Number(item.total_questions) || 0);

            // Parse time "X min" -> integer safely
            let mins = 0;
            if (typeof item.time_taken === 'number') {
              mins = Math.ceil(item.time_taken / 60);
            } else {
              mins = parseInt((item.time_taken || "0").toString().replace(/[^0-9]/g, "") || "0");
            }
            group.time_minutes += mins;
            group.sets_count += 1;

            // Keep the latest date
            const itemDate = new Date(item.created_at).getTime();
            const groupDate = new Date(group.created_at).getTime();
            if (!isNaN(itemDate) && (isNaN(groupDate) || itemDate > groupDate)) {
              group.created_at = item.created_at;
            }
          } else {
            // REGULAR EXAM HANDLING
            processedHistory.push(item);
          }
        } catch (err) {
          console.error("[History] Error processing item:", item, err);
        }
      });

      // Finalize groups
      specialExamsMap.forEach((group) => {
        // Calculate accuracy
        group.accuracy = group.total_questions > 0
          ? Math.round((group.score / group.total_questions) * 100)
          : 0;
        group.time_taken = `${group.time_minutes} min`;
        processedHistory.push(group);
      });

      // Sort Combined History
      processedHistory.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

      console.log("[History] Processed:", processedHistory);
      setHistory(processedHistory);

      if (processedHistory.length > 0) {
        const avg = (processedHistory.reduce((acc: number, h: any) => acc + (Number(h.accuracy) || 0), 0) / processedHistory.length).toFixed(1);
        setAverageAccuracy(avg);

        const totalTime = processedHistory.reduce((acc: number, h: any) => {
          const timeStr = h.time_taken || "0";
          const mins = parseInt(timeStr.toString().replace(/[^0-9]/g, "") || "0");
          return acc + mins;
        }, 0);
        setAvgTime(Math.round(totalTime / processedHistory.length));
      }
    } catch (error) {
      console.error("[History] Error loading history:", error);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [auth.isAuthenticated, auth.user]);

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <h1 className="text-3xl font-bold gradient-text">Please login to view your history</h1>
      </div>
    );
  }


  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 gradient-text">
              Examination History
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Track your progress and review past performance
            </p>
          </div>

          {/* Summary Cards */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="stats-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-12"
              >
                {[...Array(3)].map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="stats-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 sm:mb-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <Award className="w-10 h-10 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">
                    {history.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Exams</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <TrendingUp className="w-10 h-10 text-accent mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">
                    {averageAccuracy}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Score
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6 text-center"
                >
                  <Clock className="w-10 h-10 text-secondary mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{avgTime}</div>
                  <div className="text-sm text-muted-foreground">Avg Time (min)</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History List */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="history-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[...Array(5)].map((_, i) => (
                  <HistoryCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="history-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">No exam history yet.</p>
                    <button
                      onClick={() => navigate("/")}
                      className="px-6 py-3 rounded-full gradient-primary text-white font-semibold"
                    >
                      Start Your First Exam
                    </button>
                  </div>
                ) : (
                  history.map((item: any, index: number) => {
                    const correctAns = item.score || 0;
                    const wrongAns = (item.total_questions || item.total || 0) - correctAns;
                    const subjectName = item.question_sets?.topics?.subjects?.name || 'Subject';
                    const topicName = item.question_sets?.topics?.title || item.exam_title || 'Topic';

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 neon-border group cursor-pointer"
                        onClick={() => {
                          if (item.is_special_group) {
                            navigate(`/special-exam/${item.exam_id}`);
                          } else {
                            navigate(`/review/${item.id}`);
                          }
                        }}
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-border/50">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                  {subjectName}
                                </span>
                                <span className="text-muted-foreground text-xs">•</span>
                                <span className="text-muted-foreground text-xs sm:text-sm font-medium">
                                  {topicName}
                                </span>
                              </div>
                              <h3 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">
                                {item.exam_title || "Topic Exam Attempt"}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-primary/70" />
                                {new Date(item.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg">
                                <Clock className="w-4 h-4 text-accent/70" />
                                {item.time_taken || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-background/40 rounded-xl p-3 text-center">
                              <div className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wider">Score</div>
                              <div className="text-xl sm:text-2xl font-bold text-primary">
                                {correctAns}<span className="text-sm text-muted-foreground font-medium">/{item.total_questions || item.total}</span>
                              </div>
                            </div>
                            
                            <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                              <div className="text-xs text-emerald-600/80 mb-1 uppercase font-semibold tracking-wider">Correct</div>
                              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                                {correctAns}
                              </div>
                            </div>

                            <div className="bg-destructive/10 rounded-xl p-3 text-center border border-destructive/20">
                              <div className="text-xs text-destructive/80 mb-1 uppercase font-semibold tracking-wider">Wrong</div>
                              <div className="text-xl sm:text-2xl font-bold text-destructive">
                                {wrongAns}
                              </div>
                            </div>

                            <div className="bg-accent/10 rounded-xl p-3 text-center border border-accent/20">
                              <div className="text-xs text-accent/80 mb-1 uppercase font-semibold tracking-wider">Accuracy</div>
                              <div className="text-xl sm:text-2xl font-bold text-accent">
                                {item.accuracy}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Progress Bar across bottom */}
                        <div className="h-1.5 w-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.accuracy}%` }}
                            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                            className={`h-full ${item.accuracy >= 85
                              ? "bg-accent"
                              : item.accuracy >= 60
                                ? "bg-primary"
                                : "bg-destructive"
                              }`}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
