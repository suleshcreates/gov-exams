import React, { useEffect, useState } from 'react';
import { MessageSquare, Mail, Clock, CheckCircle, Send, Eye, X, Archive, RefreshCw, User, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://gov-exams-1.onrender.com';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'closed';
    admin_reply?: string;
    replied_at?: string;
    created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-100' },
    read: { label: 'Read', color: 'text-yellow-700', bg: 'bg-yellow-100' },
    replied: { label: 'Replied', color: 'text-green-700', bg: 'bg-green-100' },
    closed: { label: 'Closed', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const AdminMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadMessages();
    }, [activeFilter]);

    const getToken = () => localStorage.getItem('admin_token');

    const loadMessages = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const res = await fetch(
                `${API_URL}/api/admin/messages?status=${activeFilter}&limit=50`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setMessages(data.data || []);
            setTotalCount(data.total || 0);
        } catch (err) {
            console.error('Error loading messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const token = getToken();
            await fetch(`${API_URL}/api/admin/messages/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            loadMessages();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        try {
            setReplying(true);
            const token = getToken();
            const res = await fetch(`${API_URL}/api/admin/messages/${id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reply: replyText })
            });
            if (res.ok) {
                setReplyText('');
                setExpandedId(null);
                loadMessages();
            }
        } catch (err) {
            console.error('Error sending reply:', err);
        } finally {
            setReplying(false);
        }
    };

    const handleExpand = (msg: ContactMessage) => {
        if (expandedId === msg.id) {
            setExpandedId(null);
            setReplyText('');
            return;
        }
        setExpandedId(msg.id);
        setReplyText('');
        // Mark as read if it is new
        if (msg.status === 'new') {
            handleStatusUpdate(msg.id, 'read');
        }
    };

    const filters = ['all', 'new', 'read', 'replied', 'closed'];

    const newCount = messages.filter(m => m.status === 'new').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <MessageSquare className="text-indigo-600" size={28} />
                        Messages
                        {newCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {newCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-1">Manage user contact messages and replies</p>
                </div>
                <button
                    onClick={loadMessages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-3">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            activeFilter === f
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {f === 'all' ? `All (${totalCount})` : f}
                    </button>
                ))}
            </div>

            {/* Messages List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-700">No messages</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {activeFilter === 'all' ? 'No contact messages yet' : `No ${activeFilter} messages`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map(msg => {
                        const isExpanded = expandedId === msg.id;
                        const sc = statusConfig[msg.status] || statusConfig.new;
                        return (
                            <div
                                key={msg.id}
                                className={`bg-white rounded-xl border transition-all ${
                                    msg.status === 'new'
                                        ? 'border-blue-200 shadow-sm shadow-blue-50'
                                        : 'border-gray-100'
                                } ${isExpanded ? 'shadow-lg ring-1 ring-indigo-100' : 'hover:shadow-md'}`}
                            >
                                {/* Message Header Row */}
                                <div
                                    className="flex items-center gap-4 p-4 cursor-pointer"
                                    onClick={() => handleExpand(msg)}
                                >
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        msg.status === 'new' ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}>
                                        <User size={18} className={msg.status === 'new' ? 'text-blue-600' : 'text-gray-500'} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 text-sm">{msg.name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sc.bg} ${sc.color}`}>
                                                {sc.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 font-medium truncate mt-0.5">{msg.subject}</p>
                                        <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                                    </div>

                                    {/* Meta */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock size={12} />
                                            {new Date(msg.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-0.5">{msg.email}</div>
                                    </div>

                                    {/* Expand chevron */}
                                    <div className="flex-shrink-0 text-gray-400">
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50/50">
                                        {/* Full Message */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</h4>
                                            <div className="bg-white p-4 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {msg.message}
                                            </div>
                                        </div>

                                        {/* Contact Details */}
                                        <div className="flex gap-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <Mail size={14} className="text-indigo-500" />
                                                <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                                            </div>
                                            {msg.phone && (
                                                <div className="flex items-center gap-1.5 text-gray-600">
                                                    <span className="text-indigo-500">📞</span>
                                                    {msg.phone}
                                                </div>
                                            )}
                                        </div>

                                        {/* Previous Reply */}
                                        {msg.admin_reply && (
                                            <div>
                                                <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                    <CheckCircle size={12} /> Your Reply
                                                </h4>
                                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-sm text-gray-700 whitespace-pre-wrap">
                                                    {msg.admin_reply}
                                                </div>
                                                {msg.replied_at && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
                                                        Replied on {new Date(msg.replied_at).toLocaleString('en-IN')}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Reply Box */}
                                        {msg.status !== 'closed' && (
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                    {msg.admin_reply ? 'Send Another Reply' : 'Reply'}
                                                </h4>
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder={`Reply to ${msg.name}...`}
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                                    rows={4}
                                                />
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(msg.id, 'closed')}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            <Archive size={14} /> Close
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReply(msg.id)}
                                                        disabled={!replyText.trim() || replying}
                                                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Send size={14} />
                                                        {replying ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {msg.status === 'closed' && (
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-400 italic">This conversation is closed.</p>
                                                <button
                                                    onClick={() => handleStatusUpdate(msg.id, 'read')}
                                                    className="text-xs text-indigo-600 hover:underline font-medium"
                                                >
                                                    Reopen
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
