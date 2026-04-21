import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabaseService } from "@/lib/supabaseService";
import {
  User,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Trophy,
  Target,
  Crown,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { subscriptionPlans } from "@/data/mockData";
import { ProfileHeaderSkeleton } from "@/components/skeletons/ProfileHeaderSkeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { PerformanceChartSkeleton } from "@/components/skeletons/PerformanceChartSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/admin/lib/adminService";

const Profile = () => {
  const { auth } = useAuth();
  const user = auth.user;
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ totalExams: 0, averageScore: "0", examsPassed: 0 });
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [purchasedPlans, setPurchasedPlans] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [globalRank, setGlobalRank] = useState<number>(1);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!auth.isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Load student info
        const student = await supabaseService.getStudentByPhone(user.phone);
        setStudentInfo(student);

        // Load exam history
        const results = await supabaseService.getStudentExamResults(user.phone);
        setHistory(results);

        // Load analytics
        const stats = await supabaseService.getStudentAnalytics(user.phone);
        setAnalytics({
          totalExams: stats.totalExams,
          averageScore: stats.averageScore.toString(),
          examsPassed: stats.examsPassed,
        });

        // Load purchased plans
        const plans = await supabaseService.getStudentPlans(user.phone);
        setPurchasedPlans(plans);

        // Load subjects for plan display
        const allSubjects = await adminService.getSubjects();
        setSubjects(allSubjects);

        // Load global rank
        const rank = await supabaseService.getStudentGlobalRank(user.phone);
        setGlobalRank(rank);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [auth, user]);

  if (!auth.isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <h1 className="text-3xl font-bold gradient-text">Please login to view your profile</h1>
      </div>
    );
  }


  const avatarFallback = "/avatar-placeholder.png";
  const memberSince = studentInfo?.created_at ? new Date(studentInfo.created_at) : new Date();

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Profile Header */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="header-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-8"
              >
                <ProfileHeaderSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="header-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl p-4 sm:p-8 mb-8 neon-border relative overflow-hidden"
              >
                <div className="absolute inset-0 gradient-primary opacity-5" />
                <div className="relative flex flex-wrap gap-6 sm:gap-8 items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden neon-glow ring-4 ring-primary/20"
                  >
                    {/* If you have an avatar system, use real, else fallback */}
                    <img src={avatarFallback} alt={user.name} className="w-full h-full object-cover" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 gradient-text">
                      {user.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-sm sm:text-base text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Phone: {user.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Joined {memberSince ? memberSince.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-center w-full sm:w-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3 neon-glow">
                      <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">
                      #{globalRank}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Global Rank</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="stats-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
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
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card rounded-2xl p-6 text-center group hover:neon-border transition-all"
                >
                  <Award className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2 gradient-text">
                    {analytics.totalExams}
                  </div>
                  <div className="text-muted-foreground">Exams Completed</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6 text-center group hover:neon-border transition-all"
                >
                  <TrendingUp className="w-12 h-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2 gradient-text">
                    {analytics.averageScore}%
                  </div>
                  <div className="text-muted-foreground">Average Score</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card rounded-2xl p-6 text-center group hover:neon-border transition-all"
                >
                  <Target className="w-12 h-12 text-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-bold mb-2 gradient-text">
                    {analytics.examsPassed}
                  </div>
                  <div className="text-muted-foreground">Exams Passed (85%+)</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Chart */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="chart-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PerformanceChartSkeleton />
              </motion.div>
            ) : (
              <motion.div
                key="chart-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold mb-6 gradient-text">
                  Recent Performance
                </h2>
                <div className="space-y-6">
                  {history.slice(-6).reverse().map((item: any, index: number) => (
                    <div key={item.id || index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {item.exam_title || item.exam_id || "Exam"}
                        </span>
                        <span className="text-sm font-bold gradient-text">
                          {item.accuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.accuracy.toFixed(0)}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className={`h-full rounded-full ${item.accuracy >= 85
                            ? "gradient-accent"
                            : item.accuracy >= 60
                              ? "gradient-primary"
                              : "bg-destructive"
                            }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Purchased Plans */}
          {purchasedPlans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-4 sm:p-8 mt-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold gradient-text">
                  Purchased Plans
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {purchasedPlans.map((plan) => {
                  const planDetails = subscriptionPlans.find(p => p.id === plan.plan_id);
                  const purchasedDate = new Date(plan.purchased_at);
                  const isExpired = plan.expires_at && new Date(plan.expires_at) < new Date();

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`glass-card rounded-xl p-4 sm:p-6 border-2 ${planDetails?.isMaster
                        ? "border-primary shadow-lg"
                        : planDetails?.isPopular
                          ? "border-primary/50"
                          : "border-border"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold gradient-text mb-1">
                            {plan.plan_name || planDetails?.name}
                          </h3>
                          {planDetails?.isMaster && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                              <Crown className="w-3 h-3 fill-current" />
                              Master Plan
                            </span>
                          )}
                        </div>
                        {isExpired ? (
                          <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-600 text-xs font-semibold">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-600 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price Paid</span>
                          <span className="font-bold gradient-text">₹{plan.price_paid}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Subjects</span>
                          <span className="font-semibold">
                            {plan.exam_ids?.filter((id: string) => subjects.find(s => s.id === id)).length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Purchased</span>
                          <span className="font-semibold">
                            {purchasedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        {plan.expires_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-semibold">
                              {new Date(plan.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        )}
                        {!plan.expires_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Access</span>
                            <span className="font-semibold text-green-600">Lifetime</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Includes:</p>
                        <div className="space-y-1">
                          {plan.exam_ids?.map((examId: string) => {
                            const subject = subjects.find(s => s.id === examId);
                            return subject ? (
                              <div key={examId} className="text-xs font-medium text-foreground flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-primary" />
                                {subject.name}
                              </div>
                            ) : null;
                          })}
                          {!plan.exam_ids || plan.exam_ids.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No subjects selected
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Personal Info */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="info-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-2xl p-4 sm:p-8 mt-8 space-y-6"
              >
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="info-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-2xl p-4 sm:p-8 mt-8"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 gradient-text">
                  Account Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl glass">
                    <User className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Full Name
                      </div>
                      <div className="font-semibold">{user.name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl glass">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Phone
                      </div>
                      <div className="font-semibold">{user.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl glass">
                    <Calendar className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Member Since
                      </div>
                      <div className="font-semibold">
                        {memberSince ? memberSince.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl glass">
                    <Trophy className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Current Rank
                      </div>
                      <div className="font-semibold">#{globalRank}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
