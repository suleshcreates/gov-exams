import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import {
    ArrowLeft,
    Plus,
    Edit,
    BookOpen,
    CheckCircle,
    AlertCircle,
    Loader2,
    Upload,
    Clock,
    Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuestionSet {
    id: string;
    exam_id: string;
    set_number: number;
    subject_id: string;
    subject?: { name: string };
    time_limit_minutes: number;
}

interface SpecialExamSet {
    id: string;
    set_number: number;
    question_set_id: string | null;
    question_set?: QuestionSet;
}

interface SpecialExam {
    id: string;
    title: string;
    category: string;
    sets?: SpecialExamSet[];
    time_limit_minutes: number;
}

interface DialogState {
    open: boolean;
    mode: 'create' | 'edit';
    setNumber: number;
    questionSetId?: string;
}

const AdminSpecialExamSets = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<SpecialExam | null>(null);
    const [sets, setSets] = useState<SpecialExamSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [specialExamsSubjectId, setSpecialExamsSubjectId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Dialog State
    const [dialogState, setDialogState] = useState<DialogState>({
        open: false,
        mode: 'create',
        setNumber: 0
    });
    const [timeLimit, setTimeLimit] = useState<number>(30);

    useEffect(() => {
        if (examId) {
            loadData();
        }
    }, [examId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Fetch exam details
            const examData = await adminService.getSpecialExamDetails(examId!);
            setExam(examData);

            const sortedSets = (examData.sets || []).sort((a: SpecialExamSet, b: SpecialExamSet) => a.set_number - b.set_number);
            setSets(sortedSets);

            // 2. Find or Create "Special Exams" subject
            const subjects = await adminService.getSubjects();
            let subject = subjects.find((s: any) => s.name === 'Special Exams');

            if (!subject) {
                subject = await adminService.createSubject('Special Exams', 'Container for premium special exam sets');
            }
            setSpecialExamsSubjectId(subject.id);

        } catch (error) {
            console.error('Error loading special exam sets:', error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const initiateCreate = (setNumber: number) => {
        setDialogState({
            open: true,
            mode: 'create',
            setNumber
        });
        setTimeLimit(exam?.time_limit_minutes || 30);
    };

    const initiateEdit = (setNumber: number, currentSet: QuestionSet) => {
        setDialogState({
            open: true,
            mode: 'edit',
            setNumber,
            questionSetId: currentSet.id
        });
        setTimeLimit(currentSet.time_limit_minutes || 30);
    };

    const handleConfirm = async () => {
        const { mode, setNumber, questionSetId } = dialogState;

        if (mode === 'create') {
            await handleCreate(setNumber);
        } else {
            await handleUpdate(questionSetId!);
        }
    };

    const handleCreate = async (setNumber: number) => {
        if (!specialExamsSubjectId || !exam) return;

        try {
            setIsProcessing(true);

            const examIdForSet = `${exam.title.replace(/\s+/g, '-')}-Set-${setNumber}-${Date.now().toString().slice(-4)}`;
            const newSet = await adminService.createQuestionSet({
                subject_id: specialExamsSubjectId,
                exam_id: examIdForSet,
                set_number: 1,
                time_limit_minutes: timeLimit
            });

            await adminService.assignQuestionSetToSpecialExam(examId!, setNumber, newSet.id);

            const returnUrl = encodeURIComponent(`/admin/special-exams/${examId}/sets`);
            navigate(`/admin/subjects/${specialExamsSubjectId}/question-sets/${newSet.id}/bulk-import?returnTo=${returnUrl}`);

            toast.success(`Set container created with ${timeLimit} mins limit.`);
            setDialogState({ ...dialogState, open: false });
        } catch (error: any) {
            console.error('Error initiating import:', error);
            toast.error(error.message || "Failed to initiate import");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdate = async (questionSetId: string) => {
        try {
            setIsProcessing(true);
            await adminService.updateQuestionSet(questionSetId, {
                time_limit_minutes: timeLimit
            });
            toast.success("Set updated successfully");

            setDialogState({ ...dialogState, open: false });
            loadData(); // Refresh data
        } catch (error: any) {
            console.error('Error updating set:', error);
            toast.error("Failed to update set");
        } finally {
            setIsProcessing(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-2xl font-bold">Exam Not Found</h2>
                <Link to="/admin/special-exams" className="text-blue-600 hover:underline mt-4 inline-block">Back to Exams</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/special-exams" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                        <p className="text-gray-600 mt-1">Manage 5 Sets of Questions</p>
                    </div>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                    {exam.category}
                </div>
            </div>

            {/* Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map((num) => {
                    const set = sets.find(s => s.set_number === num);
                    const isUploaded = !!set?.question_set_id;
                    const questionSet = set?.question_set;

                    return (
                        <div key={num} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${isUploaded ? 'border-green-100' : 'border-gray-100'
                            }`}>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold">Set {num}</h3>
                                </div>

                                {isUploaded ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                                            <p className="text-xs font-medium text-green-600 mb-1 flex items-center gap-1">
                                                <CheckCircle size={12} /> Status: Ready
                                            </p>
                                            <p className="text-sm font-bold text-gray-900 truncate mb-1">
                                                {questionSet?.exam_id}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={12} /> {questionSet?.time_limit_minutes || '--'} mins
                                                </p>
                                                <button
                                                    onClick={() => initiateEdit(num, questionSet!)}
                                                    className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 bg-white px-2 py-1 rounded shadow-sm border border-green-100"
                                                >
                                                    <Settings size={10} /> Edit Time
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Link
                                                to={`/admin/question-sets/${set?.question_set_id}/questions`}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                            >
                                                <Edit size={16} />
                                                Edit Questions
                                            </Link>
                                            <Link
                                                to={`/admin/subjects/${specialExamsSubjectId}/question-sets/${set?.question_set_id}/bulk-import?returnTo=${encodeURIComponent(`/admin/special-exams/${examId}/sets`)}`}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                                            >
                                                <Upload size={16} />
                                                Re-upload Excel
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                            <Plus className="h-10 w-10 text-gray-300 mb-2" />
                                            <p className="text-xs text-gray-400 font-medium text-center px-4">
                                                No set assigned
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => initiateCreate(num)}
                                            disabled={isProcessing}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload size={18} />}
                                            Create & Import
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between ${isUploaded ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                                }`}>
                                <span className="flex items-center gap-1">
                                    {isUploaded ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    {isUploaded ? 'UPLOADED' : 'MISSING'}
                                </span>
                                {isUploaded && (
                                    <Link
                                        to={`/admin/question-sets/${set?.question_set_id}/questions`}
                                        className="hover:underline opacity-60 hover:opacity-100"
                                    >
                                        Preview Questions →
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Config Dialog */}
            <Dialog open={dialogState.open} onOpenChange={(open) => !open && setDialogState(prev => ({ ...prev, open: false }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogState.mode === 'create' ? `Configure Set ${dialogState.setNumber}` : `Edit Set ${dialogState.setNumber}`}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogState.mode === 'create'
                                ? 'Set the time limit before creating the set container.'
                                : 'Update the time limit for this exam set.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time" className="text-right">Time Limit</Label>
                            <Input
                                id="time"
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                            />
                            <span className="col-start-2 col-span-3 text-xs text-gray-500">Minutes</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogState(prev => ({ ...prev, open: false }))}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {dialogState.mode === 'create' ? 'Create & Import' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSpecialExamSets;
