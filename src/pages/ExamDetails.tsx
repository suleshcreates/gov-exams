import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  BookMarked,
  PlayCircle,
  Lock,
  CheckCircle,
  ArrowRight,
  FileText,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { planUtils } from "@/lib/planUtils";
import { adminService } from "@/admin/lib/adminService";
import { studentService } from "@/lib/studentService";
import logger from "@/lib/logger";

interface Topic {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  video_url: string;
  video_duration: number;
  order_index: number;
  pdf_url?: string;
}

const ExamDetails = () => {
  const { auth } = useAuth();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    if (!examId || !auth.user) return;

    try {
      setLoading(true);

      // 1. Load Subject Details
      const subjects = await adminService.getSubjects();
      const subject = subjects.find(s => s.id === examId);
      if (subject) {
        setSubjectName(subject.name);
        setSubjectDescription(subject.description || 'Exam questions for ' + subject.name);
      }

      // 2. Load Topics
      const topicsData = await studentService.getTopicsBySubject(examId);
      // Sort by order_index
      const sortedTopics = (topicsData || []).sort((a, b) => a.order_index - b.order_index);
      setTopics(sortedTopics);

      // 3. Load Topic Progress
      const progressMap: Record<string, boolean> = {};
      await Promise.all(topicsData.map(async (topic) => {
        try {
          const prog = await studentService.getTopicProgress(topic.id);
          progressMap[topic.id] = prog?.is_video_completed || false;
        } catch (e) {
          console.error(`Failed to load progress for topic ${topic.id}`, e);
        }
      }));
      setTopicProgress(progressMap);

      // 4. Load Question Sets
      const allSets = await adminService.getQuestionSets();
      const setsForSubject = allSets.filter(set =>
        set.subject_id === examId || set.exam_id === examId
      );
      setQuestionSets(setsForSubject);

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

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadData();
    }
  }, [examId, auth.user, auth.isAuthenticated]);

  // Check access
  useEffect(() => {
    const checkAccess = async () => {
      if (auth.user && examId) {
        const access = await planUtils.hasExamAccess(auth.user.phone, examId);
        setHasAccess(access);
      }
    };
    checkAccess();
  }, [examId, auth.user]);

  const handleTopicClick = (topicId: string) => {
    if (!hasAccess) {
      navigate("/plans");
      return;
    }
    navigate(`/exam/${examId}/topic/${topicId}`);
  };

  const handleResume = () => {
    // Find first incomplete topic or last accessed
    // For now, just find first incomplete
    if (!hasAccess) {
      navigate("/plans");
      return;
    }
    const firstIncomplete = topics.find(t => !topicProgress[t.id]);
    if (firstIncomplete) {
      navigate(`/exam/${examId}/topic/${firstIncomplete.id}`);
    } else if (topics.length > 0) {
      navigate(`/exam/${examId}/topic/${topics[0].id}`);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please login to access content.</h1>
          <a href="/login"><button className="px-6 py-3 rounded-full gradient-primary text-white font-bold">Login</button></a>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const completedCount = Object.values(topicProgress).filter(Boolean).length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  return (
    <div className="flex-1 pt-20 sm:pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

        {/* COMPACT HERO HEADER */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                  Subject
                </span>
                {hasAccess && (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                    <CheckCircle className="w-3 h-3" /> Purchased
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                {subjectName}
              </h1>
              <p className="text-slate-500 font-medium">
                {subjectDescription}
              </p>

              {/* Overall Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>OVERALL PROGRESS</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              {!hasAccess ? (
                <button
                  onClick={() => navigate("/plans")}
                  className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Unlock Full Access
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="w-full md:w-auto px-8 py-3 gradient-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5 fill-current" />
                  {progressPercentage > 0 ? 'Resume Learning' : 'Start Learning'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SYLLABUS LIST */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-500" />
            Syllabus Map
          </h2>

          {topics.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No topics available yet.</p>
            </div>
          ) : (
            topics.map((topic, index) => {
              const isCompleted = topicProgress[topic.id];
              const setsCount = questionSets.filter(s => s.topic_id === topic.id).length;
              const isLocked = !hasAccess && index > 0; // First topic could be free? simplified strict check for now: !hasAccess is locked

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTopicClick(topic.id)}
                  className={`group relative bg-white rounded-2xl p-5 border transition-all cursor-pointer ${isLocked
                      ? 'border-slate-100 opacity-75 grayscale hover:grayscale-0 hover:opacity-100'
                      : 'border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isLocked
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : <div className="font-black text-lg">{index + 1}</div>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-bold text-lg truncate ${isLocked ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                          {topic.title}
                        </h3>
                        {isLocked && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">LOCKED</span>}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>1 Video</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>1 Note</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{setsCount} Sets</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{topic.video_duration ? Math.round(topic.video_duration / 60) : 0}m</span>
                        </div>
                      </div>
                    </div>

                    <div className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full border ${isLocked ? 'hidden' : 'border-slate-200 text-slate-300 group-hover:border-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all'}`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default ExamDetails;
