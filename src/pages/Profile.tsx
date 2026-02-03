import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
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
  FileText,
  BookOpen,
  Phone,
  Edit2,
  LogOut,
  Clock,
  ChevronRight,
  Activity,
  BarChart
} from "lucide-react";
import { useState, useEffect } from "react";
import { subscriptionPlans } from "@/data/mockData";
import { ProfileHeaderSkeleton } from "@/components/skeletons/ProfileHeaderSkeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { PerformanceChartSkeleton } from "@/components/skeletons/PerformanceChartSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/admin/lib/adminService";

const Profile = () => {
  const { auth, signOut } = useAuth();
  const user = auth.user;
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ totalExams: 0, averageScore: "0", examsPassed: 0 });
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [purchasedPlans, setPurchasedPlans] = useState<any[]>([]);
  const [purchasedSubjects, setPurchasedSubjects] = useState<any[]>([]);
  const [premiumPurchases, setPremiumPurchases] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [globalRank, setGlobalRank] = useState<number>(1);

  // Derived state
  const activePlans = purchasedPlans;
  const individualSubjects = purchasedSubjects;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!auth.isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get auth token
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }

        // Fetch complete profile from backend API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const { profile } = data;

        // Set all profile data from API response
        setStudentInfo(profile.student);
        setHistory(profile.examResults || []);
        setAnalytics({
          totalExams: profile.analytics.totalExams,
          averageScore: profile.analytics.averageScore.toString(),
          examsPassed: profile.analytics.examsPassed,
        });
        setGlobalRank(profile.globalRank || 1);

        // Load purchased plans AND subjects
        const { plans, purchasedSubjects } = await supabaseService.getStudentPlans(user.phone);
        setPurchasedPlans(plans);
        setPurchasedSubjects(purchasedSubjects);

        // Load premium purchases (Special Exams & PYQ)
        const premiums = await supabaseService.getUserPremiumPurchases();
        setPremiumPurchases(premiums);

        // Load subjects for plan display
        const allSubjects = await adminService.getSubjects();
        setSubjects(allSubjects);
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-border">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Please Log In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-24">
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: IDENTITY SIDEBAR (30%) */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="glass-card rounded-xl shadow-sm border border-border sticky top-24 overflow-hidden">
              {/* Profile Header Background */}
              <div className="h-24 bg-gradient-to-r from-primary to-blue-900 relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="relative -mt-12 mb-4 flex justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-card bg-background flex items-center justify-center shadow-md overflow-hidden group">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Hover Edit Overlay (Optional Future Feature) */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Edit2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Identity Info */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                  <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium border border-primary/20">
                    Student
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="truncate">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate" title={studentInfo?.email || user.email || 'No email'}>
                        {studentInfo?.email || user.email || 'Add Email'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Joined {new Date(studentInfo?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-2 border-t border-border">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                          signOut();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DASHBOARD (70%) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">

            {/* 1. KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Global Rank */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 flex flex-col items-start relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Trophy className="w-16 h-16 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Global Rank</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">#{globalRank}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Top 5% of students</p>
              </motion.div>

              {/* Average Score */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 flex flex-col items-start relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <TrendingUp className="w-16 h-16 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Average Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{analytics.averageScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on {history.length} exams</p>
              </motion.div>

              {/* Exams Passed */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 flex flex-col items-start relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <CheckCircle className="w-16 h-16 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Exams Passed</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{analytics.examsPassed}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total completed</p>
              </motion.div>
            </div>

            {/* 2. ACTIVE LEARNING (Plans & Subjects) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Active Learning
                </h2>
                {/* <Link to="/exams" className="text-sm font-medium text-primary hover:underline">
                        Find more courses
                    </Link> */}
              </div>

              {activePlans.length === 0 && individualSubjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl border border-dashed border-border p-8 text-center"
                >
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No Active Subscriptions</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                    Start your preparation journey by unlocking a subject or plan suitable for your goals.
                  </p>
                  <Link to="/exams" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Explore Exams
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {/* ACTIVE PLANS */}
                  {activePlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-border shadow-sm p-0 overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow"
                    >
                      {/* Left Color Strip */}
                      <div className="w-full sm:w-2 bg-gradient-to-b from-primary to-blue-600"></div>

                      <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">{plan.plan_name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                            ACTIVE
                          </span>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>Validity: {plan.validity_days || 365} Days</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                          {/* Mock Progress - Can be real if we calculate it */}
                          <div className="hidden sm:block text-right">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Set Progress</div>
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                          </div>

                          <Link
                            to="/#exams-section"
                            className="ml-auto sm:ml-0 px-5 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                          >
                            View Content
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* PURCHASED SUBJECTS */}
                  {individualSubjects.map((purchase) => {
                    const subject = subjects.find(s => s.id === purchase.subject_id);
                    const isExpired = purchase.expires_at && new Date(purchase.expires_at) < new Date();
                    const expiryDate = purchase.expires_at ? new Date(purchase.expires_at) : null;
                    const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;

                    return (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-xl border ${isExpired ? 'border-destructive/30' : 'border-border'} shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-md transition-shadow`}
                      >
                        {/* Left Color Strip */}
                        <div className={`w-full sm:w-2 ${isExpired ? 'bg-destructive/50' : 'bg-gradient-to-b from-accent to-orange-500'}`}></div>

                        <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground">
                              {subject?.name || 'Subject Content'}
                            </h3>
                            {isExpired ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20">
                                EXPIRED
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                                SUBJECT
                              </span>
                            )}

                            {/* Purchased date removed for separate history */}
                            {!isExpired && expiryDate && (
                              <div className={`flex items-center gap-1.5 ${daysLeft < 30 ? 'text-amber-600 font-medium' : ''}`}>
                                <Clock className="w-4 h-4" />
                                <span>
                                  Expires: {expiryDate.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                            {!isExpired ? (
                              <Link
                                to={`/exam/${subject?.id}`}
                                className="ml-auto sm:ml-0 px-5 py-2 bg-accent/10 text-accent-foreground hover:bg-accent hover:text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-accent/20 hover:border-accent"
                              >
                                Start Learning
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            ) : (
                              <button disabled className="ml-auto sm:ml-0 px-5 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-semibold cursor-not-allowed">
                                Access Expired
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. PURCHASE HISTORY */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Purchase History
              </h2>

              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Item</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {purchasedPlans.map(plan => (
                        <tr key={`plan-${plan.id}`} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{plan.plan_name}</td>
                          <td className="px-4 py-3 text-muted-foreground">Plan</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(plan.purchased_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-foreground">₹{plan.price_paid}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              Success
                            </span>
                          </td>
                        </tr>
                      ))}
                      {purchasedSubjects.map(sub => {
                        const subject = subjects.find(s => s.id === sub.subject_id);
                        return (
                          <tr key={`subject-${sub.id}`} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{subject?.name || 'Subject'}</td>
                            <td className="px-4 py-3 text-muted-foreground">Subject</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-foreground">₹{sub.price_paid || 99}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                Success
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {purchasedPlans.length === 0 && purchasedSubjects.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No purchase history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 4. RECENT ACTIVITY (Placeholder / Graph Area) */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </h2>

              {history.length > 0 ? (
                <div className="bg-white rounded-xl border border-border  p-6">
                  {/* Reusing existing History Table Logic but styling it better or simplified */}
                  <div className="space-y-4">
                    {history.slice(0, 5).map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0 h-full">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                                             ${exam.score >= 35 ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}
                                         `}>
                            {exam.score}%
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{exam.exam_title || exam.set_name || 'Exam'}</h4>
                            <p className="text-xs text-muted-foreground">{new Date(exam.completed_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${exam.score >= 35 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {exam.score >= 35 ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                    {history.length > 5 && (
                      <div className="pt-2 text-center">
                        <button className="text-sm text-primary font-medium hover:underline">View All History</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-border p-8 text-center">
                  <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <BarChart className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">No recent activity</h3>
                  <p className="text-sm text-muted-foreground mb-4">Complete your first exam to see analytics here.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main >
    </div >
  );
};

export default Profile;
