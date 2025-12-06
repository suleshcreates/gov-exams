import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { adminService } from '../lib/adminService';
import { DollarSign, Save, X, Edit2, Check, XCircle } from 'lucide-react';

interface SubjectPricingData {
  id: string;
  subject_id: string;
  price: number;
  validity_days: number | null;
  is_active: boolean;
  subject?: {
    id: string;
    name: string;
    description: string;
  };
}

const SubjectPricing = () => {
  const [pricingData, setPricingData] = useState<SubjectPricingData[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    price: 0,
    validity_days: 30,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pricingResponse, subjectsResponse] = await Promise.all([
        adminService.getSubjectPricing(),
        adminService.getSubjects(),
      ]);

      setPricingData(pricingResponse);
      setSubjects(subjectsResponse);
    } catch (error) {
      logger.error('Error loading data:', error);
      alert('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pricing: SubjectPricingData) => {
    setEditingId(pricing.subject_id);
    setEditForm({
      price: pricing.price,
      validity_days: pricing.validity_days,
      is_active: pricing.is_active,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ price: 0, validity_days: 30, is_active: true });
  };

  const handleSave = async (subjectId: string) => {
    try {
      if (editForm.price < 0) {
        alert('Price must be positive');
        return;
      }

      if (editForm.validity_days !== null && editForm.validity_days < 1) {
        alert('Validity must be at least 1 day or leave empty for lifetime');
        return;
      }

      await adminService.updateSubjectPricing(subjectId, editForm);
      await loadData();
      setEditingId(null);
      alert('Pricing updated successfully!');
    } catch (error) {
      logger.error('Error saving pricing:', error);
      alert('Failed to save pricing');
    }
  };

  const handleToggleStatus = async (subjectId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleSubjectPricingStatus(subjectId, !currentStatus);
      await loadData();
    } catch (error) {
      logger.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
  };

  const handleAddPricing = async (subjectId: string) => {
    try {
      await adminService.updateSubjectPricing(subjectId, {
        price: 199,
        validity_days: 30,
        is_active: true,
      });
      await loadData();
      alert('Pricing added successfully!');
    } catch (error) {
      logger.error('Error adding pricing:', error);
      alert('Failed to add pricing');
    }
  };

  const getPricingForSubject = (subjectId: string) => {
    return pricingData.find(p => p.subject_id === subjectId);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subject Pricing</h1>
        <p className="text-gray-600 mt-1">Configure pricing for individual subjects</p>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject) => {
              const pricing = getPricingForSubject(subject.id);
              const isEditing = editingId === subject.id;

              return (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      {subject.description && (
                        <div className="text-sm text-gray-500">{subject.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {pricing ? (
                      isEditing ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                          className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">₹{pricing.price}</span>
                      )
                    ) : (
                      <span className="text-sm text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {pricing ? (
                      isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editForm.validity_days || ''}
                            onChange={(e) => setEditForm({ ...editForm, validity_days: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            min="1"
                            placeholder="Lifetime"
                          />
                          <span className="text-sm text-gray-500">days</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {pricing.validity_days ? `${pricing.validity_days} days` : 'Lifetime'}
                        </span>
                      )
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {pricing ? (
                      isEditing ? (
                        <select
                          value={editForm.is_active ? 'active' : 'inactive'}
                          onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(subject.id, pricing.is_active)}
                          className="flex items-center gap-1"
                        >
                          {pricing.is_active ? (
                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              <Check size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              <XCircle size={14} />
                              Inactive
                            </span>
                          )}
                        </button>
                      )
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {pricing ? (
                      isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(subject.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(pricing)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleAddPricing(subject.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Pricing
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No subjects found</p>
            <p className="text-gray-400 text-sm mt-2">Create subjects first to set pricing</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Pricing Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set competitive prices for individual subjects</li>
          <li>• Leave validity empty for lifetime access</li>
          <li>• Inactive pricing won't be shown to students</li>
          <li>• Students can purchase individual subjects or bundled plans</li>
        </ul>
      </div>
    </div>
  );
};

export default SubjectPricing;
