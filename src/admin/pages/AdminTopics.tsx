import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Plus, Edit2, Trash2, Video, GripVertical, Upload, Loader2, FileQuestion, Layers
} from "lucide-react";
import { adminService } from "../lib/adminService";
import AdminHeader from "../components/AdminHeader";
import TopicContentManager from "../components/TopicContentManager";
import { toast } from "sonner";

interface Topic {
    id: string;
    subject_id: string;
    title: string;
    description: string;
    video_url: string;
    video_duration: number;
    order_index: number;
    is_active: boolean;
    pdf_url?: string;
}

export default function AdminTopics() {
    const { subjectId } = useParams<{ subjectId: string }>();
    const navigate = useNavigate();
    const [subject, setSubject] = useState<any>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

    // Content Manager State
    const [contentManagerOpen, setContentManagerOpen] = useState(false);
    const [selectedTopicForContent, setSelectedTopicForContent] = useState<Topic | null>(null);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ video: number, pdf: number }>({ video: 0, pdf: 0 });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        video_url: "",
        video_duration: 0,
        order_index: 0,
        pdf_url: ""
    });

    useEffect(() => {
        fetchData();
    }, [subjectId]);

    const fetchData = async () => {
        try {
            if (!subjectId) return;
            const [subjectData, topicsData] = await Promise.all([
                adminService.getSubjectById(subjectId),
                adminService.getTopics(subjectId)
            ]);
            setSubject(subjectData);
            setTopics(topicsData);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple validation
            if (file.size > 500 * 1024 * 1024) { // 500MB limit
                toast.error("File size too large (max 500MB)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handlePDFSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error("Please select a PDF file");
                return;
            }
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                toast.error("PDF size too large (max 50MB)");
                return;
            }
            setSelectedPDF(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let videoUrl = formData.video_url;
        let pdfUrl = formData.pdf_url;

        try {
            setUploading(true);
            setUploadProgress({ video: 0, pdf: 0 });

            const uploadPromises: Promise<{ type: 'video' | 'pdf', url: string }>[] = [];

            // Handle Video Upload if file selected
            if (selectedFile) {
                uploadPromises.push(
                    adminService.uploadTopicVideo(selectedFile, (p) => setUploadProgress(prev => ({ ...prev, video: Math.round(p) })))
                        .then(url => {
                            toast.success("Video uploaded successfully");
                            return { type: 'video', url };
                        })
                );
            }

            // Handle PDF Upload if file selected
            if (selectedPDF) {
                uploadPromises.push(
                    adminService.uploadTopicPDF(selectedPDF, (p) => setUploadProgress(prev => ({ ...prev, pdf: Math.round(p) })))
                        .then(url => {
                            toast.success("PDF uploaded successfully");
                            return { type: 'pdf', url };
                        })
                );
            }

            if (uploadPromises.length > 0) {
                const results = await Promise.all(uploadPromises);
                results.forEach(result => {
                    if (result.type === 'video') videoUrl = result.url;
                    if (result.type === 'pdf') pdfUrl = result.url;
                });
            }

        } catch (error) {
            setUploading(false);
            toast.error("Failed to upload files. Check file size/network.");
            return;
        }

        try {
            if (editingTopic) {
                await adminService.updateTopic(editingTopic.id, {
                    ...formData,
                    video_url: videoUrl,
                    pdf_url: pdfUrl
                });
                toast.success("Topic updated successfully");
            } else {
                await adminService.createTopic({
                    subject_id: subjectId!,
                    ...formData,
                    video_url: videoUrl,
                    pdf_url: pdfUrl
                });
                toast.success("Topic created successfully");
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error("Failed to save topic");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure? This will delete all associated video progress.")) {
            try {
                await adminService.deleteTopic(id);
                toast.success("Topic deleted");
                fetchData();
            } catch (error) {
                toast.error("Failed to delete topic");
            }
        }
    };

    const handleManageQuestions = async (topic: Topic) => {
        try {
            setLoading(true);
            // Check if question set exists for this topic
            const sets = await adminService.getQuestionSets(subjectId);
            let topicSet = sets.find((s: any) => s.topic_id === topic.id);

            if (!topicSet) {
                topicSet = await adminService.createQuestionSet({
                    subject_id: subjectId!,
                    topic_id: topic.id,
                    exam_id: topic.id.substring(0, 36), // Use ID as generic identifier (fits in 50 chars)
                    set_number: 1, // Default, not really used for topics
                    time_limit_minutes: 0 // Unlimited/Not applicable
                });
                toast.success("Question set created for topic");
            }

            // Navigate to question manager
            navigate(`/admin/question-sets/${topicSet.id}/questions`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to access questions");
        } finally {
            setLoading(false);
        }
    };

    const openContentManager = (topic: Topic) => {
        setSelectedTopicForContent(topic);
        setContentManagerOpen(true);
    };

    const resetForm = () => {
        setEditingTopic(null);
        setFormData({
            title: "",
            description: "",
            video_url: "",
            video_duration: 0,
            order_index: (topics.length || 0) + 1,
            pdf_url: ""
        });
        setSelectedFile(null);
        setSelectedPDF(null);
        setUploading(false);
    };

    const openEditModal = (topic: Topic) => {
        setEditingTopic(topic);
        setSelectedFile(null);
        setFormData({
            title: topic.title,
            description: topic.description || "",
            video_url: topic.video_url || "",
            video_duration: topic.video_duration || 0,
            order_index: topic.order_index,
            pdf_url: topic.pdf_url || ""
        });
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/subjects')}
                            className="p-2 hover:bg-white rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {subject?.name}: Topics
                            </h1>
                            <p className="text-slate-500">Manage video lessons and topics</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Topic
                    </button>
                </div>

                <div className="space-y-4">
                    {topics.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                            <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No topics yet</h3>
                            <p className="text-slate-500">Create your first topic to start adding content.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {topics.map((topic) => (
                                <motion.div
                                    key={topic.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4"
                                >
                                    <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-400">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {topic.order_index}. {topic.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openContentManager(topic)}
                                                    className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                                                >
                                                    <Layers className="w-4 h-4" />
                                                    Content
                                                </button>
                                                <button
                                                    onClick={() => handleManageQuestions(topic)}
                                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
                                                    title="Quick Access to default Question Set"
                                                >
                                                    <FileQuestion className="w-4 h-4" />
                                                    <span className="text-sm font-medium hidden sm:inline">Questions</span>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(topic)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(topic.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 mb-4">{topic.description}</p>

                                        {topic.video_url && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
                                                <Video className="w-4 h-4" />
                                                <a href={topic.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs block">
                                                    View Video
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </main>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingTopic ? "Edit Topic" : "Create New Topic"}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Topic Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="e.g. Introduction to Calculus"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Brief overview of what this topic covers..."
                                    />
                                </div>

                                <div className="space-y-4 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100/50 rounded-lg">
                                            <Upload className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900">
                                                Video File
                                            </label>
                                            <p className="text-xs text-slate-500">Upload MP4, WebM (max 100MB)</p>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileSelect}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100
                                        "
                                    />

                                    {formData.video_url && !selectedFile && (
                                        <div className="text-xs text-green-600 flex items-center gap-1">
                                            <Video className="w-3 h-3" />
                                            Current video: ...{formData.video_url.slice(-20)}
                                        </div>
                                    )}

                                    {uploading && selectedFile && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-slate-500">
                                                <span>Video progress</span>
                                                <span>{uploadProgress.video}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress.video}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* PDF Upload */}
                                <div className="space-y-4 border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-100/50 rounded-lg">
                                            <FileQuestion className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900">
                                                PDF Notes
                                            </label>
                                            <p className="text-xs text-slate-500">Upload PDF (max 50MB)</p>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePDFSelect}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-red-50 file:text-red-700
                                            hover:file:bg-red-100
                                        "
                                    />

                                    {/* Display Current PDF URL */}
                                    {formData.pdf_url && !selectedPDF && (
                                        <div className="text-xs text-green-600 flex items-center gap-1">
                                            <FileQuestion className="w-3 h-3" />
                                            Current PDF: <a href={formData.pdf_url} target="_blank" rel="noopener noreferrer" className="hover:underline">View PDF</a>
                                        </div>
                                    )}

                                    {uploading && selectedPDF && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-slate-500">
                                                <span>PDF progress</span>
                                                <span>{uploadProgress.pdf}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                                <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${uploadProgress.pdf}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hidden URL input for fallback/direct entry if needed? Kept for data structure mostly. */}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Duration (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.video_duration}
                                            onChange={(e) => setFormData({ ...formData, video_duration: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Order Index
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {uploading ? "Uploading..." : (editingTopic ? "Save Changes" : "Create Topic")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Manager Modal */}
            {selectedTopicForContent && (
                <TopicContentManager
                    isOpen={contentManagerOpen}
                    onClose={() => { setContentManagerOpen(false); setSelectedTopicForContent(null); }}
                    topic={selectedTopicForContent}
                />
            )}
        </div>
    );
}
