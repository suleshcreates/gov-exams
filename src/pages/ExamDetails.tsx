import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  BookMarked,
  PlayCircle,
  Lock,
  CheckCircle,
  Shield,
  FileText,
  X,
  Play,
  Target
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { planUtils } from "@/lib/planUtils";
import { adminService } from "@/admin/lib/adminService";
import { studentService } from "@/lib/studentService";
import logger from "@/lib/logger";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionSets, setQuestionSets] = useState<any[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, boolean>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Fetch materials when topic is selected
  useEffect(() => {
    const fetchMaterials = async () => {
      if (selectedTopic) {
        try {
          const m = await studentService.getTopicMaterials(selectedTopic.id);
          setMaterials(m);
          // Set initial active video (primary topic video)
          setActiveVideo({ url: selectedTopic.video_url, title: "Main Lesson" });
        } catch (error) {
          console.error("Failed to fetch materials:", error);
          setMaterials([]);
        }
      } else {
        setMaterials([]);
        setActiveVideo(null);
      }
    };
    fetchMaterials();
  }, [selectedTopic]);

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
    // Dismiss modal if open? Dialog handles it.
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

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="flex-1 pt-20 sm:pt-24 pb-16 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8 mb-10 shadow-xl">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <BookMarked size={300} />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{subjectName}</h1>
              <p className="text-lg md:text-xl text-indigo-100 max-w-2xl">{subjectDescription}</p>

              {!hasAccess && (
                <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <Lock className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium text-yellow-200">Unlock full access with a plan</span>
                  <button onClick={() => navigate("/plans")} className="px-4 py-1.5 bg-white text-indigo-600 rounded-md font-bold text-sm hover:bg-indigo-50 transition-colors">
                    View Plans
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-xl text-muted-foreground font-medium">No topics found for this subject.</p>
              </div>
            ) : (
              topics.map((topic, index) => {
                const isCompleted = topicProgress[topic.id];
                const setsCount = questionSets.filter(s => s.topic_id === topic.id).length;

                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedTopic(topic)}
                    className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500 w-full" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors'}`}>
                          {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                        </div>
                        <span className="text-5xl font-extrabold text-slate-100 absolute top-4 right-4 -z-0 pointer-events-none group-hover:text-slate-100/50 transition-colors">
                          {index + 1}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 relative z-10 group-hover:text-indigo-600 transition-colors">
                        {topic.title}
                      </h3>

                      <p className="text-sm text-gray-500 mb-6 line-clamp-2 min-h-[40px] relative z-10">
                        {topic.description || "Master this topic with video lessons and practice tests."}
                      </p>

                      <div className="flex items-center justify-between text-sm relative z-10 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>{topic.video_duration ? Math.round(topic.video_duration / 60) : 0} mins</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <BookMarked className="w-4 h-4 text-purple-500" />
                          <span>{setsCount} Sets</span>
                        </div>
                      </div>

                      <div className="mt-4 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <button className="w-full py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100 transition-colors">
                          View details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Topic Detail Modal */}
          <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 p-0 border-0 rounded-2xl shadow-2xl">
              {selectedTopic && (() => {
                const topic = selectedTopic;
                const isCompleted = topicProgress[topic.id];
                const topicSets = questionSets.filter(s => s.topic_id === topic.id);

                return (
                  <div className="flex flex-col h-full">
                    {/* Modal Header */}
                    <div className="bg-white p-6 border-b border-border sticky top-0 z-10 flex justify-between items-start">
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">{topic.title}</DialogTitle>
                        <DialogDescription className="mt-1">
                          Watch the video lesson to unlock Practice Sets.
                        </DialogDescription>
                      </div>
                    </div>

                    <div className="p-6 space-y-8">
                      {/* Video Section */}
                      <div className="space-y-6">
                        {/* Unified Player Area */}
                        {activeVideo && (
                          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="flex flex-col">
                              <div className="bg-black">
                                <div className="aspect-video w-full">
                                  <video
                                    key={activeVideo.url} // Force reload on video change
                                    src={activeVideo.url}
                                    controls
                                    controlsList="nodownload"
                                    onContextMenu={(e) => e.preventDefault()}
                                    playsInline
                                    className="w-full h-full object-contain"
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              </div>
                              <div className="p-4 bg-slate-50 flex flex-col md:flex-row items-center justify-between border-t border-slate-200">
                                <div className="flex items-center gap-3 mb-4 md:mb-0">
                                  <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{activeVideo.title}</h3>
                                    {isCompleted && <span className="text-xs text-green-600 font-medium italic">Unlocked Practice Sets</span>}
                                  </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                  {!isCompleted && activeVideo.url === topic.video_url && (
                                    <button
                                      onClick={() => handleVideoComplete(topic.id)}
                                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-all active:scale-95 text-sm"
                                    >
                                      Mark as Completed
                                    </button>
                                  )}
                                  {isCompleted && activeVideo.url === topic.video_url && (
                                    <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-semibold flex items-center gap-1">
                                      ✓ Lesson Completed
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Video Playlist - Styled consistently */}
                        {(materials.some(m => m.type === 'video')) && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Video Library</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Main Topic Video in Playlist */}
                              <button
                                onClick={() => setActiveVideo({ url: topic.video_url, title: "Main Lesson" })}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${activeVideo?.url === topic.video_url ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                              >
                                <div className={`p-2 rounded-lg ${activeVideo?.url === topic.video_url ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                  <PlayCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="font-semibold text-gray-900 text-sm truncate">Main Lesson</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold">Primary Content</div>
                                </div>
                              </button>

                              {/* Additional Videos */}
                              {materials.filter(m => m.type === 'video').map((video) => (
                                <button
                                  key={video.id}
                                  onClick={() => setActiveVideo({ url: video.url, title: video.title })}
                                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${activeVideo?.url === video.url ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                >
                                  <div className={`p-2 rounded-lg ${activeVideo?.url === video.url ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <PlayCircle className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <div className="font-semibold text-gray-900 text-sm truncate">{video.title}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">Supplementary</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Resources Section (PDFs) */}
                      {(topic.pdf_url || materials.some(m => m.type === 'pdf')) && (
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" /> Study Materials
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Primary PDF */}
                            {topic.pdf_url && (
                              <button
                                onClick={() => window.open(`/secure-viewer/topic/${topic.id}`, '_blank')}
                                className="flex items-center gap-4 p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl hover:shadow-md transition-all group text-left"
                              >
                                <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-100 transition-colors">
                                  <Shield className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">Primary Notes</div>
                                  <div className="text-xs text-slate-500">Secured View</div>
                                </div>
                              </button>
                            )}

                            {/* Additional PDFs */}
                            {materials.filter(m => m.type === 'pdf').map((pdf) => (
                              <a
                                key={pdf.id}
                                href={pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl hover:shadow-md transition-all group text-left no-underline"
                              >
                                <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-100 transition-colors">
                                  <FileText className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{pdf.title}</div>
                                  <div className="text-xs text-slate-500">PDF Document</div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Practice Sets */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-indigo-600" /> Practice Sets
                        </h3>
                        {topicSets.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-muted-foreground">No practice sets available yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {topicSets.map((set) => {
                              const isLocked = !isCompleted;
                              return (
                                <button
                                  key={set.id}
                                  disabled={isLocked}
                                  onClick={() => { setSelectedSet(set.id); handleStartExam(); }}
                                  className={`relative flex items-center p-4 rounded-xl border transition-all text-left ${selectedSet === set.id
                                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50'
                                    : 'hover:border-indigo-300 hover:shadow-md bg-white border-slate-200'
                                    } ${isLocked ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
                                >
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isLocked ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {isLocked ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-6 h-6 ml-1" />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">Practice Set {set.set_number}</div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                      <Clock className="w-3 h-3" /> {set.time_limit_minutes} mins
                                      <span className="text-slate-300">•</span>
                                      {isLocked ? <span className="text-red-500 text-xs font-semibold">Locked</span> : <span className="text-green-600 text-xs font-semibold">Unlocked</span>}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
