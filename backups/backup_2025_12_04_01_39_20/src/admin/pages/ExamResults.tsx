import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { adminService } from '../lib/adminService';
import { Search, Filter, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExamResult {
  id: string;
  student_name: string;
  student_phone: string;
  exam_title: string;
  exam_id: string;
  set_number: number;
  score: number;
  total_questions: number;
  accuracy: number;
  time_taken: number;
  created_at: string;
  user_answers: number[];
  correct_answers: number[];
}

const ExamResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState({
    studentSearch: '',
    examId: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    loadResults();
  }, [page, filters]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await adminService.getExamResults(page, 20, {
        studentSearch: filters.studentSearch || undefined,
        examId: filters.examId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });
      setResults(data.results);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      logger.error('Error loading exam results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleViewDetails = (result: ExamResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Student Name', 'Phone', 'Exam', 'Set', 'Score', 'Accuracy', 'Time Taken', 'Date'];
    const rows = results.map(r => [
      r.student_name,
      r.student_phone,
      r.exam_title,
      r.set_number,
      `${r.score}/${r.total_questions}`,
      `${r.accuracy}%`,
      `${Math.floor(r.time_taken / 60)}m ${r.time_taken % 60}s`,
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600 mt-1">Monitor student exam performance</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={results.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.studentSearch}
                onChange={(e) => handleFilterChange('studentSearch', e.target.value)}
                placeholder="Name or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam ID
            </label>
            <input
              type="text"
              value={filters.examId}
              onChange={(e) => handleFilterChange('examId', e.target.value)}
              placeholder="e.g., MPSC-2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No exam results found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Set</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{result.student_name}</div>
                        <div className="text-sm text-gray-500">{result.student_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{result.exam_title}</div>
                      <div className="text-xs text-gray-500">{result.exam_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Set {result.set_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.score} / {result.total_questions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.accuracy >= 85
                            ? 'bg-green-100 text-green-800'
                            : result.accuracy >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.accuracy}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(result)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && results.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-1 text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedResult(null);
          }}
        />
      )}
    </div>
  );
};

// Result Detail Modal Component
interface ResultDetailModalProps {
  result: ExamResult;
  onClose: () => void;
}

const ResultDetailModal: React.FC<ResultDetailModalProps> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Exam Result Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student & Exam Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{result.student_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">{result.student_phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Exam Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Exam:</span>
                  <span className="ml-2 font-medium">{result.exam_title}</span>
                </div>
                <div>
                  <span className="text-gray-500">Exam ID:</span>
                  <span className="ml-2 font-medium">{result.exam_id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Set Number:</span>
                  <span className="ml-2 font-medium">{result.set_number}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">
                    {new Date(result.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.score} / {result.total_questions}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{result.accuracy}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
                </p>
              </div>
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          {result.user_answers && result.correct_answers && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Question Breakdown</h3>
              <div className="space-y-2">
                {result.user_answers.map((userAnswer, index) => {
                  const isCorrect = userAnswer === result.correct_answers[index];
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span className="font-medium">Question {index + 1}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Your answer: <span className="font-medium">Option {userAnswer + 1}</span>
                        </span>
                        <span className="text-gray-600">
                          Correct: <span className="font-medium">Option {result.correct_answers[index] + 1}</span>
                        </span>
                        <span
                          className={`px-2 py-1 rounded font-medium ${
                            isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {isCorrect ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
