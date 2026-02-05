import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    FileText,
    Target,
    Menu,
    CheckCircle,
    Lock,
    ArrowLeft,
    Flag,
    Star,
    MessageCircle,
    BookOpen,
    Info,
    Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { studentService } from "@/lib/studentService";
import { adminService } from "@/admin/lib/adminService";
import { toast } from "@/hooks/use-toast";
import { planUtils } from "@/lib/planUtils";
import Navbar from "@/components/Navbar";

interface Topic {
    id: string;
    title: string;
    description: string;
    video_url: string;
    order_index: number;
    pdf_url?: string;
}

interface Material {
    id: string;
    type: 'video' | 'pdf';
    title: string;
    url: string;
}

interface QuestionSet {
    id: string;
    set_number: number;
    time_limit_minutes: number;
}

const TopicLearningConsole = () => {
    const { examId, topicId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
    const [activeContent, setActiveContent] = useState<{ type: 'video' | 'pdf', url: string, title: string } | null>(null);
    const [isVideoCompleted, setIsVideoCompleted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa'>('overview');

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (!examId || !topicId || !auth.user) return;

            try {
                setLoading(true);

                // Check Access
                const hasAccess = await planUtils.hasExamAccess(auth.user.phone, examId);
                if (!hasAccess) {
                    toast({ title: "Access Denied", description: "You need to purchase a plan to access this content.", variant: "destructive" });
                    navigate(`/exam/${examId}`);
                    return;
                }

                // 1. Get All Topics (for navigation)
                const allTopics = await studentService.getTopicsBySubject(examId);
                const sortedTopics = allTopics.sort((a, b) => a.order_index - b.order_index);
                setTopics(sortedTopics);

                // 2. Get Current Topic
                const topic = sortedTopics.find(t => t.id === topicId);
                if (!topic) throw new Error("Topic not found");
                setCurrentTopic(topic);

                // 3. Get Progress
                const progress = await studentService.getTopicProgress(topicId);
                setIsVideoCompleted(progress?.is_video_completed || false);

                // 4. Get Materials
                const mats = await studentService.getTopicMaterials(topicId);
                setMaterials(mats);

                // 5. Get Sets
                const allSets = await adminService.getQuestionSets();
                const topicSets = allSets.filter(s => s.topic_id === topicId);
                setQuestionSets(topicSets);

                // Set Initial Content (Main Video)
                if (topic.video_url) {
                    setActiveContent({ type: 'video', url: topic.video_url, title: "Main Lesson" });
                }

            } catch (error) {
                console.error("Error loading topic:", error);
                toast({ title: "Error", description: "Failed to load topic content", variant: "destructive" });
                navigate(`/exam/${examId}`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [examId, topicId, auth.user]);

    const handleVideoComplete = async () => {
        if (!topicId || !auth.user) return;
        try {
            await studentService.markVideoCompleted(topicId);
            setIsVideoCompleted(true);
            toast({ title: "Completed!", description: "You've completed this lesson.", className: "bg-green-600 text-white" });
        } catch (error) {
            console.error(error);
        }
    };

    const navigateTopic = (direction: 'next' | 'prev') => {
        if (!currentTopic || topics.length === 0) return;
        const currentIndex = topics.findIndex(t => t.id === currentTopic.id);
        if (currentIndex === -1) return;

        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < topics.length) {
            navigate(`/exam/${examId}/topic/${topics[newIndex].id}`);
        }
    };

    const isNextAvailable = currentTopic && topics.findIndex(t => t.id === currentTopic.id) < topics.length - 1;
    const isPrevAvailable = currentTopic && topics.findIndex(t => t.id === currentTopic.id) > 0;

    // --- WATERMARK GENERATION ---
    const WatermarkOverlay = () => {
        const watermarkText = auth.user?.email || auth.user?.phone || "GovExams User";
        // Create a grid of watermarks
        const rows = 6;
        const cols = 4;

        return (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none">
                <div className="w-full h-full flex flex-col justify-between opacity-[0.15]">
                    {Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="flex justify-around">
                            {Array.from({ length: cols }).map((_, c) => (
                                <div
                                    key={c}
                                    className="transform -rotate-12 text-white font-bold text-sm sm:text-lg whitespace-nowrap"
                                >
                                    {watermarkText}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
    if (!currentTopic) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
            <Navbar />

            {/* MAIN LAYOUT GRID - MAX WIDTH 1600px */}
            <div
                className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6"
                style={{ marginTop: '150px' }}
            >

                {/* LEFT COLUMN: CONTENT STAGE (70%) */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">

                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-1">
                                <button onClick={() => navigate(`/exam/${examId}`)} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                                    <ArrowLeft size={14} />
                                    Back to Syllabus
                                </button>
                                <span>/</span>
                                <span className="text-indigo-600">Topic {currentTopic.order_index + 1}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                {currentTopic.title}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateTopic('prev')}
                                disabled={!isPrevAvailable}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                                Prev
                            </button>
                            <button
                                onClick={() => navigateTopic('next')}
                                disabled={!isNextAvailable}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200 font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* VIDEO PLAYER CONTAINER */}
                    <div className="w-full aspect-video bg-black rounded-2xl shadow-2xl shadow-slate-200 overflow-hidden border-4 border-white relative group">
                        {activeContent?.type === 'video' ? (
                            <>
                                <video
                                    key={activeContent.url}
                                    src={activeContent.url}
                                    controls
                                    controlsList="nodownload"
                                    className="w-full h-full relative z-10"
                                    onEnded={() => {
                                        if (activeContent.url === currentTopic.video_url && !isVideoCompleted) {
                                            handleVideoComplete();
                                        }
                                    }}
                                />
                                {/* Security Watermark */}
                                <WatermarkOverlay />
                            </>
                        ) : activeContent?.type === 'pdf' ? (
                            <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-900 relative">
                                <WatermarkOverlay />
                                <div className="bg-white p-8 rounded-2xl shadow-xl z-30 text-center max-w-md mx-4">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">PDF Document</h3>
                                    <p className="text-slate-500 mb-6">This content is a secure PDF document. You can open it in a new tab to view.</p>
                                    <button
                                        onClick={() => {
                                            if (activeContent.url === currentTopic.pdf_url) {
                                                window.open(`/secure-viewer/topic/${currentTopic.id}`, '_blank');
                                            } else {
                                                window.open(activeContent.url, '_blank');
                                            }
                                        }}
                                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center gap-2 mx-auto"
                                    >
                                        {activeContent.url === currentTopic.pdf_url ? 'Open Secure Viewer' : 'Open PDF Viewer'}
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-900">
                                Select content to view
                            </div>
                        )}
                    </div>

                    {/* ACTION BAR (Below Video) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-2 px-1">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleVideoComplete}
                                disabled={isVideoCompleted}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${isVideoCompleted
                                    ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200'
                                    }`}
                            >
                                <CheckCircle size={18} className={isVideoCompleted ? "fill-green-600 text-white" : ""} />
                                {isVideoCompleted ? 'Lesson Completed' : 'Mark as Completed'}
                            </button>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
                                <Flag size={16} />
                                <span className="hidden sm:inline">Report Issue</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-amber-500 transition-colors">
                                <Star size={16} />
                                <span className="hidden sm:inline">Rate Lesson</span>
                            </button>
                        </div>
                    </div>

                    {/* LEARNING CONTEXT TABS */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                        <div className="flex items-center border-b border-slate-100 px-4">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <span className="flex items-center gap-2">
                                    Notes
                                    <span className="bg-slate-100 text-slate-600 text-xs py-0.5 px-2 rounded-full hidden sm:inline-block">{(currentTopic.pdf_url || materials.some(m => m.type === 'pdf')) ? '1' : '0'}</span>
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('qa')}
                                className={`px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'qa' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Q&A
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">About this Lesson</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            {currentTopic.description || "In this detailed lecture, we cover the core concepts of this topic. This module is designed to build a strong foundation for your exams."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Target className="text-indigo-600" size={20} />
                                                <h4 className="font-bold text-slate-700">Learning Objectives</h4>
                                            </div>
                                            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-1">
                                                <li>Master key terminology</li>
                                                <li>Understand core principles</li>
                                                <li>Apply concepts to practice problems</li>
                                            </ul>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CheckCircle className="text-green-600" size={20} />
                                                <h4 className="font-bold text-slate-700">Prerequisites</h4>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Basic understanding of the previous module is recommended but not required.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <h3 className="text-lg font-bold text-slate-900">Lecture Materials</h3>
                                    {(!currentTopic.pdf_url && !materials.some(m => m.type === 'pdf')) ? (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-medium">No notes available for this topic yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {currentTopic.pdf_url && (
                                                <div className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors group">
                                                    <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mr-4 group-hover:scale-110 transition-transform">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-800">Primary Lecture Notes</h4>
                                                        <p className="text-xs text-slate-500">PDF • Contains key formulas and definitions</p>
                                                    </div>
                                                    <button
                                                        onClick={() => window.open(`/secure-viewer/topic/${currentTopic.id}`, '_blank')}
                                                        className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            )}
                                            {materials.filter(m => m.type === 'pdf').map(m => (
                                                <div key={m.id} className="flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors group">
                                                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 mr-4 group-hover:scale-110 transition-transform">
                                                        <BookOpen size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-800">{m.title}</h4>
                                                        <p className="text-xs text-slate-500">Supplemental Material</p>
                                                    </div>
                                                    <button
                                                        onClick={() => window.open(`/secure-viewer/material/${m.id}`, '_blank')}
                                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'qa' && (
                                <div className="text-center py-12 animate-in fade-in duration-300">
                                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="h-10 w-10 text-indigo-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Q&A Coming Soon</h3>
                                    <p className="text-slate-600 max-w-md mx-auto mb-6">
                                        We are building a community space for you to ask questions and discuss this topic with peers and instructors.
                                    </p>
                                    <button disabled className="px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                                        Post a Question
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: CURRICULUM SIDEBAR (30%) */}
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-32 overflow-hidden">

                        {/* Course Content Header */}
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-3">Course Content</h2>
                            {/* Simple Progress Bar */}
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>{isVideoCompleted ? '100% Completed' : '0% Completed'}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${isVideoCompleted ? 'bg-green-500 w-full' : 'bg-slate-300 w-0'}`}></div>
                            </div>
                        </div>

                        <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-4 space-y-6">

                            {/* 1. PLAYLIST SECTION */}
                            <div className="space-y-3">
                                {/* Main Video Item */}
                                <div className={`group relative rounded-xl border-2 transition-all overflow-hidden ${activeContent?.url === currentTopic.video_url
                                    ? 'bg-red-50 border-red-100 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50'}`}
                                >
                                    {/* Active Indicator Bar */}
                                    {activeContent?.url === currentTopic.video_url && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                                    )}

                                    <button
                                        onClick={() => setActiveContent({ type: 'video', url: currentTopic.video_url, title: "Main Lesson" })}
                                        className="w-full text-left p-3 pl-5 flex items-start gap-3"
                                    >
                                        <div className={`mt-0.5 min-w-[24px] ${activeContent?.url === currentTopic.video_url ? 'text-red-500' : 'text-slate-400'}`}>
                                            {activeContent?.url === currentTopic.video_url ? (
                                                isVideoCompleted ? <CheckCircle size={20} className="text-green-500" /> : <PlayCircle size={20} />
                                            ) : (
                                                isVideoCompleted ? <CheckCircle size={20} className="text-green-500" /> : <span className="font-bold text-sm text-slate-300">1</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${activeContent?.url === currentTopic.video_url ? 'text-red-700' : 'text-slate-700'}`}>
                                                Main Lesson: {currentTopic.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${activeContent?.url === currentTopic.video_url ? 'bg-red-100 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                    VIDEO
                                                </span>
                                                {activeContent?.url === currentTopic.video_url && (
                                                    <span className="text-[10px] font-bold text-red-500 animate-pulse">
                                                        PLAYING NOW
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Supplemental Videos */}
                                {materials.filter(m => m.type === 'video').map((m, idx) => (
                                    <div key={m.id} className={`group relative rounded-xl border-2 transition-all overflow-hidden ${activeContent?.url === m.url
                                        ? 'bg-red-50 border-red-100 shadow-sm'
                                        : 'bg-white border-transparent hover:bg-slate-50'}`}
                                    >
                                        {activeContent?.url === m.url && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                                        )}

                                        <button
                                            onClick={() => setActiveContent({ type: 'video', url: m.url, title: m.title })}
                                            className="w-full text-left p-3 pl-5 flex items-start gap-3"
                                        >
                                            <div className={`mt-0.5 min-w-[24px] ${activeContent?.url === m.url ? 'text-red-500' : 'text-slate-400'}`}>
                                                {activeContent?.url === m.url ? <PlayCircle size={20} /> : <span className="font-bold text-sm text-slate-300">{idx + 2}</span>}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${activeContent?.url === m.url ? 'text-red-700' : 'text-slate-700'}`}>
                                                    {m.title}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200">
                                                        EXTRA
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full h-px bg-slate-100 my-4"></div>

                            {/* 2. PRACTICE & QUIZZES (Gamified Cards) */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Challenge Your Knowledge</h3>
                                <div className="space-y-3">
                                    {questionSets.length === 0 ? (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                            <p className="text-xs text-slate-500 font-medium">No challenges available yet.</p>
                                        </div>
                                    ) : (
                                        questionSets.map(set => {
                                            const isLocked = !isVideoCompleted;
                                            return (
                                                <div
                                                    key={set.id}
                                                    className={`relative rounded-xl p-4 border-2 transition-all ${isLocked
                                                        ? 'bg-slate-50 border-slate-100 opacity-70'
                                                        : 'bg-white border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-md'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLocked ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-600'}`}>
                                                                {isLocked ? <Lock size={14} /> : <Target size={16} />}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-sm">Practice Set {set.set_number}</h4>
                                                                <p className="text-xs text-slate-500">{set.time_limit_minutes} Mins • MCQs</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isLocked ? (
                                                        <button disabled className="w-full py-2 bg-slate-200 text-slate-500 font-bold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                                                            <Lock size={12} />
                                                            Locked Content
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => navigate(`/exam/${examId}/instructions/${set.id}`)}
                                                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            Start Challenge
                                                            <ChevronRight size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TopicLearningConsole;
