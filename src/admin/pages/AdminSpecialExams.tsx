import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../lib/adminService';
import { Plus, Edit, Trash2, FileText, Eye, EyeOff, Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface SpecialExam {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    total_questions: number;
    sets_count: number;
    time_limit_minutes: number;
    is_active: boolean;
    thumbnail_url: string;
    created_at: string;
}

const AdminSpecialExams = () => {
    const [exams, setExams] = useState<SpecialExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState<SpecialExam | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: 0,
        time_limit_minutes: 30,
        thumbnail_url: ''
    });

    useEffect(() => {
        loadExams();
    }, []);

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        try {
            const publicUrl = await adminService.uploadSpecialExamThumbnail(file, (p) => {
                setUploadProgress(Math.round(p));
            });
            setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }));
            toast.success("Thumbnail uploaded successfully");
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            toast.error("Failed to upload thumbnail");
        } finally {
            setUploading(false);
        }
    };

    const loadExams = async () => {
        try {
            const token = localStorage.getItem('admin_access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/public/special-exams`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setExams(data || []);
        } catch (error) {
            console.error('Error loading exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_access_token');
            const url = editingExam
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/special-exams/${editingExam.id}`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/special-exams`;

            const response = await fetch(url, {
                method: editingExam ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save');
            }

            setShowModal(false);
            setEditingExam(null);
            setFormData({ title: '', description: '', category: '', price: 0, time_limit_minutes: 30, thumbnail_url: '' });
            loadExams();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this exam? This will also delete all associated question sets.')) return;

        try {
            const token = localStorage.getItem('admin_access_token');
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/special-exams/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadExams();
        } catch (error) {
            console.error('Error deleting exam:', error);
        }
    };

    const handleToggleActive = async (exam: SpecialExam) => {
        try {
            const token = localStorage.getItem('admin_access_token');
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/special-exams/${exam.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: !exam.is_active })
            });
            loadExams();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const openEditModal = (exam: SpecialExam) => {
        setEditingExam(exam);
        setFormData({
            title: exam.title,
            description: exam.description || '',
            category: exam.category || '',
            price: exam.price,
            time_limit_minutes: exam.time_limit_minutes,
            thumbnail_url: exam.thumbnail_url || ''
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Special Exams</h1>
                    <p className="text-gray-600 mt-1">Manage premium 100-question exams (5 sets of 20 questions)</p>
                </div>
                <button
                    onClick={() => {
                        setEditingExam(null);
                        setFormData({ title: '', description: '', category: '', price: 0, time_limit_minutes: 30, thumbnail_url: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Add Exam
                </button>
            </div>

            {/* Exams Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {exams.map((exam) => (
                            <tr key={exam.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {exam.thumbnail_url ? (
                                            <img src={exam.thumbnail_url} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{exam.title}</div>
                                            <div className="text-sm text-gray-500">{exam.total_questions} questions • {exam.sets_count} sets</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{exam.category || '-'}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{exam.price}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleActive(exam)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${exam.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {exam.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {exam.is_active ? 'Active' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/admin/special-exams/${exam.id}/sets`} className="text-blue-600 hover:text-blue-800 text-sm">
                                            Manage Sets
                                        </Link>
                                        <button onClick={() => openEditModal(exam)} className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(exam.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {exams.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">No special exams yet</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingExam ? 'Edit Exam' : 'Add Exam'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., MPSC"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                                <div className="space-y-3">
                                    {formData.thumbnail_url ? (
                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                                            <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {uploading ? (
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={uploading} />
                                        </label>
                                    )}

                                    {uploading && (
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time per Set (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.time_limit_minutes}
                                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 30 })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    min="1"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingExam ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSpecialExams;
