import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { adminService } from '../lib/adminService';
import { Search, Filter, Plus, Edit, XCircle, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';

interface UserPlan {
  id: string;
  student_id: string;
  student_name: string;
  student_phone: string;
  plan_name: string;
  price_paid: number;
  exam_access: string[];
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
}

const UserPlans = () => {
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showManualPlanModal, setShowManualPlanModal] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'active' | 'expired',
    studentSearch: '',
  });

  useEffect(() => {
    loadPlans();
  }, [page, filters]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserPlans(page, 20, {
        status: filters.status,
        studentSearch: filters.studentSearch || undefined,
      });
      setPlans(data.plans);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      logger.error('Error loading user plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleDeactivate = async (id: string, planName: string) => {
    if (!confirm(`Are you sure you want to deactivate the plan "${planName}"?`)) {
      return;
    }

    try {
      await adminService.deactivateUserPlan(id);
      loadPlans();
    } catch (error) {
      logger.error('Error deactivating plan:', error);
      alert('Failed to deactivate plan');
    }
  };

  const isPlanActive = (plan: UserPlan) => {
    if (!plan.is_active) return false;
    if (!plan.expires_at) return true;
    return new Date(plan.expires_at) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Plans</h1>
          <p className="text-gray-600 mt-1">Manage user subscriptions and access</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setShowManualPlanModal(true)}
        >
          <Plus size={20} />
          Add Manual Plan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>

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
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No plans found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Access</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchased</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans.map((plan) => {
                  const isActive = isPlanActive(plan);
                  return (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plan.student_name}</div>
                          <div className="text-sm text-gray-500">{plan.student_phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.plan_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{plan.price_paid}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {plan.exam_access && plan.exam_access.length > 0 ? (
                            <>
                              {plan.exam_access.slice(0, 3).map((exam, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                  {exam}
                                </span>
                              ))}
                              {plan.exam_access.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{plan.exam_access.length - 3} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No exams</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(plan.purchased_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.expires_at ? new Date(plan.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert('Edit plan feature coming soon!')}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          {isActive && (
                            <button
                              onClick={() => handleDeactivate(plan.id, plan.plan_name)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && plans.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 20, total)}</span> of{' '}
              <span className="font-medium">{total}</span> plans
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

      {/* Summary Stats */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Plans</p>
                <p className="text-2xl font-bold">
                  {plans.filter(p => isPlanActive(p)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{plans.reduce((sum, p) => sum + p.price_paid, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CreditCard className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Price</p>
                <p className="text-2xl font-bold">
                  ₹{plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.price_paid, 0) / plans.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Manual Plan Modal */}
      {showManualPlanModal && (
        <ManualPlanModal
          onClose={() => setShowManualPlanModal(false)}
          onSuccess={() => {
            setShowManualPlanModal(false);
            loadPlans();
          }}
        />
      )}
    </div>
  );
};

// Manual Plan Modal Component
interface ManualPlanModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ManualPlanModal: React.FC<ManualPlanModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    plan_name: '',
    price_paid: 0,
    exam_access: [] as string[],
    expires_at: '',
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [examInput, setExamInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStudentSearch = async (search: string) => {
    setStudentSearch(search);
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await adminService.searchStudentsForPlan(search);
      setSearchResults(results);
    } catch (error) {
      logger.error('Error searching students:', error);
    }
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setFormData({ ...formData, student_id: student.id });
    setStudentSearch(student.name);
    setSearchResults([]);
  };

  const handleAddExam = () => {
    if (examInput.trim() && !formData.exam_access.includes(examInput.trim())) {
      setFormData({
        ...formData,
        exam_access: [...formData.exam_access, examInput.trim()],
      });
      setExamInput('');
    }
  };

  const handleRemoveExam = (exam: string) => {
    setFormData({
      ...formData,
      exam_access: formData.exam_access.filter(e => e !== exam),
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_id) {
      newErrors.student_id = 'Please select a student';
    }
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = 'Plan name is required';
    }
    if (formData.price_paid < 0) {
      newErrors.price_paid = 'Price must be positive';
    }
    if (formData.exam_access.length === 0) {
      newErrors.exam_access = 'At least one exam is required';
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
      await adminService.createManualPlan({
        student_id: formData.student_id,
        plan_name: formData.plan_name,
        price_paid: formData.price_paid,
        exam_access: formData.exam_access,
        expires_at: formData.expires_at || null,
      });
      alert('Plan created successfully!');
      onSuccess();
    } catch (error) {
      logger.error('Error creating plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Manual Plan</h2>
          <p className="text-sm text-gray-600 mt-1">Create a plan for a student manually</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student *
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => handleStudentSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.student_id ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.student_id && (
              <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>
            )}
            {selectedStudent && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                Selected: <span className="font-medium">{selectedStudent.name}</span> ({selectedStudent.email})
              </div>
            )}
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              value={formData.plan_name}
              onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
              placeholder="e.g., Premium Plan, Basic Plan"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.plan_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.plan_name && (
              <p className="mt-1 text-sm text-red-600">{errors.plan_name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              value={formData.price_paid}
              onChange={(e) => setFormData({ ...formData, price_paid: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price_paid ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price_paid && (
              <p className="mt-1 text-sm text-red-600">{errors.price_paid}</p>
            )}
          </div>

          {/* Exam Access */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Access *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={examInput}
                onChange={(e) => setExamInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExam())}
                placeholder="Enter exam ID (e.g., MPSC-2024)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddExam}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.exam_access.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.exam_access.map((exam, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {exam}
                    <button
                      type="button"
                      onClick={() => handleRemoveExam(exam)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.exam_access && (
              <p className="mt-1 text-sm text-red-600">{errors.exam_access}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty for lifetime access
            </p>
          </div>
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPlans;
