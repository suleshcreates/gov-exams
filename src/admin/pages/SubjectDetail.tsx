import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { ArrowLeft, Plus, Edit, Trash2, Clock, FileText, Video } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string | null;
}

interface QuestionSet {
  id: string;
  subject_id: string;
  exam_id: string;
  set_number: number;
  time_limit_minutes: number;
  created_at: string;
  questions_count?: number;
}

const SubjectDetail = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      loadSubjectData();
    }
  }, [subjectId]);

  const loadSubjectData = async () => {
    try {
      setLoading(true);
      const [subjectData, setsData] = await Promise.all([
        adminService.getSubjectById(subjectId!),
        adminService.getQuestionSets(subjectId!),
      ]);

      setSubject(subjectData);

      // Get question counts for each set - do this in parallel but handle errors
      const setsWithCounts = await Promise.all(
        setsData.map(async (set) => {
          try {
            const questions = await adminService.getQuestions(set.id);
            return { ...set, questions_count: questions.length };
          } catch (error) {
            logger.error(`Error loading questions for set ${set.id}:`, error);
            return { ...set, questions_count: 0 };
          }
        })
      );

      setQuestionSets(setsWithCounts);
    } catch (error) {
      logger.error('Error loading subject data:', error);
      alert('Failed to load subject data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setId: string, examId: string, setNumber: number) => {
    if (!confirm(`Are you sure you want to delete ${examId} Set ${setNumber}? This will also delete all questions in this set.`)) {
      return;
    }

    try {
      await adminService.deleteQuestionSet(setId);
      loadSubjectData();
    } catch (error) {
      logger.error('Error deleting question set:', error);
      alert('Failed to delete question set');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Subject not found</p>
        <Link to="/admin/subjects" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/subjects"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
            {subject.description && (
              <p className="text-gray-600 mt-1">{subject.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/subjects/${subjectId}/topics`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Video size={20} />
            Manage Topics
          </Link>
          <Link
            to={`/admin/subjects/${subjectId}/question-sets/new`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Question Set
          </Link>
        </div>
      </div>

      {/* Question Sets Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Question Sets</h2>
        </div>

        {questionSets.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No question sets yet</p>
            <p className="text-gray-400 mt-2">Create your first question set to get started</p>
            <Link
              to={`/admin/subjects/${subjectId}/question-sets/new`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Question Set
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Exam ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Set Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {questionSets.map((set) => (
                  <tr key={set.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{set.exam_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Set {set.set_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <FileText size={16} className="text-gray-400" />
                        {set.questions_count || 0} questions
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Clock size={16} className="text-gray-400" />
                        {set.time_limit_minutes} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(set.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/question-sets/${set.id}/questions`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Manage Questions
                        </Link>
                        <Link
                          to={`/admin/subjects/${subjectId}/question-sets/${set.id}`}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(set.id, set.exam_id, set.set_number)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {questionSets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sets</p>
                <p className="text-2xl font-bold">{questionSets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Questions</p>
                <p className="text-2xl font-bold">
                  {questionSets.reduce((sum, set) => sum + (set.questions_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Time Limit</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    questionSets.reduce((sum, set) => sum + set.time_limit_minutes, 0) /
                    questionSets.length
                  )}{' '}
                  min
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetail;
