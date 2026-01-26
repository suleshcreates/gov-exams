import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Lock, CheckCircle, Filter, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SpecialExam {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    total_questions: number;
    sets_count: number;
    time_limit_minutes: number;
    thumbnail_url: string;
}

const Exams = () => {
    const [exams, setExams] = useState<SpecialExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categories, setCategories] = useState<string[]>([]);
    const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
    const { auth } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        loadExams();
        loadCategories();
        if (auth.isAuthenticated) {
            loadUserAccess();
        }
    }, [auth.isAuthenticated]);

    const loadExams = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/special-exams`);
            const data = await response.json();
            setExams(data || []);
        } catch (error) {
            console.error('Error loading exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/categories`);
            const data = await response.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadUserAccess = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/student/premium-access?resource_type=special_exam`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const accessMap: Record<string, boolean> = {};
            (data || []).forEach((a: { resource_id: string }) => {
                accessMap[a.resource_id] = true;
            });
            setUserAccess(accessMap);
        } catch (error) {
            console.error('Error loading user access:', error);
        }
    };

    const filteredExams = selectedCategory === 'all'
        ? exams
        : exams.filter(e => e.category === selectedCategory);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-orange-500" />
                    </div>
                </div>
                <p className="mt-4 text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Curating Exams...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafbfc]">
            {/* PREMIUM HERO SECTION */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[80%] bg-orange-100/40 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[0%] right-[-10%] w-[40%] h-[80%] bg-indigo-100/40 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-[0.2em] mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Curated Series
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            Special <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 italic">Exams</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                            Master your competitive journey with our 100-question deep-dive sets.
                            Divided into 5 strategic modules for maximum retention.
                        </p>
                    </motion.div>

                    {/* INTERACTIVE FILTERS */}
                    {categories.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12 flex items-center justify-center gap-2 flex-wrap"
                        >
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95 ${selectedCategory === 'all'
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                All Exams
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95 ${selectedCategory === cat
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* EXAMS GRID */}
            <div className="container mx-auto px-4 pb-32">
                {filteredExams.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Exams Found</h3>
                        <p className="text-slate-500">We are adding new exams to this category soon. Stay tuned!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredExams.map((exam, index) => {
                            const hasAccess = userAccess[exam.id];
                            return (
                                <motion.div
                                    key={exam.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -8 }}
                                    className="group relative bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500"
                                >
                                    {/* THUMBNAIL CONTAINER */}
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-slate-100">
                                        {exam.thumbnail_url ? (
                                            <img
                                                src={exam.thumbnail_url}
                                                alt={exam.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                                <BookOpen className="w-16 h-16 text-slate-300" />
                                            </div>
                                        )}

                                        {/* Status Overlays */}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {hasAccess ? (
                                                <div className="bg-green-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    OWNED
                                                </div>
                                            ) : (
                                                <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-lg">
                                                    ₹{exam.price}
                                                </div>
                                            )}
                                        </div>

                                        {exam.category && (
                                            <div className="absolute bottom-4 left-4">
                                                <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    {exam.category}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors line-clamp-1">
                                                {exam.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 font-medium leading-relaxed">
                                                {exam.description || 'Elevate your knowledge with this comprehensive sequential practice series.'}
                                            </p>
                                        </div>

                                        {/* STATS */}
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <span className="text-xs font-bold">{exam.total_questions} MCQs</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <span className="text-xs font-bold">{exam.time_limit_minutes}m/set</span>
                                            </div>
                                        </div>

                                        {/* PROGRESS DOTS */}
                                        <div className="flex gap-1.5 pt-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${hasAccess ? 'bg-orange-100 group-hover:bg-orange-200' : 'bg-slate-100 group-hover:bg-slate-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {/* ACTION BUTTON */}
                                        <Link to={`/special-exam/${exam.id}`} className="block pt-2">
                                            <button className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] ${hasAccess
                                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                                                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl shadow-orange-200 hover:shadow-orange-300'
                                                }`}>
                                                {hasAccess ? 'Continue Series' : 'Unlock Now'}
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* CTA SECTION (Bottom of grid) */}
            <div className="container mx-auto px-4 pb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[48px] bg-slate-900 p-12 overflow-hidden text-center"
                >
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 max-w-xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">
                            Ready to excel?
                        </h2>
                        <p className="text-slate-400 font-medium">
                            Join thousands of students who have improved their scores by up to 40% using our sequential practice modules.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Exams;
