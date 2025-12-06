import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { ArrowLeft, Save } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

interface QuestionSet {
  id: string;
  subject_id: string;
  exam_id: string;
  set_number: number;
  time_limit_minutes: number;
}

const QuestionSetEditor = () => {
  const { subjectId, setId } = useParams<{ subjectId: string; setId?: string }>();
  const navigate = useNavigate();
  const isEditing = setId !== 'new';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: subjectId || '',
    exam_id: '',
    set_number: 1,
    time_limit_minutes: 60,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [setId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectsData = await adminService.getSubjects();
      setSubjects(subjectsData);

      if (isEditing && setId) {
        // Load existing question set
        const sets = await adminService.getQuestionSets();
        const existingSet = sets.find(s => s.id === setId);
        if (existingSet) {
          setFormData({
            subject_id: existingSet.subject_id,
            exam_id: existingSet.exam_id,
            set_number: existingSet.set_number,
            time_limit_minutes: existingSet.time_limit_minutes,
          });
        }
      }
    } catch (error) {
      logger.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }

    if (!formData.exam_id.trim()) {
      newErrors.exam_id = 'Exam ID is required';
    } else if (formData.exam_id.length < 2) {
      newErrors.exam_id = 'Exam ID must be at least 2 characters';
    }

    if (formData.set_number < 1) {
      newErrors.set_number = 'Set number must be at least 1';
    }

    if (formData.time_limit_minutes < 1) {
      newErrors.time_limit_minutes = 'Time limit must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (isEditing && setId) {
        await adminService.updateQuestionSet(setId, formData);
        alert('Question set updated successfully');
        navigate(`/admin/question-sets/${setId}/questions`);
      } else {
        const newSet = await adminService.createQuestionSet(formData);
        alert('Question set created successfully');
        navigate(`/admin/question-sets/${newSet.id}/questions`);
      }
    } catch (error: any) {
      logger.error('Error saving question set:', error);

      // Check for specific error types
      if (error.message?.includes('Database tables not set up')) {
        alert('⚠️ Database Setup Required\n\n' + error.message);
      } else if (error.message?.includes('duplicate') || error.code === '23505') {
        setErrors({
          set_number: 'A question set with this exam ID and set number already exists',
        });
      } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        alert('⚠️ Database tables not found!\n\nPlease run the SQL migration script first.\nSee ADMIN_PANEL_SETUP.md for instructions.');
      } else {
        alert('Failed to save question set: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={subjectId ? `/admin/subjects/${subjectId}` : '/admin/subjects'}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Question Set' : 'Create Question Set'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update question set details' : 'Add a new question set to the subject'}
            </p>
          </div>
        </div>

        {/* Bulk Import Button - Only show when editing existing set */}
        {isEditing && setId && (
          <Link
            to={`/admin/subjects/${subjectId}/question-sets/${setId}/bulk-import`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Import Questions
          </Link>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.subject_id ? 'border-red-500' : 'border-gray-300'
                }`}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>
            )}
          </div>

          {/* Exam ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam ID *
            </label>
            <input
              type="text"
              value={formData.exam_id}
              onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.exam_id ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g., MPSC-2024"
              required
            />
            {errors.exam_id && (
              <p className="mt-1 text-sm text-red-600">{errors.exam_id}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Unique identifier for the exam (e.g., MPSC-2024, UPSC-GS1)
            </p>
          </div>

          {/* Set Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Number *
            </label>
            <input
              type="number"
              value={formData.set_number}
              onChange={(e) => setFormData({ ...formData, set_number: parseInt(e.target.value) || 1 })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.set_number ? 'border-red-500' : 'border-gray-300'
                }`}
              min="1"
              required
            />
            {errors.set_number && (
              <p className="mt-1 text-sm text-red-600">{errors.set_number}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Set number must be unique within the exam (e.g., 1, 2, 3)
            </p>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes) *
            </label>
            <input
              type="number"
              value={formData.time_limit_minutes}
              onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 60 })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.time_limit_minutes ? 'border-red-500' : 'border-gray-300'
                }`}
              min="1"
              required
            />
            {errors.time_limit_minutes && (
              <p className="mt-1 text-sm text-red-600">{errors.time_limit_minutes}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Total time allowed for this question set in minutes
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <Link
            to={subjectId ? `/admin/subjects/${subjectId}` : '/admin/subjects'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Create & Add Questions'}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
        <p className="text-sm text-blue-800">
          After {isEditing ? 'updating' : 'creating'} the question set, you'll be redirected to the Question Manager
          where you can add individual questions to this set.
        </p>
      </div>
    </div>
  );
};

export default QuestionSetEditor;
