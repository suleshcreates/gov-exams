import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, ChevronDown, Video, FileText, Trash2,
  FolderOpen, Play, FileQuestion
} from "lucide-react";
import { adminService } from "../lib/adminService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  video_url?: string;
  video_duration?: number;
  pdf_url?: string;
  order_index: number;
}

export default function AdminSubjectContent() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      loadTopics(selectedSubjectId);
      setSelectedTopicId(""); // Reset topic selection
    } else {
      setTopics([]);
      setSelectedTopicId("");
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      setTopicsLoading(true);
      const data = await adminService.getTopics(subjectId);
      setTopics(data);
    } catch (error) {
      toast.error("Failed to load topics");
    } finally {
      setTopicsLoading(false);
    }
  };

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  // Handle Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      toast.error("File too large (max 500MB)");
      return;
    }

    try {
      setUploadingVideo(true);
      setVideoProgress(0);
      const videoUrl = await adminService.uploadTopicVideo(
        file,
        (progress) => setVideoProgress(Math.round(progress))
      );

      // Update the topic with the video URL
      await adminService.updateTopic(selectedTopicId, {
        video_url: videoUrl,
        video_duration: 0,
        title: selectedTopic?.title || "",
        description: selectedTopic?.description || "",
        order_index: selectedTopic?.order_index || 1,
        pdf_url: selectedTopic?.pdf_url || ""
      });

      toast.success("Video uploaded successfully");
      loadTopics(selectedSubjectId);
    } catch (error) {
      toast.error("Failed to upload video");
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  // Handle PDF Upload
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50MB)");
      return;
    }

    try {
      setUploadingPDF(true);
      setPdfProgress(0);
      const pdfUrl = await adminService.uploadTopicPDF(
        file,
        (progress) => setPdfProgress(Math.round(progress))
      );

      // Update the topic with the PDF URL
      await adminService.updateTopic(selectedTopicId, {
        pdf_url: pdfUrl,
        video_url: selectedTopic?.video_url || "",
        video_duration: selectedTopic?.video_duration || 0,
        title: selectedTopic?.title || "",
        description: selectedTopic?.description || "",
        order_index: selectedTopic?.order_index || 1
      });

      toast.success("PDF uploaded successfully");
      loadTopics(selectedSubjectId);
    } catch (error) {
      toast.error("Failed to upload PDF");
    } finally {
      setUploadingPDF(false);
      setPdfProgress(0);
    }
  };

  // Handle navigating to question set manager
  const handleManageQuestions = async () => {
    if (!selectedTopicId || !selectedSubjectId) return;

    try {
      const sets = await adminService.getQuestionSets(selectedSubjectId);
      let topicSet = sets.find((s: any) => s.topic_id === selectedTopicId);

      if (!topicSet) {
        topicSet = await adminService.createQuestionSet({
          subject_id: selectedSubjectId,
          topic_id: selectedTopicId,
          exam_id: selectedTopicId.substring(0, 36),
          set_number: 1,
          time_limit_minutes: 0
        });
        toast.success("Question set created for topic");
      }

      navigate(`/admin/question-sets/${topicSet.id}/questions`);
    } catch (error) {
      toast.error("Failed to access questions");
    }
  };

  // Remove content
  const handleRemoveVideo = async () => {
    if (!selectedTopic || !window.confirm("Remove video from this topic?")) return;

    try {
      await adminService.updateTopic(selectedTopicId, {
        video_url: "",
        video_duration: 0,
        title: selectedTopic.title,
        description: selectedTopic.description || "",
        order_index: selectedTopic.order_index,
        pdf_url: selectedTopic.pdf_url || ""
      });
      toast.success("Video removed");
      loadTopics(selectedSubjectId);
    } catch (error) {
      toast.error("Failed to remove video");
    }
  };

  const handleRemovePDF = async () => {
    if (!selectedTopic || !window.confirm("Remove PDF from this topic?")) return;

    try {
      await adminService.updateTopic(selectedTopicId, {
        pdf_url: "",
        video_url: selectedTopic.video_url || "",
        video_duration: selectedTopic.video_duration || 0,
        title: selectedTopic.title,
        description: selectedTopic.description || "",
        order_index: selectedTopic.order_index
      });
      toast.success("PDF removed");
      loadTopics(selectedSubjectId);
    } catch (error) {
      toast.error("Failed to remove PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subject Content</h1>
        <p className="text-gray-600 mt-1">Upload videos, PDFs, and manage question sets for each topic</p>
      </div>

      {/* Dropdowns */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a Subject --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Topic Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Topic</label>
            <div className="relative">
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={!selectedSubjectId || topicsLoading}
                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {topicsLoading ? "Loading..." : !selectedSubjectId ? "Select subject first" : "-- Select a Topic --"}
                </option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.order_index}. {topic.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {selectedTopicId && selectedTopic ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTopicId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Topic Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">
                Topic: {selectedTopic.title}
              </h3>
              {selectedTopic.description && (
                <p className="text-sm text-blue-700 mt-1">{selectedTopic.description}</p>
              )}
            </div>

            {/* Content Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Video Lesson Card */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Video Lesson</h3>
                </div>
                <div className="p-4">
                  {selectedTopic.video_url ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        <Play className="w-4 h-4" />
                        <span>Video uploaded</span>
                      </div>
                      <a
                        href={selectedTopic.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block truncate"
                      >
                        View Video →
                      </a>
                      <button
                        onClick={handleRemoveVideo}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">No video uploaded</p>
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                        {uploadingVideo ? (
                          <div className="text-center">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                            <span className="text-xs text-blue-600 mt-1">{videoProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload Video</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                          disabled={uploadingVideo}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Set Card */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 bg-green-50 border-b border-green-100 flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Question Set</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-3">Manage MCQ questions for this topic</p>
                  <button
                    onClick={handleManageQuestions}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Open Question Manager
                  </button>
                </div>
              </div>

              {/* PDF Notes Card */}
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">PDF Notes</h3>
                </div>
                <div className="p-4">
                  {selectedTopic.pdf_url ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        <FileText className="w-4 h-4" />
                        <span>PDF uploaded</span>
                      </div>
                      <a
                        href={selectedTopic.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block"
                      >
                        View PDF →
                      </a>
                      <button
                        onClick={handleRemovePDF}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500">No PDF uploaded</p>
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition-colors">
                        {uploadingPDF ? (
                          <div className="text-center">
                            <Loader2 className="w-5 h-5 animate-spin text-red-500 mx-auto" />
                            <span className="text-xs text-red-600 mt-1">{pdfProgress}%</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload PDF</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handlePDFUpload}
                          className="hidden"
                          disabled={uploadingPDF}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">
            {!selectedSubjectId
              ? "Select a subject and topic to manage content"
              : !selectedTopicId
                ? "Select a topic to manage its content"
                : "Loading..."}
          </p>
          <p className="text-gray-400 mt-2">
            Choose from the dropdowns above to upload videos, PDFs, and manage question sets
          </p>
        </div>
      )}
    </div>
  );
}
