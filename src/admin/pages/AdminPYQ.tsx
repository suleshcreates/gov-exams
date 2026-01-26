import React, { useEffect, useState } from 'react';
import { FileText, Plus, Edit, Trash2, Upload, Eye, EyeOff, Download, Loader2 } from 'lucide-react';
import { adminService } from '../lib/adminService';

interface PYQ {
    id: string;
    title: string;
    description: string;
    category: string;
    year: number;
    price: number;
    pdf_url: string;
    thumbnail_url: string;
    page_count: number;
    file_size_mb: number;
    is_active: boolean;
    download_count: number;
    created_at: string;
}

const AdminPYQ = () => {
    const [pyqs, setPYQs] = useState<PYQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPYQ, setEditingPYQ] = useState<PYQ | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        year: new Date().getFullYear(),
        price: 0,
        pdf_url: '',
        page_count: 0,
        file_size_mb: 0
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        loadPYQs();
    }, []);

    const loadPYQs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/pyq`);
            const data = await response.json();
            setPYQs(data || []);
        } catch (error) {
            console.error('Error loading PYQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        try {
            const publicUrl = await adminService.uploadPYQ(file, (p) => {
                setUploadProgress(Math.round(p));
            });

            setFormData(prev => ({
                ...prev,
                pdf_url: publicUrl,
                file_size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2))
            }));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.pdf_url) {
            alert('Please upload a PDF file first');
            return;
        }

        try {
            const token = localStorage.getItem('admin_access_token');
            const url = editingPYQ
                ? `${API_URL}/api/admin/pyq/${editingPYQ.id}`
                : `${API_URL}/api/admin/pyq`;

            const response = await fetch(url, {
                method: editingPYQ ? 'PUT' : 'POST',
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
            setEditingPYQ(null);
            resetForm();
            loadPYQs();
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            year: new Date().getFullYear(),
            price: 0,
            pdf_url: '',
            page_count: 0,
            file_size_mb: 0
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this PYQ?')) return;

        try {
            const token = localStorage.getItem('admin_access_token');
            await fetch(`${API_URL}/api/admin/pyq/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadPYQs();
        } catch (error) {
            console.error('Error deleting PYQ:', error);
        }
    };

    const handleToggleActive = async (pyq: PYQ) => {
        try {
            const token = localStorage.getItem('admin_access_token');
            await fetch(`${API_URL}/api/admin/pyq/${pyq.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: !pyq.is_active })
            });
            loadPYQs();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const openEditModal = (pyq: PYQ) => {
        setEditingPYQ(pyq);
        setFormData({
            title: pyq.title,
            description: pyq.description || '',
            category: pyq.category || '',
            year: pyq.year || new Date().getFullYear(),
            price: pyq.price,
            pdf_url: pyq.pdf_url,
            page_count: pyq.page_count || 0,
            file_size_mb: pyq.file_size_mb || 0
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
                    <h1 className="text-3xl font-bold text-gray-900">PYQ PDFs</h1>
                    <p className="text-gray-600 mt-1">Manage premium Previous Year Question papers</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPYQ(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Add PYQ
                </button>
            </div>

            {/* PYQ Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pyqs.map((pyq) => (
                            <tr key={pyq.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{pyq.title}</div>
                                    <div className="text-sm text-gray-500">{pyq.page_count} pages • {pyq.file_size_mb} MB</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{pyq.category || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{pyq.year || '-'}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{pyq.price}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <span className="flex items-center gap-1">
                                        <Download size={14} /> {pyq.download_count || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleActive(pyq)}
                                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${pyq.is_active
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {pyq.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {pyq.is_active ? 'Active' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <a href={pyq.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                            View PDF
                                        </a>
                                        <button onClick={() => openEditModal(pyq)} className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(pyq.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pyqs.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">No PYQ PDFs yet</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingPYQ ? 'Edit PYQ' : 'Add PYQ'}</h2>
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
                                    rows={2}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                                    <input
                                        type="number"
                                        value={formData.page_count}
                                        onChange={(e) => setFormData({ ...formData, page_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File *</label>
                                {formData.pdf_url ? (
                                    <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-lg text-sm">
                                        <FileText size={16} />
                                        File uploaded ({formData.file_size_mb} MB)
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, pdf_url: '', file_size_mb: 0 })}
                                            className="ml-auto text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
                                            {uploading ? 'Uploading...' : 'Upload PDF'}
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>

                                        {uploading && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span>Upload Progress</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-blue-600 h-full transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                    disabled={uploading}
                                >
                                    {editingPYQ ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPYQ;
