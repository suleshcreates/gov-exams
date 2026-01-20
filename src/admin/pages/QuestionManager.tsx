import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Upload, Settings } from 'lucide-react';

interface QuestionSet {
  id: string;
  exam_id?: string;
  topic_id?: string;
  set_number: number;
  time_limit_minutes: number;
  subject?: {
    id: string;
    name: string;
  };
  topic?: {
    title: string;
  };
}

interface Question {
  id: string;
  question_set_id: string;
  question_text: string;
  question_text_marathi: string;
  option_1: string;
  option_1_marathi: string;
  option_2: string;
  option_2_marathi: string;
  option_3: string;
  option_3_marathi: string;
  option_4: string;
  option_4_marathi: string;
  correct_answer: number;
  order_index: number;
}

const QuestionManager = () => {
  const { setId } = useParams<{ setId: string }>();
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (setId) {
      loadData();
    }
  }, [setId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sets, questionsData] = await Promise.all([
        adminService.getQuestionSets(),
        adminService.getQuestions(setId!),
      ]);

      const set = sets.find(s => s.id === setId);
      setQuestionSet(set || null);
      setQuestions(questionsData);
    } catch (error) {
      logger.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowEditor(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingQuestion(null);
  };

  const handleSaveQuestion = async () => {
    await loadData();
    handleCloseEditor();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await adminService.deleteQuestion(id);
      loadData();
    } catch (error) {
      logger.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Question set not found</p>
        <Link to="/admin/subjects" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Subjects
        </Link>
      </div>
    );
  }

  const isTopicSet = !!questionSet.topic_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={questionSet.subject ? (isTopicSet ? `/admin/subjects/${questionSet.subject.id}/topics` : `/admin/subjects/${questionSet.subject.id}`) : '/admin/subjects'}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isTopicSet ? (questionSet.topic?.title || 'Topic Questions') : `${questionSet.exam_id} - Set ${questionSet.set_number}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {questionSet.subject?.name} • {questionSet.time_limit_minutes} minutes • {questions.length} questions
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {questionSet.subject?.id && (
            <>
              <Link
                to={`/admin/subjects/${questionSet.subject.id}/question-sets/${setId}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Settings size={20} />
                Settings
              </Link>
              <Link
                to={`/admin/subjects/${questionSet.subject.id}/question-sets/${setId}/bulk-import`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Upload size={20} />
                Bulk Import
              </Link>
            </>
          )}
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow">
        {questions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No questions yet</p>
            <p className="text-gray-400 mt-2">Add your first question to get started</p>
            <button
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question, index) => (
              <div key={question.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium mb-3">{question.question_text}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {[1, 2, 3, 4].map((optNum) => {
                        const isCorrect = question.correct_answer === optNum - 1;
                        const optionKey = `option_${optNum}` as keyof Question;
                        const optionMarathiKey = `option_${optNum}_marathi` as keyof Question;

                        return (
                          <div
                            key={optNum}
                            className={`p-2 rounded ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                              }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700">{optNum}.</span>
                              <div className="flex-1">
                                <p className={isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}>
                                  {question[optionKey] as string}
                                </p>
                              </div>
                              {isCorrect && (
                                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Editor Modal */}
      {showEditor && (
        <QuestionEditorModal
          questionSetId={setId!}
          question={editingQuestion}
          onClose={handleCloseEditor}
          onSave={handleSaveQuestion}
          nextOrderIndex={questions.length}
        />
      )}
    </div>
  );
};

// Question Editor Modal Component
interface QuestionEditorModalProps {
  questionSetId: string;
  question: Question | null;
  onClose: () => void;
  onSave: () => void;
  nextOrderIndex: number;
}

const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  questionSetId,
  question,
  onClose,
  onSave,
  nextOrderIndex,
}) => {
  const [formData, setFormData] = useState({
    question_text: question?.question_text || '',
    question_text_marathi: '', // Auto-translated on exam page
    option_1: question?.option_1 || '',
    option_1_marathi: '', // Auto-translated on exam page
    option_2: question?.option_2 || '',
    option_2_marathi: '', // Auto-translated on exam page
    option_3: question?.option_3 || '',
    option_3_marathi: '', // Auto-translated on exam page
    option_4: question?.option_4 || '',
    option_4_marathi: '', // Auto-translated on exam page
    correct_answer: question?.correct_answer ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'mr'>('en');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - only English required
    if (!formData.question_text.trim()) {
      alert('Question text is required');
      return;
    }

    if (formData.question_text.length < 10) {
      alert('Question text must be at least 10 characters');
      return;
    }

    try {
      setSaving(true);

      if (question) {
        await adminService.updateQuestion(question.id, formData);
      } else {
        await adminService.createQuestion({
          question_set_id: questionSetId,
          ...formData,
          order_index: nextOrderIndex,
        });
      }

      onSave();
    } catch (error) {
      logger.error('Error saving question:', error);
      alert('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {question ? 'Edit Question' : 'Add New Question'}
          </h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye size={16} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Preview */}
          {showPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-blue-900">Preview</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewLang('en')}
                    className={`px-3 py-1 text-sm rounded ${previewLang === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
                      }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang('mr')}
                    className={`px-3 py-1 text-sm rounded ${previewLang === 'mr' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
                      }`}
                  >
                    मराठी
                  </button>
                </div>
              </div>
              <p className="text-gray-900 font-medium mb-3">
                {previewLang === 'en' ? formData.question_text : (formData.question_text_marathi || 'Translation not available')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((optNum) => {
                  const optionKey = `option_${optNum}` as keyof typeof formData;
                  const optionMarathiKey = `option_${optNum}_marathi` as keyof typeof formData;
                  const isCorrect = formData.correct_answer === optNum - 1;

                  return (
                    <div key={optNum} className={`p-2 border rounded ${isCorrect ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                      <span className="font-medium mr-2">{optNum}.</span>
                      <span>
                        {previewLang === 'en'
                          ? (formData[optionKey] as string)
                          : ((formData[optionMarathiKey] as string) || 'Translation not available')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text (English) *
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((optNum) => (
              <div key={optNum}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option {optNum} (English) *
                </label>
                <input
                  type="text"
                  value={formData[`option_${optNum}` as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [`option_${optNum}`]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((optNum) => (
                <label key={optNum} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={formData.correct_answer === optNum - 1}
                    onChange={() => setFormData({ ...formData, correct_answer: optNum - 1 })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Option {optNum}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
