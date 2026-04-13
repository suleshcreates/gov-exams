import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Lock, CheckCircle, Filter, FileText, Package, Sparkles, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

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

interface CategoryPlan {
    id: string;
    category: string;
    title: string;
    description: string;
    price: number;
}

const Exams = () => {
    const [exams, setExams] = useState<SpecialExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categories, setCategories] = useState<string[]>([]);
    const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
    const [categoryPlans, setCategoryPlans] = useState<CategoryPlan[]>([]);
    const [userCategoryAccess, setUserCategoryAccess] = useState<Record<string, boolean>>({});
    const { auth, openAuthModal } = useAuth();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        loadExams();
        loadCategories();
        loadCategoryPlans();
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

    const loadCategoryPlans = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/category-plans`);
            const data = await response.json();
            setCategoryPlans(data || []);
        } catch (error) {
            console.error('Error loading category plans:', error);
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

            // Also check category plan access
            const catResponse = await fetch(`${API_URL}/api/student/premium-access?resource_type=special_exam_category`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const catData = await catResponse.json();
            const catAccessMap: Record<string, boolean> = {};
            (catData || []).forEach((a: { resource_id: string }) => {
                catAccessMap[a.resource_id] = true;
            });
            setUserCategoryAccess(catAccessMap);
        } catch (error) {
            console.error('Error loading user access:', error);
        }
    };

    // Check if user has access via direct purchase OR category plan
    const hasExamAccess = (exam: SpecialExam): boolean => {
        if ((auth.user as any)?.role === 'admin') return true;
        if (userAccess[exam.id]) return true;
        const matchingPlan = categoryPlans.find(p =>
            p.category?.toLowerCase().trim() === exam.category?.toLowerCase().trim()
        );
        if (matchingPlan && userCategoryAccess[matchingPlan.id]) return true;
        return false;
    };

    // Get the category plan for the selected category
    const getSelectedCategoryPlan = (): CategoryPlan | null => {
        if (selectedCategory === 'all') return null;
        return categoryPlans.find(p =>
            p.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
        ) || null;
    };

    const hasUserBoughtCategoryPlan = (planId: string): boolean => {
        return userCategoryAccess[planId] || false;
    };

    const filteredExams = selectedCategory === 'all'
        ? exams
        : exams.filter(e => e.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim());

    const activeCategoryPlan = getSelectedCategoryPlan();
    const planAlreadyPurchased = activeCategoryPlan ? hasUserBoughtCategoryPlan(activeCategoryPlan.id) : false;

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

            {/* CATEGORY PLAN BANNER */}
            {activeCategoryPlan && (
                <div className="container mx-auto px-4 -mt-8 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-3xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                        
                        <div className="relative px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Package className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-yellow-300" />
                                        <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Category Bundle</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-white">{activeCategoryPlan.title}</h3>
                                    <p className="text-sm text-white/70 font-medium mt-0.5">
                                        Access all {filteredExams.length} exams in {activeCategoryPlan.category} — including upcoming ones!
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">₹{activeCategoryPlan.price}</div>
                                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">One-time</div>
                                </div>
                                {planAlreadyPurchased ? (
                                    <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white font-bold">
                                        <CheckCircle className="w-5 h-5" />
                                        Purchased
                                    </div>
                                ) : (
                                    <Link 
                                        to={filteredExams.length > 0 ? `/special-exam/${filteredExams[0].id}?categoryPlan=${activeCategoryPlan.id}` : '#'}
                                        className="px-8 py-3 bg-white text-indigo-700 rounded-2xl font-black text-sm hover:bg-white/90 transition-all active:scale-[0.98] shadow-xl"
                                    >
                                        Get Full Pack →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredExams.map((exam, index) => {
                            const examOwned = hasExamAccess(exam);
                            return (
                                <motion.div
                                    key={exam.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300"
                                >
                                    {/* THUMBNAIL */}
                                    <div className="relative h-40 overflow-hidden bg-slate-100">
                                        {exam.thumbnail_url ? (
                                            <img
                                                src={exam.thumbnail_url}
                                                alt={exam.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                                                <BookOpen className="w-10 h-10 text-orange-300" />
                                            </div>
                                        )}

                                        {/* Bottom gradient overlay */}
                                        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {examOwned && (
                                                <div className="bg-green-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-lg">
                                                    <CheckCircle className="w-3 h-3" />
                                                    OWNED
                                                </div>
                                            )}
                                        </div>

                                        {exam.category && (
                                            <div className="absolute bottom-3 left-3">
                                                <div className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                    {exam.category}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-5 space-y-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                                                {exam.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                                                {exam.description || 'Comprehensive practice series'}
                                            </p>
                                        </div>

                                        {/* Price + Stats row */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-extrabold text-orange-600">
                                                {examOwned ? '' : `₹${exam.price}`}
                                            </span>
                                            <div className="flex items-center gap-3 text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                                                    <span className="text-[11px] font-bold">{exam.total_questions} MCQs</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                    <span className="text-[11px] font-bold">{exam.time_limit_minutes}m/set</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <Link to={`/special-exam/${exam.id}`} className="block">
                                            <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${examOwned
                                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg'
                                                }`}>
                                                {examOwned ? 'Continue Series' : 'View Details'}
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
