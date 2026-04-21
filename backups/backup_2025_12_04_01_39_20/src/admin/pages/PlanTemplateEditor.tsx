import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
}

const PlanTemplateEditor = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const isEditing = planId && planId !== 'new';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    validity_days: 30,
    subjects: [] as string[],
    badge: '',
    display_order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [planId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectsData = await adminService.getSubjects();
      setSubjects(subjectsData);

      if (isEditing) {
        const plans = await adminService.getPlanTemplates(true);
        const plan = plans.find(p => p.id === planId);
        if (plan) {
          const planSubjects = Array.isArray(plan.subjects)
            ? plan.subjects
            : JSON.parse(plan.subjects || '[]');

          setFormData({
            name: plan.name,
            description: plan.description || '',
            price: plan.price,
            validity_days: plan.validity_days || 30,
            subjects: planSubjects,
            badge: plan.badge || '',
            display_order: plan.display_order,
          });
        }
      }
    } catch (error) {
      logger.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be positive';
    }

    if (formData.validity_days !== null && formData.validity_days < 1) {
      newErrors.validity_days = 'Validity must be at least 1 day or leave empty for lifetime';
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = 'Select at least one subject';
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

      // Convert subject UUIDs to exam IDs before saving
      // DEPRECATED: We now use UUIDs directly
      // const { mapSubjectUUIDsToExamIds } = await import('@/lib/subjectMapping');
      // const examIds = await mapSubjectUUIDsToExamIds(formData.subjects);
      const examIds = formData.subjects;

      logger.debug('[PlanTemplateEditor] Saving subjects:', {
        original_uuids: formData.subjects,
        mapped_exam_ids: examIds
      });

      const dataToSave = {
        ...formData,
        subjects: examIds  // Save UUIDs directly
      };

      if (isEditing && planId && planId !== 'new') {
        // Updating existing plan
        await adminService.updatePlanTemplate(planId, dataToSave);
        alert('Plan updated successfully!');
      } else {
        // Creating new plan
        await adminService.createPlanTemplate(dataToSave);
        alert('Plan created successfully!');
      }

      navigate('/admin/pricing/plans');
    } catch (error: any) {
      logger.error('Error saving plan:', error);
      alert(error.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/pricing/plans"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Plan Template' : 'Create Plan Template'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update plan details' : 'Create a new subscription plan'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Eye size={20} />
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-6">
              {/* Plan Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="e.g., Basic Plan, Premium Plan"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the plan"
                />
              </div>

              {/* Price & Validity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    min="0"
                    step="0.01"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity (days)
                  </label>
                  <input
                    type="number"
                    value={formData.validity_days || ''}
                    onChange={(e) => setFormData({ ...formData, validity_days: e.target.value ? parseInt(e.target.value) : null as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Leave empty for lifetime"
                  />
                  <p className="mt-1 text-xs text-gray-500">Empty = Lifetime access</p>
                </div>
              </div>

              {/* Badge & Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge (Optional)
                  </label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No Badge</option>
                    <option value="POPULAR">POPULAR</option>
                    <option value="BEST VALUE">BEST VALUE</option>
                    <option value="RECOMMENDED">RECOMMENDED</option>
                    <option value="NEW">NEW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                </div>
              </div>

              {/* Subjects Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Included Subjects *
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {subjects.length === 0 ? (
                    <p className="text-gray-500 text-sm">No subjects available. Create subjects first.</p>
                  ) : (
                    <div className="space-y-2">
                      {subjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject.id)}
                            onChange={() => handleSubjectToggle(subject.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{subject.name}</div>
                            {subject.description && (
                              <div className="text-sm text-gray-500">{subject.description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.subjects && <p className="mt-1 text-sm text-red-600">{errors.subjects}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  Selected: {formData.subjects.length} subject{formData.subjects.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Link
                to="/admin/pricing/plans"
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
                {saving ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Student View Preview</h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {formData.badge && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {formData.badge}
                    </span>
                  </div>
                )}

                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {formData.name || 'Plan Name'}
                </h4>

                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-blue-600">₹{formData.price}</span>
                  <span className="text-gray-500 text-sm">
                    / {formData.validity_days ? `${formData.validity_days} days` : 'lifetime'}
                  </span>
                </div>

                {formData.description && (
                  <p className="text-sm text-gray-600 mb-3">{formData.description}</p>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Includes:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {formData.subjects.length === 0 ? (
                      <li className="text-gray-400">No subjects selected</li>
                    ) : (
                      formData.subjects.map(subjectId => {
                        const subject = subjects.find(s => s.id === subjectId);
                        return subject ? (
                          <li key={subjectId}>✓ {subject.name}</li>
                        ) : null;
                      })
                    )}
                  </ul>
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanTemplateEditor;
