import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Layers, Loader2, ChevronDown } from "lucide-react";
import { adminService } from "../lib/adminService";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export default function AdminTopicsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_index: 1
  });

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      loadTopics(selectedSubjectId);
    } else {
      setTopics([]);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      setTopicsLoading(true);
      const data = await adminService.getTopics(subjectId);
      setTopics(data);
    } catch (error) {
      toast.error("Failed to load topics");
    } finally {
      setTopicsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingTopic(null);
    setFormData({
      title: "",
      description: "",
      order_index: (topics.length || 0) + 1
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description || "",
      order_index: topic.order_index
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Topic title is required");
      return;
    }

    try {
      setSaving(true);
      if (editingTopic) {
        await adminService.updateTopic(editingTopic.id, {
          title: formData.title,
          description: formData.description,
          order_index: formData.order_index,
          video_url: "",
          video_duration: 0,
          pdf_url: ""
        });
        toast.success("Topic updated");
      } else {
        await adminService.createTopic({
          subject_id: selectedSubjectId,
          title: formData.title,
          description: formData.description,
          order_index: formData.order_index,
          video_url: "",
          video_duration: 0,
          pdf_url: ""
        });
        toast.success("Topic created");
      }
      setIsModalOpen(false);
      resetForm();
      loadTopics(selectedSubjectId);
    } catch (error) {
      toast.error("Failed to save topic");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this topic? This will also remove associated content.")) return;

    try {
      await adminService.deleteTopic(id);
      toast.success("Topic deleted");
      loadTopics(selectedSubjectId);
    } catch (error) {
      toast.error("Failed to delete topic");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-600 mt-1">Manage topics for each subject</p>
        </div>
      </div>

      {/* Subject Dropdown */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
        <div className="relative">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select a Subject --</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Topics List */}
      {selectedSubjectId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Topics ({topics.length})
            </h2>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>

          {topicsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : topics.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Layers className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No topics yet</p>
              <p className="text-gray-400 mt-2">Create topics for this subject</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {topic.order_index}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{topic.title}</h3>
                      {topic.description && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{topic.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(topic)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {!selectedSubjectId && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Layers className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Select a subject first</p>
          <p className="text-gray-400 mt-2">Choose a subject from the dropdown to manage its topics</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTopic ? "Edit Topic" : "Create New Topic"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Introduction to Calculus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief overview..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={1}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : editingTopic ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
