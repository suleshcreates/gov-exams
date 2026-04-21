import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminService } from '../lib/adminService';
import logger from '@/lib/logger';

interface ParsedQuestion {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation?: string;
}

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

const BulkImportQuestions = () => {
    const { subjectId, setId } = useParams<{ subjectId: string; setId: string }>();
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
            alert('Please upload an Excel (.xlsx, .xls) or CSV file');
            return;
        }

        setFile(selectedFile);
        parseFile(selectedFile);
    };

    const parseFile = async (file: File) => {
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            const parsed: ParsedQuestion[] = [];
            const validationErrors: ValidationError[] = [];

            jsonData.forEach((row: any, index: number) => {
                const rowNum = index + 2;

                // Helper to safely get string value
                const getString = (val: any) => (val?.toString() || '').trim();

                const questionText = getString(row.question_text);
                const optionA = getString(row.option_a);
                const optionB = getString(row.option_b);
                const optionC = getString(row.option_c);
                const optionD = getString(row.option_d);
                const correctAnswer = getString(row.correct_answer).toUpperCase();
                const explanation = getString(row.explanation);

                if (!questionText) {
                    validationErrors.push({
                        row: rowNum,
                        field: 'question_text',
                        message: 'Question text is required'
                    });
                    return;
                }

                if (!optionA || !optionB || !optionC || !optionD) {
                    validationErrors.push({
                        row: rowNum,
                        field: 'options',
                        message: 'All 4 options (A, B, C, D) are required'
                    });
                    return;
                }

                if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    validationErrors.push({
                        row: rowNum,
                        field: 'correct_answer',
                        message: 'Correct answer must be A, B, C, or D'
                    });
                    return;
                }

                parsed.push({
                    question_text: questionText,
                    option_a: optionA,
                    option_b: optionB,
                    option_c: optionC,
                    option_d: optionD,
                    correct_answer: correctAnswer,
                    explanation: explanation
                });
            });

            setQuestions(parsed);
            setErrors(validationErrors);

            if (validationErrors.length > 0) {
                logger.warn(`Found ${validationErrors.length} validation errors`);
            } else {
                logger.info(`Successfully parsed ${parsed.length} questions`);
            }
        } catch (error) {
            logger.error('Error parsing file:', error);
            alert('Failed to parse file. Please check the format.');
        }
    };

    const handleImport = async () => {
        if (questions.length === 0) {
            alert('No valid questions to import');
            return;
        }

        if (errors.length > 0) {
            if (!confirm(`There are ${errors.length} errors. Do you want to import only the valid questions?`)) {
                return;
            }
        }

        try {
            setImporting(true);
            setProgress(0);

            const batchSize = 50;
            let imported = 0;

            for (let i = 0; i < questions.length; i += batchSize) {
                const batch = questions.slice(i, i + batchSize);
                await adminService.bulkCreateQuestions(setId!, batch);

                imported += batch.length;
                setProgress(Math.round((imported / questions.length) * 100));
            }

            setSuccess(true);
            setTimeout(() => {
                navigate(`/admin/subjects/${subjectId}/question-sets/${setId}`);
            }, 2000);
        } catch (error: any) {
            logger.error('Error importing questions:', error);
            const message = error.message || error.error_description || 'Unknown error';
            alert(`Failed to import questions: ${message}`);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                question_text: 'What is the capital of France?',
                option_a: 'London',
                option_b: 'Paris',
                option_c: 'Berlin',
                option_d: 'Madrid',
                correct_answer: 'B',
                explanation: 'Paris is the capital and largest city of France'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Questions');
        XLSX.writeFile(wb, 'question_template.xlsx');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Import Questions</h1>
                <p className="text-gray-600 mt-1">Upload an Excel or CSV file with your questions</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FileSpreadsheet className="text-blue-600 mt-1" size={20} />
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900">Need a template?</h3>
                        <p className="text-sm text-blue-700 mt-1">Download our sample Excel template</p>
                        <button
                            onClick={downloadTemplate}
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Download size={16} />
                            Download Template
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            {file ? file.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-500">Excel (.xlsx, .xls) or CSV files</p>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </label>
            </div>

            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-1" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-900">
                                {errors.length} Validation Error{errors.length !== 1 ? 's' : ''}
                            </h3>
                            <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                                {errors.slice(0, 10).map((error, idx) => (
                                    <p key={idx} className="text-sm text-red-700">
                                        Row {error.row}: {error.message} ({error.field})
                                    </p>
                                ))}
                                {errors.length > 10 && (
                                    <p className="text-sm text-red-600 font-medium">...and {errors.length - 10} more</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {questions.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Preview</h3>
                                <p className="text-sm text-gray-600 mt-1">{questions.length} questions ready</p>
                            </div>
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>

                    <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                        {questions.slice(0, 5).map((q, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <p className="font-medium mb-2">{idx + 1}. {q.question_text}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>A. {q.option_a}</div>
                                    <div>B. {q.option_b}</div>
                                    <div>C. {q.option_c}</div>
                                    <div>D. {q.option_d}</div>
                                </div>
                                <div className="mt-2 text-sm text-green-600 font-medium">Correct: {q.correct_answer}</div>
                            </div>
                        ))}
                        {questions.length > 5 && (
                            <p className="text-center text-gray-500 text-sm">...and {questions.length - 5} more</p>
                        )}
                    </div>
                </div>
            )}

            {importing && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">Importing...</h3>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-600 h-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-center text-sm mt-2">{progress}%</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <h3 className="font-semibold text-green-900">Success!</h3>
                            <p className="text-sm text-green-700">{questions.length} questions imported</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3">
                <button
                    onClick={() => navigate(-1)}
                    disabled={importing}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleImport}
                    disabled={questions.length === 0 || importing || success}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabledopacity-50"
                >
                    {importing ? 'Importing...' : `Import ${questions.length} Questions`}
                </button>
            </div>
        </div>
    );
};

export default BulkImportQuestions;
