import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { Plus, Edit, Trash2, CreditCard, Eye, EyeOff } from 'lucide-react';

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  validity_days: number | null;
  subjects: string[];
  is_active: boolean;
  display_order: number;
  badge: string | null;
  created_at: string;
}

const PlanTemplates = () => {
  const [plans, setPlans] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [showInactive]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPlanTemplates(showInactive);
      setPlans(data);
    } catch (error) {
      logger.error('Error loading plans:', error);
      alert('Failed to load plan templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deletePlanTemplate(id);
      await loadPlans();
      alert('Plan deleted successfully');
    } catch (error: any) {
      logger.error('Error deleting plan:', error);
      // Show helpful message if plan has been purchased
      if (error.message?.includes('purchased by users')) {
        alert('❌ Cannot delete this plan\n\nThis plan has already been purchased by users.\n\n💡 Instead, you can:\n• Deactivate the plan (toggle to Inactive)\n• This will hide it from new students\n• Existing subscribers will keep their access');
      } else {
        alert('Failed to delete plan: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.updatePlanTemplate(id, { is_active: !currentStatus });
      await loadPlans();
    } catch (error) {
      logger.error('Error toggling status:', error);
      alert('Failed to toggle status');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage subscription plans</p>
          <Link
            to="/admin/pricing/subjects"
            className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
          >
            → Manage Subject Pricing
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showInactive ? <Eye size={20} /> : <EyeOff size={20} />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
          <Link
            to="/admin/pricing/plans/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Plan
          </Link>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No plan templates yet</p>
          <p className="text-gray-400 mt-2">Create your first plan to get started</p>
          <Link
            to="/admin/pricing/plans/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Create Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const subjects = Array.isArray(plan.subjects) ? plan.subjects : JSON.parse(plan.subjects || '[]');

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${!plan.is_active ? 'opacity-60' : ''
                  }`}
              >
                <div className="p-6">
                  {/* Badge */}
                  {plan.badge && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Name & Price */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-blue-600">₹{plan.price}</span>
                      <span className="text-gray-500">
                        / {plan.validity_days ? `${plan.validity_days} days` : 'lifetime'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {plan.description && (
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  )}

                  {/* Subjects Count */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{subjects.length}</span> subject{subjects.length !== 1 ? 's' : ''} included
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <button
                      onClick={() => handleToggleStatus(plan.id, plan.is_active)}
                      className="w-full"
                    >
                      {plan.is_active ? (
                        <span className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
                          <Eye size={16} />
                          Active (Visible to students)
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                          <EyeOff size={16} />
                          Inactive (Hidden)
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/pricing/plans/${plan.id}/edit`}
                      className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      <Edit size={16} className="inline mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Display Order */}
                  <div className="mt-3 text-xs text-gray-400 text-center">
                    Display Order: {plan.display_order}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Plan Template Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Create bundled plans (Basic, Premium) with multiple subjects at discounted prices</li>
          <li>• Use badges like "POPULAR" or "BEST VALUE" to highlight plans</li>
          <li>• Set display order to control how plans appear to students</li>
          <li>• Inactive plans are hidden from students but existing subscriptions remain active</li>
        </ul>
      </div>
    </div>
  );
};

export default PlanTemplates;
