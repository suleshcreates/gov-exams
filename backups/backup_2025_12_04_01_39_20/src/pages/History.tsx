import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, TrendingUp, Clock, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabaseService } from "@/lib/supabaseService";
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
  
  useEffect(() => {
    const loadHistory = async () => {
      if (!auth.isAuthenticated || !auth.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await supabaseService.getStudentExamResults(auth.user.phone);
        setHistory(results);

        if (results.length > 0) {
          const avg = (results.reduce((acc: number, h: any) => acc + h.accuracy, 0) / results.length).toFixed(1);
          setAverageAccuracy(avg);
          
          const avgT = Math.round(results.reduce((acc: number, h: any) => {
            const timeStr = h.time_taken || "0";
            const mins = parseInt(timeStr.toString().replace(/[^0-9]/g, "") || "0");
            return acc + mins;
          }, 0) / results.length);
          setAvgTime(avgT);
        }
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [auth]);

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
                  history.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 8 }}
                className="glass-card rounded-2xl p-4 sm:p-6 neon-border group cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 sm:gap-6">
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 group-hover:gradient-text transition-all">
                      {item.exam_title || item.exam_id || "Exam"}
                    </h3>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {item.time_taken || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Score
                      </div>
                      <div className="text-xl sm:text-2xl font-bold gradient-text">
                        {item.score}/{item.total_questions || item.total}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Accuracy
                      </div>
                      <div
                        className={`text-xl sm:text-2xl font-bold ${
                          item.accuracy >= 85
                            ? "text-accent"
                            : item.accuracy >= 60
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {item.accuracy}%
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/review/${item.id}`)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full gradient-primary text-white font-medium text-sm sm:text-base hover:opacity-90 transition-opacity"
                    >
                      View
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`h-full rounded-full ${
                        item.accuracy >= 85
                          ? "gradient-accent"
                          : item.accuracy >= 60
                          ? "gradient-primary"
                          : "bg-destructive"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
                  ))
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
