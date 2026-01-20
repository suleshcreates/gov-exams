import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  BookMarked,
  PlayCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Shield // Removed FileText, ArrowRight unused
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast"; // assuming this connects to sonner via existing hook or use sonner directly
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
}

const ExamDetails = () => {
  const { auth } = useAuth();
  const { examId } = useParams(); // This is effectively subjectId
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, boolean>>({}); // topicId -> isCompleted
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Load data
  useEffect(() => {
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
        setTopics(topicsData);
        if (topicsData.length > 0) {
          setExpandedTopic(topicsData[0].id);
        }

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

        // 4. Load Question Sets (Existing logic, but we'll filter by topic later)
        const allSets = await adminService.getQuestionSets();
        const setsForSubject = allSets.filter(set =>
          set.subject_id === examId || set.exam_id === examId
        );
        setQuestionSets(setsForSubject);

      } catch (error) {
        logger.error('Error loading exam details:', error);
        toast({ // Updated toast signature if this is src/hooks/use-toast
          title: "Error",
          description: "Failed to load exam details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      loadData();
    }
  }, [examId, auth.user, auth.isAuthenticated]);

  // Check access (Plan validation)
  useEffect(() => {
    const checkAccess = async () => {
      if (auth.user && examId) {
        const access = await planUtils.hasExamAccess(auth.user.phone, examId);
        setHasAccess(access);
      }
    };
    checkAccess();
  }, [examId, auth.user]);

  const handleVideoComplete = async (topicId: string) => {
    try {
      if (!auth.user) return;

      await studentService.markVideoCompleted(topicId);
      setTopicProgress(prev => ({ ...prev, [topicId]: true }));
      toast({
        title: "Video Completed!",
        description: "You have unlocked the question sets for this topic.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark video as completed.",
        variant: "destructive",
      });
    }
  };

  const handleStartExam = () => {
    if (!selectedSet) {
      toast({ title: "Select a Set", description: "Please select a question set.", variant: "destructive" });
      return;
    }
    if (!hasAccess) {
      navigate("/plans");
      return;
    }
    navigate(`/exam/${examId}/instructions/${selectedSet}`);
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

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

  return (
    <div className="flex-1 pt-20 sm:pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-2 gradient-text">{subjectName}</h1>
            <p className="text-muted-foreground">{subjectDescription}</p>
            {!hasAccess && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                You need a plan to access the exams. <button onClick={() => navigate("/plans")} className="underline font-bold">View Plans</button>
              </div>
            )}
          </div>

          {/* Topics List */}
          <div className="space-y-6">
            {topics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No topics found for this subject.</div>
            ) : (
              topics.map((topic, index) => {
                const isCompleted = topicProgress[topic.id];
                const isExpanded = expandedTopic === topic.id;
                // Direct URL for HTML5 video
                const videoUrl = topic.video_url;

                // Filter sets for this topic
                const topicSets = questionSets.filter(s => s.topic_id === topic.id);

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-card border ${isCompleted ? 'border-green-200' : 'border-border'} rounded-xl overflow-hidden shadow-sm`}
                  >
                    <div
                      onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{index + 1}. {topic.title}</h3>
                          <p className="text-sm text-muted-foreground">{topicSets.length} Sets • {topic.video_duration ? Math.round(topic.video_duration / 60) + ' mins' : 'Video'}</p>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-border">
                            {/* Video Section */}
                            {videoUrl && (
                              <div className="mb-6">
                                <div className="aspect-video rounded-lg overflow-hidden bg-black mb-3">
                                  <video
                                    src={videoUrl}
                                    controls
                                    playsInline
                                    className="w-full h-full object-contain"
                                  // Optional: onEnded={() => handleVideoComplete(topic.id)} // Auto-complete
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                                {!isCompleted && (
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => handleVideoComplete(topic.id)}
                                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Mark Video Completed & Unlock Exams
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Question Sets */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <BookMarked className="w-4 h-4 text-primary" />
                                Practice Sets
                              </h4>
                              {topicSets.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No question sets added for this topic yet.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {topicSets.map((set) => {
                                    const isLocked = !isCompleted;
                                    return (
                                      <button
                                        key={set.id}
                                        disabled={isLocked}
                                        onClick={() => { setSelectedSet(set.id); handleStartExam(); }}
                                        className={`relative p-4 rounded-lg border text-left transition-all ${selectedSet === set.id ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'
                                          } ${isLocked ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'bg-white'}`}
                                      >
                                        {isLocked && (
                                          <div className="absolute top-2 right-2 text-gray-400">
                                            <Lock className="w-4 h-4" />
                                          </div>
                                        )}
                                        <div className="font-bold text-lg mb-1">Set {set.set_number}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                          <Clock className="w-3 h-3" /> {set.time_limit_minutes} mins
                                        </div>
                                        {isLocked && <div className="mt-2 text-xs text-red-500 font-medium">Watch video to unlock</div>}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}

            {/* Fallback for Question Sets without Topic (Legacy Support) */}
            {questionSets.some(s => !s.topic_id) && (
              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-bold mb-4">General Practice Sets</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {questionSets.filter(s => !s.topic_id).map(set => (
                    <button
                      key={set.id}
                      onClick={() => { setSelectedSet(set.id); }}
                      className={`p-4 rounded-lg border text-left ${selectedSet === set.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}`}
                    >
                      <div className="font-bold">Set {set.set_number}</div>
                      <div className="text-xs text-muted-foreground">{set.time_limit_minutes} mins</div>
                    </button>
                  ))}
                </div>
                {selectedSet && questionSets.find(s => s.id === selectedSet && !s.topic_id) && (
                  <div className="mt-4 text-right">
                    <button onClick={handleStartExam} className="px-6 py-2 bg-primary text-white rounded-lg">Start General Set</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
