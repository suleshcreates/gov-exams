import React, { useEffect, useState } from 'react';
import { adminService } from '../lib/adminService';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryPlan {
    id: string;
    category: string;
    title: string;
    description: string;
    price: number;
    is_active: boolean;
    exams_count: number;
    created_at: string;
    updated_at: string;
}

const AdminCategoryPlans = () => {
    const [plans, setPlans] = useState<CategoryPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<CategoryPlan | null>(null);
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        price: 0,
        is_active: true
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        loadPlans();
        loadCategories();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCategoryPlans();
            setPlans(data || []);
        } catch (error) {
            console.error('Error loading category plans:', error);
            toast.error('Failed to load category plans');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/categories`);
            const data = await response.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            category: categories[0] || '',
            title: '',
            description: '',
            price: 0,
            is_active: true
        });
        setShowModal(true);
    };

    const openEditModal = (plan: CategoryPlan) => {
        setEditingPlan(plan);
        setFormData({
            category: plan.category,
            title: plan.title,
            description: plan.description || '',
            price: plan.price,
            is_active: plan.is_active
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.category || !formData.title) {
            toast.error('Category and title are required');
            return;
        }

        try {
            if (editingPlan) {
                await adminService.updateCategoryPlan(editingPlan.id, formData);
                toast.success('Category plan updated');
            } else {
                await adminService.createCategoryPlan(formData);
                toast.success('Category plan created');
            }
            setShowModal(false);
            loadPlans();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete plan "${title}"? This won't affect existing purchases.`)) return;

        try {
            await adminService.deleteCategoryPlan(id);
            toast.success('Category plan deleted');
            loadPlans();
        } catch (error) {
            toast.error('Failed to delete plan');
        }
    };

    const handleToggleActive = async (plan: CategoryPlan) => {
        try {
            await adminService.updateCategoryPlan(plan.id, { is_active: !plan.is_active });
            toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated');
            loadPlans();
        } catch (error) {
            toast.error('Failed to update plan status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Category Plans</h1>
                    <p className="text-gray-600 mt-1">
                        Create plans that give access to all exams in a category — including future ones.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Create Plan
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Package size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                    <strong>How it works:</strong> A category plan grants access to every special exam matching that category.
                    When you add new exams to the same category, plan holders automatically get access. Students still get 10 attempts per exam.
                </div>
            </div>

            {/* Plans Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {plans.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No Category Plans Yet</h3>
                        <p className="text-gray-400 text-sm">Create your first plan to offer bundled category access.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{plan.title}</div>
                                        {plan.description && (
                                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{plan.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                                            <Tag size={12} />
                                            {plan.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{plan.price}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 font-medium">{plan.exams_count} exams</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            plan.is_active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(plan.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(plan)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    plan.is_active 
                                                        ? 'text-yellow-600 hover:bg-yellow-50' 
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={plan.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {plan.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id, plan.title)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingPlan ? 'Edit Category Plan' : 'Create Category Plan'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Category *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    Must match the category used in Special Exams exactly.
                                </p>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Plan Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. MPSC Prelims Complete Pack"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Access all exams in this category including upcoming ones"
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Price (₹)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formData.price}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, price: Number(val) || 0 });
                                    }}
                                    placeholder="e.g. 99"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${
                                        formData.is_active ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                        formData.is_active ? 'translate-x-[22px]' : 'translate-x-0.5'
                                    }`} />
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                    {formData.is_active ? 'Active (visible to students)' : 'Inactive (hidden)'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryPlans;
