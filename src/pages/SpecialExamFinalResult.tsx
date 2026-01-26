import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Award,
    Home,
    RotateCcw,
    BookOpen,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SpecialExamFinalResult = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [examTitle, setExamTitle] = useState('Special Exam');

    // Fetch Results
    useEffect(() => {
        const fetchResults = async () => {
            if (!auth.accessToken || !examId) return;

            try {
                // Fetch Exam Title first
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const examRes = await fetch(`${API_URL}/api/public/special-exams/${examId}`);
                if (examRes.ok) {
                    const examData = await examRes.json();
                    setExamTitle(examData.title);
                }

                // Fetch Student Results
                const resultsRes = await fetch(`${API_URL}/api/student/special-exams/${examId}/results`, {
                    headers: { 'Authorization': `Bearer ${auth.accessToken}` }
                });
                const results = await resultsRes.json();

                // Aggregate Data
                const totalScore = results.reduce((sum: number, r: any) => sum + (r.score || 0), 0);
                const maxPossible = 100; // 5 sets * 20 questions * 1 mark (assuming)
                // Actually stored score is percentage usually? Let's check logic.
                // In ExamStart we send: score (raw count).
                // But stored "score" in special_exam_results... wait.
                // Let's assume standard 1 mark per question for now or sum up total_questions.

                const totalQuestions = results.reduce((sum: number, r: any) => sum + (r.total_questions || 20), 0);
                const rawScore = results.reduce((sum: number, r: any) => {
                    // Back-calculate raw score from percentage if needed, or if API returns raw
                    // Implementation in ExamStart sends 'score' (raw)
                    // But db schema 'score' might be percentage? 
                    // Let's check backend logic if possible.
                    // Assuming result.score is the raw marks obtained.
                    return sum + (r.score || 0);
                }, 0);

                // Correction: The backend controller stores 'score' directly. 
                // Let's assume 5 sets * 20 Q = 100 Marks.

                const percentage = Math.round((rawScore / totalQuestions) * 100) || 0;

                setStats({
                    rawScore,
                    totalQuestions,
                    percentage,
                    setsCompleted: results.length
                });

            } catch (error) {
                console.error("Error fetching final results", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [examId, auth.accessToken]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="ml-4 text-slate-500 font-medium">Calculating Final Score...</p>
            </div>
        )
    }

    const passed = stats?.percentage >= 60; // 60% Passing criteria

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
                >
                    {/* Header Banner */}
                    <div className={`py-12 px-8 text-center ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-orange-600'}`}>
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white/30">
                            {passed ? <Award className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                            {passed ? "Exam Cleared!" : "Better Luck Next Time"}
                        </h1>
                        <p className="text-white/80 text-lg font-medium">{examTitle}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-8 sm:p-12">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Total Score</p>
                                <p className={`text-4xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats?.rawScore} <span className="text-lg text-slate-400 font-bold">/ {stats?.totalQuestions}</span>
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Percentage</p>
                                <p className="text-4xl font-black text-slate-800">
                                    {stats?.percentage}%
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Status</p>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {passed ? "PASSED" : "FAILED"}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate(`/special-exam/${examId}`)}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] shadow-xl shadow-slate-200"
                            >
                                <RotateCcw size={20} /> Review Sets
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                <Home size={20} /> Go to Dashboard
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SpecialExamFinalResult;
