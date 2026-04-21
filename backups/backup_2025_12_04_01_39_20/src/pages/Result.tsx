import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Home, TrendingUp, Clock, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { ResultSkeleton } from "@/components/skeletons/ResultSkeleton";
import { adminService } from "@/admin/lib/adminService";

const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            repeat: Infinity,
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: [
              "#a259ff",
              "#00d4ff",
              "#ff6ec7",
              "#ffd700",
            ][Math.floor(Math.random() * 4)],
          }}
        />
      ))}
    </div>
  );
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId } = useParams();
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  const { score = 0, total = 5, timeTaken = 0, setNumber = 0 } = location.state || {};
  const percentage = ((score / total) * 100).toFixed(1);
  const isPassed = parseFloat(percentage) >= 40;

  const [examTitle, setExamTitle] = useState("Exam");
  const [nextSetId, setNextSetId] = useState<string | null>(null);
  const [autoStartTimer, setAutoStartTimer] = useState<number | null>(null);
  const [isAutoStarting, setIsAutoStarting] = useState(false);

  // Load exam title and check for next set
  useEffect(() => {
    const loadData = async () => {
      if (!examId) return;

      try {
        // Load exam title
        const subjects = await adminService.getSubjects();
        const subject = subjects.find(s => s.id === examId);
        if (subject) {
          setExamTitle(subject.name);
        }

        // Check for next set if we have a valid setNumber
        if (setNumber > 0) {
          const allSets = await adminService.getQuestionSets();
          const setsForSubject = allSets.filter(set =>
            set.subject_id === examId || set.exam_id === examId
          );

          // Find next set (current setNumber + 1)
          const nextSet = setsForSubject.find(s => s.set_number === setNumber + 1);

          if (nextSet) {
            setNextSetId(nextSet.id);
            // Start countdown
            setIsAutoStarting(true);
            setAutoStartTimer(10);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [examId, setNumber]);

  // Handle countdown timer
  useEffect(() => {
    if (!isAutoStarting || autoStartTimer === null) return;

    if (autoStartTimer === 0) {
      handleStartNextSet();
      return;
    }

    const timer = setTimeout(() => {
      setAutoStartTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAutoStarting, autoStartTimer]);

  const handleStartNextSet = () => {
    if (nextSetId && examId) {
      // Navigate directly to start the next set
      navigate(`/exam/${examId}/start/${nextSetId}`);
    }
  };

  const handleCancelAutoStart = () => {
    setIsAutoStarting(false);
    setAutoStartTimer(null);
  };

  useEffect(() => {
    // Simulate result calculation delay
    const timer = setTimeout(() => {
      setLoading(false);
      if (isPassed) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPassed]);

  const stats = [
    {
      icon: Target,
      label: "Total Questions",
      value: total,
      color: "text-primary",
    },
    {
      icon: Award,
      label: "Correct Answers",
      value: score,
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      label: "Percentage",
      value: `${percentage}%`,
      color: parseFloat(percentage) >= 40 ? "text-green-500" : "text-red-500",
    },
    {
      icon: Clock,
      label: "Time Taken",
      value: `${timeTaken} min`,
      color: "text-blue-500",
    },
  ];

  if (loading) {
    return <ResultSkeleton />;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background relative overflow-hidden">
      {showConfetti && <Confetti />}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Result Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${isPassed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
            >
              <Award className="w-12 h-12" />
            </motion.div>

            <h1 className="text-3xl font-bold mb-2 gradient-text">
              {isPassed ? "Congratulations!" : "Keep Practicing!"}
            </h1>
            <p className="text-muted-foreground mb-8">
              You have completed the {examTitle} exam.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-muted/50 p-4 rounded-xl"
                >
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Auto-start Next Set Section */}
            {isAutoStarting && nextSetId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-2">Next Set Starting Soon</h3>
                <div className="text-4xl font-bold text-primary mb-4">
                  {autoStartTimer}s
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get ready for the next set of questions!
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleStartNextSet}
                    className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-all"
                  >
                    Start Now
                  </button>
                  <button
                    onClick={handleCancelAutoStart}
                    className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-all"
                  >
                    Stop Auto-start
                  </button>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 rounded-lg border border-border hover:bg-muted font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>

              {!isAutoStarting && nextSetId && (
                <button
                  onClick={handleStartNextSet}
                  className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  Start Next Set <Target className="w-5 h-5" />
                </button>
              )}

              {!nextSetId && (
                <button
                  onClick={() => navigate(`/exam/${examId}`)}
                  className="px-8 py-3 rounded-lg gradient-primary text-white font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  View All Sets <Target className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Result;
