import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { ShieldCheck, Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import { studentService } from '@/lib/studentService';

interface SecurePDFViewerProps {
    type?: 'pyq' | 'topic';
}

const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({ type = 'pyq' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBlur, setShowBlur] = useState(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    // PDF state
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    const containerRef = useRef<HTMLDivElement>(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    // ============================================
    // FETCH SECURE PDF URL
    // ============================================
    useEffect(() => {
        const fetchSecureUrl = async () => {
            try {
                // Wait for auth to finish loading
                if (auth.loading) return;

                if (!auth.isAuthenticated || !auth.user) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }

                if (type === 'topic') {
                    // For topics, use the signed URL helper we added to provided service
                    const url = await studentService.getTopicPdfUrl(id!);
                    setPdfUrl(url);
                } else {
                    // Default PYQ behavior
                    const token = localStorage.getItem('access_token');
                    if (!token) {
                        setError('Authentication required');
                        setLoading(false);
                        return;
                    }

                    const response = await fetch(`${API_URL}/api/student/pyq/${id}/download`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setPdfUrl(data.downloadUrl);
                    } else {
                        setError('Failed to load secure document');
                    }
                }
            } catch (err) {
                console.error('Error fetching secure URL:', err);
                setError('Error loading document');
            } finally {
                setLoading(false);
            }
        };

        if (id && !auth.loading) {
            fetchSecureUrl();
        }
    }, [id, API_URL, auth.loading, auth.isAuthenticated, auth.user, type]);

    // ============================================
    // PROTECTION: Trigger blur and show warning
    // ============================================
    const triggerProtection = useCallback((message: string) => {
        setShowBlur(true);
        setWarningMessage(message);

        // Auto-hide after 3 seconds if window regains focus
        setTimeout(() => {
            if (document.hasFocus()) {
                setShowBlur(false);
                setWarningMessage(null);
            }
        }, 3000);
    }, []);

    // ============================================
    // PROTECTION: Clipboard Poisoning
    // ============================================
    const poisonClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText('');
        } catch (e) {
            // Clipboard access denied - silent fail
        }
    }, []);

    // ============================================
    // PROTECTION: Check Display Capture Permission
    // ============================================
    const checkDisplayCapture = useCallback(async () => {
        try {
            if ('permissions' in navigator) {
                const result = await navigator.permissions.query({ name: 'display-capture' as PermissionName });
                if (result.state === 'granted') {
                    triggerProtection('Screen sharing detected!');
                }
            }
        } catch (e) {
            // Permission API not supported - silent fail
        }
    }, [triggerProtection]);

    // ============================================
    // PROTECTION: Event Listeners Setup
    // ============================================
    useEffect(() => {
        // Check for screen sharing on mount
        checkDisplayCapture();

        // === KEYBOARD SHORTCUTS BLOCKING ===
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            // PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                triggerProtection('Screenshots are disabled!');
                return false;
            }

            // Mac screenshot shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
            if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(key)) {
                e.preventDefault();
                triggerProtection('Screenshots are disabled!');
                return false;
            }

            // Print: Ctrl+P / Cmd+P
            if ((e.ctrlKey || e.metaKey) && key === 'p') {
                e.preventDefault();
                triggerProtection('Printing is disabled!');
                return false;
            }

            // Save: Ctrl+S / Cmd+S
            if ((e.ctrlKey || e.metaKey) && key === 's') {
                e.preventDefault();
                triggerProtection('Saving is disabled!');
                return false;
            }

            // DevTools shortcuts
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
                e.preventDefault();
                return false;
            }
        };

        // Clipboard poisoning on PrintScreen release
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen') {
                poisonClipboard();
            }
        };

        // === CONTEXT MENU BLOCKING ===
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // === COPY BLOCKING ===
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            return false;
        };

        // === WINDOW BLUR (App switching / Screen recording tools) ===
        const handleBlur = () => {
            // Small delay to check if focus went to our own iframe
            setTimeout(() => {
                if (!document.hasFocus()) {
                    triggerProtection('Content hidden - Return to continue viewing');
                }
            }, 100);
        };

        // === WINDOW FOCUS ===
        const handleFocus = () => {
            setShowBlur(false);
            setWarningMessage(null);
        };

        // === VISIBILITY CHANGE (Tab switching) ===
        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerProtection('Tab inactive - Content protected');
            } else {
                setShowBlur(false);
                setWarningMessage(null);
            }
        };

        // === DRAG PREVENTION ===
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        // Add all event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('dragstart', handleDragStart);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('dragstart', handleDragStart);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [triggerProtection, poisonClipboard, checkDisplayCapture]);

    // ============================================
    // PDF CONTROLS
    // ============================================
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPage => Math.min(Math.max(1, prevPage + offset), numPages));
    };

    const zoom = (delta: number) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.5));
    };

    // Reset on URL change
    useEffect(() => {
        setPageNumber(1);
        setScale(1.0);
    }, [pdfUrl]);

    // ============================================
    // RENDER: Loading State
    // ============================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <span className="text-lg">Loading secure viewer...</span>
            </div>
        );
    }

    // ============================================
    // RENDER: Error State
    // ============================================
    if (error || !pdfUrl) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="text-center">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <p className="text-xl mb-4">{error || 'Document not found'}</p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER: Main Viewer
    // ============================================
    return (
        <div
            ref={containerRef}
            className="w-screen h-screen bg-gray-900 overflow-hidden flex flex-col relative select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
            {/* Security CSS */}
            <style>{`
                @media print {
                    * { display: none !important; visibility: hidden !important; }
                    body::after {
                        content: "Printing is disabled for security.";
                        display: block !important;
                        visibility: visible !important;
                        font-size: 24px;
                        text-align: center;
                        padding: 100px;
                        color: red;
                    }
                }
                .react-pdf__Page__canvas {
                    margin: 0 auto;
                }
                ::selection { background: transparent; }
                ::-moz-selection { background: transparent; }
            `}</style>

            {/* PROTECTION OVERLAY */}
            {showBlur && (
                <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center p-8">
                        <ShieldCheck className="w-24 h-24 mx-auto mb-6 text-yellow-500 animate-pulse" />
                        <h2 className="text-3xl font-bold text-white mb-3">Content Protected</h2>
                        <p className="text-gray-400 text-lg">{warningMessage || 'Return focus to continue viewing'}</p>
                        <p className="text-gray-600 text-sm mt-6">Click inside this window to resume</p>
                    </div>
                </div>
            )}

            {/* WATERMARK OVERLAY */}
            {auth.user && (
                <div
                    className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
                    style={{ opacity: 0.08 }}
                >
                    <div className="absolute inset-0 flex flex-wrap">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1/4 h-1/5 flex items-center justify-center"
                                style={{ transform: 'rotate(-30deg)' }}
                            >
                                <span className="text-white font-bold text-lg whitespace-nowrap">
                                    PROTECTED • {auth.user?.email}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TOOLBAR */}
            <div className="bg-gray-800 text-white py-2 px-4 flex items-center justify-between z-40 shadow-lg">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Secure Viewer</span>
                </div>

                {/* Page Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm">
                        Page {pageNumber} of {numPages || '...'}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => zoom(-0.25)}
                        disabled={scale <= 0.5}
                        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => zoom(0.25)}
                        disabled={scale >= 2.5}
                        className="p-2 hover:bg-gray-700 rounded disabled:opacity-50"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* PDF VIEWER */}
            <div
                className="flex-1 overflow-auto bg-gray-800 flex justify-center py-4"
                style={{ filter: showBlur ? 'blur(30px)' : 'none', transition: 'filter 0.2s' }}
            >
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center h-full text-white">
                            <Loader2 className="w-8 h-8 animate-spin mr-2" />
                            Loading PDF...
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center h-full text-red-400">
                            Failed to load PDF. Please try again.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}  // SECURITY: Disable text selection
                        renderAnnotationLayer={false}  // SECURITY: Disable links/forms
                        className="shadow-2xl"
                    />
                </Document>
            </div>
        </div>
    );
};

export default SecurePDFViewer;
