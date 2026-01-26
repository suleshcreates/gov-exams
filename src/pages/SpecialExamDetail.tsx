import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BookOpen, Clock, Lock, CheckCircle, Play, Timer,
    ShieldCheck, ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ExamSet {
    set_number: number;
    question_set_id: string | null;
    status: 'completed' | 'unlocked' | 'locked' | 'waiting';
    completed_at?: string;
    started_at?: string;
    score?: number;
    time_remaining?: number; // seconds until unlock
}

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
    sets?: { set_number: number; question_set_id: string }[];
}

const SpecialExamDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [exam, setExam] = useState<SpecialExam | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [examSets, setExamSets] = useState<ExamSet[]>([]);
    const [purchasing, setPurchasing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    // ============================================
    // LOAD DATA & LOGIC (KEEPING AS IS)
    // ============================================
    // ... (logic from original file remains the same)
    useEffect(() => {
        const loadExamData = async () => {
            try {
                const examRes = await fetch(`${API_URL}/api/public/special-exams/${id}`);
                if (!examRes.ok) throw new Error('Exam not found');
                const examData = await examRes.json();
                setExam(examData);
                if (auth.isAuthenticated) await checkAccessAndProgress();
            } catch (error) {
                console.error('Error loading exam:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) loadExamData();
    }, [id, auth.isAuthenticated, API_URL]);

    const checkAccessAndProgress = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const accessRes = await fetch(`${API_URL}/api/student/special-exams/${id}/access`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const accessData = await accessRes.json();
            setHasAccess(accessData.hasAccess);

            if (accessData.hasAccess) {
                const resultsRes = await fetch(`${API_URL}/api/student/special-exams/${id}/results`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const results = await resultsRes.json();
                const setsCount = exam?.sets_count || 5;
                const sets: ExamSet[] = [];

                for (let i = 1; i <= setsCount; i++) {
                    const result = results.find((r: any) => r.set_number === i);
                    const prevResult = results.find((r: any) => r.set_number === i - 1);

                    // SAFELY FIND THE SET INFO
                    const setInfo = exam?.sets?.find((s: any) => s.set_number === i);
                    const qSetId = setInfo?.question_set_id || null;

                    if (result?.completed_at) {
                        sets.push({
                            set_number: i,
                            question_set_id: qSetId,
                            status: 'completed',
                            completed_at: result.completed_at,
                            score: result.score
                        });
                    } else if (i === 1) {
                        sets.push({
                            set_number: i,
                            question_set_id: qSetId,
                            status: 'unlocked'
                        });
                    } else if (prevResult?.completed_at) {
                        const completedTime = new Date(prevResult.completed_at).getTime();
                        const unlockTime = completedTime + (exam?.time_limit_minutes || 20) * 60 * 1000;
                        const now = Date.now();

                        if (now >= unlockTime) {
                            sets.push({
                                set_number: i,
                                question_set_id: qSetId,
                                status: 'unlocked'
                            });
                        } else {
                            sets.push({
                                set_number: i,
                                question_set_id: qSetId,
                                status: 'waiting',
                                time_remaining: Math.ceil((unlockTime - now) / 1000)
                            });
                        }
                    } else {
                        sets.push({
                            set_number: i,
                            question_set_id: qSetId,
                            status: 'locked'
                        });
                    }
                }
                setExamSets(sets);
            }
        } catch (error) {
            console.error('Error checking access:', error);
        }
    }, [id, exam, API_URL]);

    useEffect(() => {
        if (exam && hasAccess) checkAccessAndProgress();
    }, [exam]);

    useEffect(() => {
        const waitingSet = examSets.find(s => s.status === 'waiting');
        if (waitingSet?.time_remaining) {
            setCountdown(waitingSet.time_remaining);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        checkAccessAndProgress();
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [examSets, checkAccessAndProgress]);

    const handlePurchase = async () => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        setPurchasing(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/student/premium-access/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    resource_type: 'special_exam',
                    resource_id: id,
                    amount_paid: exam?.price || 0,
                    payment_id: `sim_${Date.now()}`,
                    order_id: `order_sim_${Date.now()}`
                })
            });
            if (response.ok) {
                setHasAccess(true);
                await checkAccessAndProgress();
            } else throw new Error('Purchase failed');
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    const handleStartSet = (setNumber: number) => {
        // Direct lookup from the source of truth (exam.sets) passed from backend
        // This is safer than relying on the derived state 'examSets' which might be processed async
        const sourceSet = exam?.sets?.find((s: any) => s.set_number === setNumber);

        if (!sourceSet?.question_set_id) {
            console.error(`[SpecialExamDetail] No question set ID found for set ${setNumber}`, {
                examSets: exam?.sets,
                foundSet: sourceSet
            });
            // alert to user
            alert("Error: Question set not assigned/found. Please contact support.");
            return;
        }

        // Create map of all sets for continuous flow
        const setMap = exam?.sets?.reduce((acc: Record<number, string>, s: any) => {
            if (s.question_set_id) acc[s.set_number] = s.question_set_id;
            return acc;
        }, {});

        navigate(`/exam/${id}/instructions/${sourceSet.question_set_id}`, {
            state: {
                specialExamId: id,
                setNumber: setNumber,
                isSpecialExam: true,
                setMap: setMap // Pass the full map for auto-transition
            }
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading exam details...</p>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-card rounded-2xl shadow-xl border">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Exam Not Found</h2>
                    <p className="text-muted-foreground mb-6">The exam you are looking for doesn't exist or has been removed.</p>
                    <button onClick={() => navigate('/exams')} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all">
                        Back to Exams
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* NEW HERO SECTION */}
            <div className="relative h-[45vh] min-h-[400px] overflow-hidden flex items-end">
                {/* Background with Blur & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={exam.thumbnail_url || 'https://images.unsplash.com/photo-1434031211128-13245576114d?q=80&w=2070'}
                        alt=""
                        className="w-full h-full object-cover scale-105 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 pb-12">
                    <div className="max-w-4xl">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate('/exams')}
                            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 w-fit"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Exams
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                                    Special Exam
                                </span>
                                <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                    {exam.category}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                                {exam.title}
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
                                {exam.description || 'Master this comprehensive exam with 5 sequential test sets designed for deep revision.'}
                            </p>

                            <div className="flex flex-wrap gap-6 pt-4">
                                <div className="flex items-center gap-2 text-white/90">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <BookOpen className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold leading-none">{exam.total_questions}</div>
                                        <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Questions</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-white/90">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <Clock className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold leading-none">{exam.time_limit_minutes}m</div>
                                        <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Per Set</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-white/90">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                        <Timer className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold leading-none">{exam.sets_count}</div>
                                        <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Sets</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl -mt-8 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Sets & Progress */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    Exam Curriculum
                                    <span className="text-sm font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                                        {examSets.filter(s => s.status === 'completed').length} / {exam.sets_count} Completed
                                    </span>
                                </h2>
                            </div>

                            {!hasAccess ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <div key={num} className="flex items-center justify-between p-6 rounded-2xl border border-dashed border-slate-200 opacity-60 grayscale bg-slate-50/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                                    {num}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-700">Practice Set {num}</h3>
                                                    <p className="text-sm text-slate-400 italic flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Purchase to unlock curriculum
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {examSets.map((set, index) => (
                                        <motion.div
                                            key={set.set_number}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`group p-6 rounded-3xl border transition-all ${set.status === 'completed'
                                                ? 'bg-green-50/30 border-green-100 hover:bg-green-50/50'
                                                : set.status === 'unlocked'
                                                    ? 'bg-white border-orange-200 shadow-lg shadow-orange-100/50 hover:scale-[1.01]'
                                                    : 'bg-slate-50 border-slate-100 opacity-70 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${set.status === 'completed'
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                                        : set.status === 'unlocked'
                                                            ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-200'
                                                            : 'bg-slate-200 text-slate-400'
                                                        }`}>
                                                        {set.status === 'completed' ? (
                                                            <CheckCircle className="w-7 h-7" />
                                                        ) : set.status === 'unlocked' ? (
                                                            <Play className="w-7 h-7 fill-current ml-1" />
                                                        ) : (
                                                            <Lock className="w-6 h-6" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3 className={`font-black text-xl ${set.status === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>
                                                            Practice Set {set.set_number}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {set.status === 'completed' ? (
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-sm font-black text-green-600 bg-green-100 px-3 py-1 rounded-lg">
                                                                        Score: {set.score}%
                                                                    </span>
                                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" /> {new Date(set.completed_at!).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            ) : set.status === 'waiting' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                                                    <span className="text-sm font-bold text-orange-500">
                                                                        Unlocks in {countdown ? formatTime(countdown) : '--:--'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className={`text-sm font-medium ${set.status === 'locked' ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                    20 MCQs • {exam.time_limit_minutes} Minutes
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                                                    {set.status === 'unlocked' ? (
                                                        <button
                                                            onClick={() => handleStartSet(set.set_number)}
                                                            className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                                                        >
                                                            Start Attempt
                                                        </button>
                                                    ) : set.status === 'completed' ? (
                                                        <button
                                                            onClick={() => handleStartSet(set.set_number)}
                                                            className="w-full sm:w-auto px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors"
                                                        >
                                                            Review results
                                                        </button>
                                                    ) : set.status === 'waiting' ? (
                                                        <div className="text-center sm:text-right px-4">
                                                            <div className="text-lg font-black text-slate-800 tabular-nums">
                                                                {countdown ? formatTime(countdown) : '--:--'}
                                                            </div>
                                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Locked by timer</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-slate-300 px-4">
                                                            <Lock className="w-5 h-5" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Locked</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Actions & Info */}
                    <div className="space-y-6">
                        {/* Purchase Card */}
                        {!hasAccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200/50"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
                                        <ShieldCheck className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <h2 className="text-2xl font-black italic">Buy Full Pack</h2>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                        <span className="text-sm font-medium">Lifetime access to all sets</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                        <span className="text-sm font-medium">Detailed revision analytics</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                        <span className="text-sm font-medium">Mobile-friendly practice</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="text-sm text-white/50 font-bold uppercase tracking-widest mb-1">Total Price</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter italic">₹{exam.price}</span>
                                        <span className="text-white/40 line-through">₹{Math.round(exam.price * 1.5)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {purchasing ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 fill-current" />
                                            Unlock Now
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-white/30 text-center mt-4 uppercase font-bold tracking-[0.2em]">
                                    Secure Payment Guaranteed
                                </p>
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800">You Own This</h2>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">Overall Progress</span>
                                        <span className="text-lg font-black text-slate-900">
                                            {Math.round((examSets.filter(s => s.status === 'completed').length / exam.sets_count) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(examSets.filter(s => s.status === 'completed').length / exam.sets_count) * 100}%` }}
                                            className="h-full bg-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-sm font-bold">Lifetime Validity</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Each set unlocks sequentially. Once you complete a set, the next one will unlock after a short revision cooldown.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Exam Tips / Rules */}
                        <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100">
                            <h4 className="text-sm font-black text-indigo-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Exam Rules
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    'Sets must be completed in order',
                                    '60% score required to "Pass"',
                                    'Timed results for competitive analysis',
                                    'Review allowed after each set'
                                ].map((rule, i) => (
                                    <li key={i} className="flex gap-2 items-start text-xs text-indigo-700/80 font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecialExamDetail;
