import React, { useEffect, useState } from 'react';
import logger from '@/lib/logger';
import { adminService } from '../lib/adminService';
import { DollarSign, Save, X, Edit2, Info } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  price: number;
  validity_days: number | null;
  created_at: string;
}

const SubjectPricing = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    price: 0,
    validity_days: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectsResponse = await adminService.getSubjects();
      // Filter out special exams if needed, generally we want to price all regular subjects
      setSubjects(subjectsResponse);
    } catch (error) {
      logger.error('Error loading data:', error);
      alert('Failed to load subjects data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditForm({
      price: subject.price || 0,
      validity_days: subject.validity_days,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ price: 0, validity_days: 30 });
  };

  const handleSave = async (subject: Subject) => {
    try {
      if (editForm.price < 0) {
        alert('Price must be positive');
        return;
      }

      if (editForm.validity_days !== null && editForm.validity_days < 1) {
        alert('Validity must be at least 1 day or leave empty for lifetime');
        return;
      }

      // We must pass name/description back because updateSubject expects them
      await adminService.updateSubject(
          subject.id,
          subject.name,
          subject.description,
          editForm.price,
          editForm.validity_days
      );
      
      await loadData();
      setEditingId(null);
      alert('Pricing updated successfully!');
    } catch (error) {
      logger.error('Error saving pricing:', error);
      alert('Failed to save pricing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subject Pricing</h1>
        <p className="text-gray-600 mt-1">Configure pricing and validity for individual subjects</p>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subjects.map((subject) => {
              const isEditing = editingId === subject.id;

              return (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      {subject.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{subject.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                        min="0"
                        step="1"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {subject.price ? `₹${subject.price}` : <span className="text-gray-400">Not set</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editForm.validity_days ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, validity_days: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary"
                          min="1"
                          placeholder="Lifetime"
                        />
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-900">
                         {subject.validity_days ? `${subject.validity_days} days` : 'Lifetime'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(subject)}
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
                        onClick={() => handleEdit(subject)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={18} />
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
        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Info size={16} />
          Pricing Tips
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
          <li>Set competitive prices for individual subjects.</li>
          <li>Leave validity empty for <strong>Lifetime Access</strong>.</li>
          <li>Students can purchase individual subjects or bundled plans.</li>
          <li>Data is now synchronized directly with the subject catalog.</li>
        </ul>
      </div>
    </div>
  );
};

export default SubjectPricing;
