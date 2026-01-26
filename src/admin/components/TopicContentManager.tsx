import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Video, FileText, Plus, Trash2, Edit2, Loader2, List, Upload, FileQuestion
} from "lucide-react";
import { toast } from "sonner";
import { adminService } from "../lib/adminService";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface TopicContentManagerProps {
    isOpen: boolean;
    onClose: () => void;
    topic: { id: string; title: string; subject_id: string };
}

export default function TopicContentManager({ isOpen, onClose, topic }: TopicContentManagerProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("materials");
    const [materials, setMaterials] = useState<any[]>([]);
    const [sets, setSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState<"video" | "pdf">("video");
    const [materialTitle, setMaterialTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (isOpen && topic) {
            loadData();
        }
    }, [isOpen, topic]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [m, allSets] = await Promise.all([
                adminService.getTopicMaterials(topic.id),
                adminService.getQuestionSets(topic.subject_id)
            ]);
            setMaterials(m);
            // Filter sets for this topic
            setSets(allSets.filter((s: any) => s.topic_id === topic.id));
        } catch (error) {
            toast.error("Failed to load content");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !materialTitle) {
            toast.error("Please select a file and enter a title");
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            let url = "";

            if (uploadType === "video") {
                url = await adminService.uploadTopicVideo(selectedFile, (progress) => {
                    setUploadProgress(Math.round(progress));
                });
            } else {
                url = await adminService.uploadTopicPDF(selectedFile, (progress) => {
                    setUploadProgress(Math.round(progress));
                });
            }

            await adminService.createTopicMaterial({
                topic_id: topic.id,
                type: uploadType,
                title: materialTitle,
                url: url,
                order_index: materials.length + 1
            });

            toast.success(`${uploadType === 'video' ? 'Video' : 'PDF'} added successfully`);
            setMaterialTitle("");
            setSelectedFile(null);
            loadData();
        } catch (error) {
            toast.error("Failed to upload material");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteMaterial = async (id: string) => {
        if (!confirm("Delete this material?")) return;
        try {
            await adminService.deleteTopicMaterial(id);
            toast.success("Material deleted");
            loadData();
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    const handleCreateSet = async () => {
        try {
            const newSet = await adminService.createQuestionSet({
                subject_id: topic.subject_id,
                topic_id: topic.id,
                exam_id: topic.id.substring(0, 36),
                set_number: sets.length + 1,
                time_limit_minutes: 0
            });
            toast.success("New question set created");
            loadData();
            // Navigate to manage questions? Or let user stay here?
            // User requested to "insert multiple questions set", likely wants to create them then manage.
        } catch (error) {
            toast.error("Failed to create set");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Manage Content</h2>
                        <p className="text-slate-500">For Topic: {topic.title}</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="materials">Study Materials (Videos/PDFs)</TabsTrigger>
                        <TabsTrigger value="sets">Practice Question Sets</TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="space-y-6">
                        {/* Add Material Form */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold mb-4 text-slate-800 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add New Material
                            </h3>
                            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                    <select
                                        value={uploadType}
                                        onChange={(e) => setUploadType(e.target.value as "video" | "pdf")}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    >
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={materialTitle}
                                        onChange={(e) => setMaterialTitle(e.target.value)}
                                        placeholder="e.g. Lecture Part 1"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">File</label>
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept={uploadType === "video" ? "video/*" : "application/pdf"}
                                        className="w-full text-sm text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>

                                {isUploading && (
                                    <div className="md:col-span-12 mt-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Progress</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* List Materials */}
                        <div className="space-y-3">
                            {materials.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No materials added via this manager.</p>
                            ) : (
                                materials.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${item.type === 'video' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                                {item.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900">{item.title}</h4>
                                                <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View File</a>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteMaterial(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="sets" className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <h3 className="font-semibold text-slate-800">Practice Sets</h3>
                                <p className="text-sm text-slate-500">Manage multiple question sets for this topic</p>
                            </div>
                            <button
                                onClick={handleCreateSet}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Create New Set
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sets.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-slate-400">
                                    No question sets created yet.
                                </div>
                            ) : (
                                sets.map((set, idx) => (
                                    <div key={set.id} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                    {set.set_number || idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">Set {set.set_number}</h4>
                                                    <p className="text-xs text-slate-500">{set.time_limit_minutes ? `${set.time_limit_minutes} mins` : 'No time limit'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => adminService.deleteQuestionSet(set.id).then(() => { toast.success("Set deleted"); loadData(); })}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/admin/question-sets/${set.id}/questions`)}
                                            className="w-full py-2 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium rounded-lg text-sm border border-slate-200"
                                        >
                                            Manage Questions
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
